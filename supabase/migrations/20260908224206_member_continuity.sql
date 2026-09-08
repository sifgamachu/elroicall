-- Explicit, member-written continuity. No automatic extraction from calls or transcripts.
create table public.member_memory_settings (
 user_id uuid primary key references auth.users(id) on delete cascade,
 enabled boolean not null default false,
 revision integer not null default 0,
 updated_at timestamptz not null default now()
);
create table public.member_memory_notes (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('reflection','verse','prayer')),
 title text not null check(length(btrim(title)) between 1 and 80),
 body text not null check(length(btrim(body)) between 1 and 1200),
 version integer not null,
 consent_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index member_memory_notes_owner on public.member_memory_notes(user_id,updated_at desc);
create table public.member_memory_handoffs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 note_id uuid not null references public.member_memory_notes(id) on delete cascade,
 note_version integer not null,
 phone text not null,
 code_hash text not null unique check(code_hash ~ '^[0-9a-f]{64}$'),
 expires_at timestamptz not null default now()+interval '10 minutes',
 call_sid text unique,
 created_at timestamptz not null default now()
);
create index member_memory_handoffs_note on public.member_memory_handoffs(note_id);
create index member_memory_handoffs_expiry on public.member_memory_handoffs(expires_at);
alter table public.member_memory_settings enable row level security;
alter table public.member_memory_notes enable row level security;
alter table public.member_memory_handoffs enable row level security;
revoke all on public.member_memory_settings,public.member_memory_notes,public.member_memory_handoffs from public,anon,authenticated;
grant all on public.member_memory_settings,public.member_memory_notes,public.member_memory_handoffs to service_role;
create policy memory_settings_service on public.member_memory_settings for all to service_role using(true) with check(true);
create policy memory_notes_service on public.member_memory_notes for all to service_role using(true) with check(true);
create policy memory_handoffs_service on public.member_memory_handoffs for all to service_role using(true) with check(true);

create function public.member_memory_snapshot(p_user uuid) returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object('enabled',coalesce((select enabled from member_memory_settings where user_id=p_user),false),
  'revision',coalesce((select revision from member_memory_settings where user_id=p_user),0),
  'notes',coalesce((select jsonb_agg(jsonb_build_object('id',id,'kind',kind,'title',title,'body',body,'version',version,'updated_at',updated_at) order by updated_at desc,id) from member_memory_notes where user_id=p_user),'[]'::jsonb));
$$;

create function public.member_memory_change(p_user uuid,p_action text,p_revision integer,p_note jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path=public as $$
declare setting member_memory_settings; existing member_memory_notes; next_revision integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,4));
 insert into member_memory_settings(user_id) values(p_user) on conflict do nothing;
 select * into setting from member_memory_settings where user_id=p_user for update;
 if p_revision is distinct from setting.revision then raise exception 'Your saved notes changed on another screen. Refresh before trying again'; end if;
 next_revision:=setting.revision+1;
 if p_action='enable' then update member_memory_settings set enabled=true where user_id=p_user;
 elsif p_action='pause' then
  update member_memory_settings set enabled=false where user_id=p_user;
  delete from member_memory_handoffs where user_id=p_user;
 elsif p_action='clear' then
  delete from member_memory_handoffs where user_id=p_user;
  delete from member_memory_notes where user_id=p_user;
  update member_memory_settings set enabled=false where user_id=p_user;
 elsif p_action='delete' then
  delete from member_memory_notes where id=(p_note->>'id')::uuid and user_id=p_user;
  if not found then raise exception 'Note not found. Refresh your saved notes'; end if;
 elsif p_action='save' then
  if not setting.enabled then raise exception 'Turn on saved notes before saving'; end if;
  if p_note->'consent' is distinct from 'true'::jsonb then raise exception 'Confirm that you want to save this note'; end if;
  select * into existing from member_memory_notes where id=(p_note->>'id')::uuid and user_id=p_user;
  if existing.id is null and (select count(*) from member_memory_notes where user_id=p_user)>=40 then raise exception 'You can keep up to forty notes. Remove one before adding another'; end if;
  if exists(select 1 from member_memory_notes where id=(p_note->>'id')::uuid and user_id<>p_user) then raise exception 'Note unavailable'; end if;
  insert into member_memory_notes(id,user_id,kind,title,body,version)
  values((p_note->>'id')::uuid,p_user,p_note->>'kind',btrim(p_note->>'title'),btrim(p_note->>'body'),next_revision)
  on conflict(id) do update set kind=excluded.kind,title=excluded.title,body=excluded.body,version=excluded.version,updated_at=now(),consent_at=now()
  where member_memory_notes.user_id=p_user;
  if not found then raise exception 'Note unavailable'; end if;
  delete from member_memory_handoffs where note_id=(p_note->>'id')::uuid;
 else raise exception 'Unknown memory action'; end if;
 update member_memory_settings set revision=next_revision,updated_at=now() where user_id=p_user;
 return member_memory_snapshot(p_user);
end; $$;

create function public.member_memory_issue(p_user uuid,p_note uuid,p_revision integer,p_hash text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare item member_memory_notes; setting member_memory_settings; account portal_accounts; token member_memory_handoffs;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,4));
 select * into setting from member_memory_settings where user_id=p_user;
 if setting.enabled is distinct from true or setting.revision is distinct from p_revision then raise exception 'Refresh your notes before sharing one'; end if;
 select * into item from member_memory_notes where user_id=p_user and id=p_note;
 if not found then raise exception 'Note not found'; end if;
 select * into account from portal_accounts where user_id=p_user;
 if account.phone is null or not account.phone_verified then raise exception 'Verify your calling number in Preferences first'; end if;
 delete from member_memory_handoffs where expires_at<now() or user_id=p_user;
 insert into member_memory_handoffs(user_id,note_id,note_version,phone,code_hash)
 values(p_user,item.id,item.version,account.phone,p_hash) returning * into token;
 return jsonb_build_object('expires_at',token.expires_at,'phone_last4',right(account.phone,4));
end; $$;

create function public.member_memory_redeem(p_hash text,p_phone text,p_call text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare item member_memory_handoffs; note member_memory_notes;
begin
 if p_call !~ '^CA[0-9a-fA-F]{32}$' then return null; end if;
 select * into item from member_memory_handoffs where code_hash=p_hash and phone=p_phone for update;
 if not found or item.expires_at<now() or (item.call_sid is not null and item.call_sid<>p_call) then return null; end if;
 if not exists(select 1 from member_memory_settings where user_id=item.user_id and enabled) or not exists(select 1 from portal_accounts where user_id=item.user_id and phone=p_phone and phone_verified) then return null; end if;
 select * into note from member_memory_notes where id=item.note_id and user_id=item.user_id and version=item.note_version;
 if not found then return null; end if;
 if item.call_sid is null then update member_memory_handoffs set call_sid=p_call,expires_at=now()+interval '30 minutes' where id=item.id; end if;
 return jsonb_build_object('handoff_id',item.id,'note',jsonb_build_object('title',note.title,'body',note.body,'kind',note.kind));
end; $$;

create function public.member_memory_context(p_id uuid,p_call text)
returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object('title',n.title,'body',n.body,'kind',n.kind)
 from member_memory_handoffs h join member_memory_notes n on n.id=h.note_id and n.user_id=h.user_id and n.version=h.note_version
 join member_memory_settings s on s.user_id=h.user_id and s.enabled
 join portal_accounts a on a.user_id=h.user_id and a.phone=h.phone and a.phone_verified
 where h.id=p_id and h.call_sid=p_call and h.expires_at>now();
$$;
revoke all on function public.member_memory_snapshot(uuid),public.member_memory_change(uuid,text,integer,jsonb),public.member_memory_issue(uuid,uuid,integer,text),public.member_memory_redeem(text,text,text),public.member_memory_context(uuid,text) from public,anon,authenticated;
grant execute on function public.member_memory_snapshot(uuid),public.member_memory_change(uuid,text,integer,jsonb),public.member_memory_issue(uuid,uuid,integer,text),public.member_memory_redeem(text,text,text),public.member_memory_context(uuid,text) to service_role;

do $cleanup$ begin
 if exists(select 1 from pg_namespace where nspname='cron') then
  perform cron.schedule('elroi-memory-handoff-cleanup','17 * * * *','delete from public.member_memory_handoffs where expires_at < now()');
 end if;
end; $cleanup$;
