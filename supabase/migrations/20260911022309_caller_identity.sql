-- Browser users use authenticated Edge Functions; PIN material never leaves server code.
create table public.calling_security_settings(id boolean primary key default true check(id),enabled boolean not null default false);
insert into public.calling_security_settings(id) values(true);
create table public.calling_identities(
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check(length(btrim(nickname)) between 2 and 40),
 pin_salt text not null check(pin_salt ~ '^[0-9a-f]{32}$'),
 pin_digest text not null check(pin_digest ~ '^[0-9a-f]{64}$'),
 revision integer not null default 1,
 failed_attempts integer not null default 0,
 locked_until timestamptz,
 updated_at timestamptz not null default now()
);
create table public.calling_guest_passes(phone_hash text primary key,call_sid text not null unique,used_at timestamptz not null default now());
create table public.calling_access_sessions(
 call_sid text primary key check(call_sid ~ '^CA[0-9a-fA-F]{32}$'),
 phone text not null,
 kind text not null check(kind in ('inbound','outbound','lesson')),
 context_id uuid,
 user_id uuid references auth.users(id) on delete cascade,
 pin_revision integer,
 status text not null check(status in ('pending_pin','pending_guest','member','guest','signup','setup','blocked','ended')),
 duration_minutes integer not null check(duration_minutes in (5,10,15)),
 attempts integer not null default 0,
 relay_token uuid not null default gen_random_uuid(),
 deadline_at timestamptz,
 expires_at timestamptz not null default now()+interval '5 minutes',
 created_at timestamptz not null default now()
);
create index calling_access_owner on public.calling_access_sessions(user_id);
create index calling_access_expiry on public.calling_access_sessions(expires_at);
alter table public.calling_security_settings enable row level security;
alter table public.calling_identities enable row level security;
alter table public.calling_guest_passes enable row level security;
alter table public.calling_access_sessions enable row level security;
revoke all on public.calling_security_settings,public.calling_identities,public.calling_guest_passes,public.calling_access_sessions from public,anon,authenticated;
grant all on public.calling_security_settings,public.calling_identities,public.calling_guest_passes,public.calling_access_sessions to service_role;
create policy calling_settings_service on public.calling_security_settings for all to service_role using(true) with check(true);
create policy calling_identity_service on public.calling_identities for all to service_role using(true) with check(true);
create policy calling_guests_service on public.calling_guest_passes for all to service_role using(true) with check(true);
create policy calling_sessions_service on public.calling_access_sessions for all to service_role using(true) with check(true);

create function public.calling_security_enabled() returns boolean language sql stable security invoker set search_path=public as $$select coalesce((select enabled from calling_security_settings where id),false);$$;
create function public.calling_identity_snapshot(p_user uuid) returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object('nickname',coalesce(i.nickname,''),'pin_set',i.user_id is not null,'revision',coalesce(i.revision,0),'phone_verified',coalesce(a.phone_verified,false),'phone_last4',case when a.phone_verified then right(a.phone,4) end,'phone_ready',calling_security_enabled())
 from (select p_user as id) u left join calling_identities i on i.user_id=u.id left join portal_accounts a on a.user_id=u.id;
$$;
create function public.calling_identity_save(p_user uuid,p_nickname text,p_salt text,p_digest text,p_revision integer) returns jsonb language plpgsql security invoker set search_path=public as $$
declare current_revision integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,9));
 select revision into current_revision from calling_identities where user_id=p_user;
 if coalesce(current_revision,0) is distinct from p_revision then raise exception 'Your calling identity changed on another screen. Refresh before saving'; end if;
 insert into calling_identities(user_id,nickname,pin_salt,pin_digest,revision) values(p_user,btrim(p_nickname),p_salt,p_digest,p_revision+1)
 on conflict(user_id) do update set nickname=excluded.nickname,pin_salt=excluded.pin_salt,pin_digest=excluded.pin_digest,revision=excluded.revision,failed_attempts=0,locked_until=null,updated_at=now();
 update calling_access_sessions set status='ended' where user_id=p_user and status in ('member','pending_pin');
 return calling_identity_snapshot(p_user);
end; $$;

create function public.calling_access_begin(p_call text,p_phone text,p_kind text,p_context uuid default null) returns jsonb language plpgsql security invoker set search_path=public as $$
declare s calling_access_sessions; owner_id uuid; identity calling_identities; minutes integer:=10; state text; valid_context boolean:=false;
begin
 if not calling_security_enabled() then return jsonb_build_object('status','disabled'); end if;
 if p_call !~ '^CA[0-9a-fA-F]{32}$' or p_phone !~ '^\+[1-9][0-9]{7,14}$' or p_kind not in ('inbound','outbound','lesson') then raise exception 'Invalid call'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_phone,10));
 select * into s from calling_access_sessions where call_sid=p_call;
 if found then
  if s.phone<>p_phone or s.kind<>p_kind or s.context_id is distinct from p_context then raise exception 'Call identity mismatch'; end if;
  return to_jsonb(s)-'phone';
 end if;
 select user_id into owner_id from portal_accounts where phone=p_phone and phone_verified limit 1;
 if owner_id is not null then
  select * into identity from calling_identities where user_id=owner_id;
  select coalesce((select duration_minutes from member_preferences where user_id=owner_id),10) into minutes;
  state:=case when identity.user_id is null then 'setup' else 'pending_pin' end;
 elsif p_kind<>'inbound' or exists(select 1 from calling_guest_passes where phone_hash=encode(sha256(convert_to(p_phone,'UTF8')),'hex')) or exists(select 1 from callers c join calls h on h.caller_id=c.id where c.phone=p_phone) then state:='signup';
 else state:='pending_guest'; end if;
 if p_kind='outbound' then
  select exists(select 1 from call_schedules where id=p_context and phone=p_phone and active) into valid_context;
  if not valid_context then state:='blocked'; end if;
 elsif p_kind='lesson' then
  select p.duration_minutes into minutes from lesson_jobs j join lesson_schedules p on p.id=j.schedule_id where j.id=p_context and j.call_sid=p_call and p.phone=p_phone and p.user_id=owner_id and p.active;
  if not found then state:='blocked';minutes:=10; end if;
 end if;
 insert into calling_access_sessions(call_sid,phone,kind,context_id,user_id,pin_revision,status,duration_minutes)
 values(p_call,p_phone,p_kind,p_context,owner_id,identity.revision,state,minutes) returning * into s;
 return to_jsonb(s)-'phone';
end; $$;

create function public.calling_access_get(p_call text) returns jsonb language sql stable security invoker set search_path=public as $$
 select to_jsonb(s)||jsonb_build_object('pin_salt',case when s.status='pending_pin' then i.pin_salt end,'nickname',case when s.status='member' then i.nickname end)
 from calling_access_sessions s left join calling_identities i on i.user_id=s.user_id where s.call_sid=p_call and s.expires_at>now();
$$;
create function public.calling_access_verify(p_call text,p_salt text default null,p_digest text default null,p_guest boolean default false) returns jsonb language plpgsql security invoker set search_path=public as $$
declare s calling_access_sessions; identity calling_identities; consumed text; failures integer;
begin
 if not calling_security_enabled() then return jsonb_build_object('status','blocked'); end if;
 select * into s from calling_access_sessions where call_sid=p_call;
 if not found then return jsonb_build_object('status','blocked'); end if;
 if s.user_id is not null then perform pg_advisory_xact_lock(hashtextextended(s.user_id::text,9)); end if;
 select * into s from calling_access_sessions where call_sid=p_call for update;
 if s.expires_at<=now() or s.status not in ('pending_guest','pending_pin') then return jsonb_build_object('status','blocked'); end if;
 if s.status='pending_guest' and p_guest then
  insert into calling_guest_passes(phone_hash,call_sid) values(encode(sha256(convert_to(s.phone,'UTF8')),'hex'),p_call) on conflict(phone_hash) do nothing returning call_sid into consumed;
  if consumed is null then update calling_access_sessions set status='signup' where call_sid=p_call;return jsonb_build_object('status','signup'); end if;
  update calling_access_sessions set status='guest',deadline_at=now()+make_interval(mins=>duration_minutes),expires_at=now()+make_interval(mins=>duration_minutes) where call_sid=p_call;
 elsif s.status='pending_pin' and not p_guest then
  select * into identity from calling_identities where user_id=s.user_id for update;
  if identity.user_id is null or identity.revision is distinct from s.pin_revision or not exists(select 1 from portal_accounts where user_id=s.user_id and phone=s.phone and phone_verified) then return jsonb_build_object('status','blocked'); end if;
  if s.attempts>=3 or identity.locked_until>now() then return jsonb_build_object('status','locked'); end if;
  if p_salt is distinct from identity.pin_salt or p_digest is distinct from identity.pin_digest then
   failures:=case when identity.locked_until is not null and identity.locked_until<=now() then 1 else identity.failed_attempts+1 end;
   update calling_identities set failed_attempts=failures,locked_until=case when failures>=5 then now()+interval '15 minutes' else null end where user_id=s.user_id;
   update calling_access_sessions set attempts=attempts+1 where call_sid=p_call;
   return jsonb_build_object('status',case when failures>=5 or s.attempts+1>=3 then 'locked' else 'wrong_pin' end);
  end if;
  update calling_identities set failed_attempts=0,locked_until=null where user_id=s.user_id;
  update calling_access_sessions set status='member',deadline_at=now()+make_interval(mins=>duration_minutes),expires_at=now()+make_interval(mins=>duration_minutes) where call_sid=p_call;
 else return jsonb_build_object('status','blocked'); end if;
 return calling_access_get(p_call);
end; $$;

create function public.calling_access_permit(p_call text,p_token uuid) returns jsonb language sql stable security invoker set search_path=public as $$
 select to_jsonb(s)||jsonb_build_object('nickname',case when s.status='member' then i.nickname end)
 from calling_access_sessions s left join calling_identities i on i.user_id=s.user_id
 where calling_security_enabled() and s.call_sid=p_call and s.relay_token=p_token and s.deadline_at>now() and s.status in ('member','guest')
 and (s.status='guest' or (i.revision=s.pin_revision and exists(select 1 from portal_accounts a where a.user_id=s.user_id and a.phone=s.phone and a.phone_verified)));
$$;
create function public.calling_access_end(p_call text) returns void language sql security invoker set search_path=public as $$update calling_access_sessions set status='ended' where call_sid=p_call;$$;
revoke all on function public.calling_security_enabled(),public.calling_identity_snapshot(uuid),public.calling_identity_save(uuid,text,text,text,integer),public.calling_access_begin(text,text,text,uuid),public.calling_access_get(text),public.calling_access_verify(text,text,text,boolean),public.calling_access_permit(text,uuid),public.calling_access_end(text) from public,anon,authenticated;
grant execute on function public.calling_security_enabled(),public.calling_identity_snapshot(uuid),public.calling_identity_save(uuid,text,text,text,integer),public.calling_access_begin(text,text,text,uuid),public.calling_access_get(text),public.calling_access_verify(text,text,text,boolean),public.calling_access_permit(text,uuid),public.calling_access_end(text) to service_role;
do $cleanup$ begin
 if exists(select 1 from pg_namespace where nspname='cron') then
  perform cron.schedule('elroi-calling-access-cleanup','23 * * * *','delete from public.calling_access_sessions where expires_at < now() - interval ''1 day''');
 end if;
end; $cleanup$;
