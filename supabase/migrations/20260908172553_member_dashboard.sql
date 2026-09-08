-- Member data is served through authenticated Edge Functions only.
create table public.member_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check(length(display_name)<=60),
 timezone text,
 default_voice text check(default_voice in ('marin','cedar','coral','onyx')),
 default_content_type text check(default_content_type in ('bible_study','sermon','lecture','story','bible_facts')),
 duration_minutes integer not null default 10 check(duration_minutes in (5,10,15)),
 updated_at timestamptz not null default now()
);
create table public.lesson_service_settings (
 id boolean primary key default true check(id),
 enabled boolean not null default false,
 scheduler_secret_sha256 text check(scheduler_secret_sha256 ~ '^[0-9a-f]{64}$')
);
insert into public.lesson_service_settings(id) values(true);
alter table public.member_preferences enable row level security;
alter table public.lesson_service_settings enable row level security;
revoke all on public.member_preferences, public.lesson_service_settings from anon, authenticated;
grant all on public.member_preferences, public.lesson_service_settings to service_role;
create index calls_owner_history on public.calls(caller_id,created_at desc);

alter table public.portal_accounts add column pending_phone text;
alter table public.portal_accounts add column verify_attempts integer not null default 0;
alter table public.portal_accounts add constraint portal_user_fk foreign key(user_id) references auth.users(id) on delete cascade;
-- Previously issued four-digit codes are invalidated by the stronger flow.
update public.portal_accounts set verify_code=null,verify_expires=null;
revoke all on public.portal_accounts from anon, authenticated;
grant all on public.portal_accounts to service_role;

create function public.portal_begin_verification(p_user uuid,p_email text,p_phone text,p_hash text)
returns void language plpgsql security invoker set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 if exists(select 1 from portal_accounts where phone=p_phone and phone_verified and user_id<>p_user) then raise exception 'Phone unavailable'; end if;
 insert into portal_accounts(user_id,email,pending_phone,verify_code,verify_expires,verify_attempts,updated_at)
 values(p_user,p_email,p_phone,p_hash,now()+interval '10 minutes',0,now())
 on conflict(user_id) do update set email=excluded.email,pending_phone=excluded.pending_phone,verify_code=excluded.verify_code,verify_expires=excluded.verify_expires,verify_attempts=0,updated_at=now();
end; $$;

create function public.portal_finish_verification(p_user uuid,p_hash text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare account portal_accounts; item record;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select * into account from portal_accounts where user_id=p_user for update;
 if account.verify_code is null or account.pending_phone is null then return jsonb_build_object('error','no_pending'); end if;
 if account.verify_expires<now() then return jsonb_build_object('error','expired'); end if;
 if account.verify_attempts>=5 then return jsonb_build_object('error','too_many_attempts'); end if;
 update portal_accounts set verify_attempts=verify_attempts+1 where user_id=p_user;
 if account.verify_code<>p_hash then return jsonb_build_object('error','wrong_code'); end if;
 perform pg_advisory_xact_lock(hashtextextended(account.pending_phone,1));
 if exists(select 1 from portal_accounts where phone=account.pending_phone and user_id<>p_user) then return jsonb_build_object('error','phone_unavailable'); end if;
 if account.phone is distinct from account.pending_phone then
  -- Consent applied to the previous verified number; a new number needs new schedules.
  if account.phone_verified then update call_schedules set active=false where phone=account.phone; end if;
  for item in select id from lesson_schedules where user_id=p_user and active loop
   perform lesson_pause_plan(p_user,item.id);
  end loop;
 end if;
 update portal_accounts set phone=pending_phone,phone_verified=true,pending_phone=null,verify_code=null,verify_expires=null,verify_attempts=0,updated_at=now() where user_id=p_user;
 return jsonb_build_object('phone_verified',true);
end; $$;

create function public.lesson_dashboard_stats(p_user uuid)
returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object(
  'lessons_finished',count(*) filter(where j.lesson_finished),
  'calls_answered',count(*) filter(where j.accepted),
  'last_activity_at',max(j.due_at) filter(where j.accepted)
 ) from lesson_jobs j join lesson_schedules s on s.id=j.schedule_id where s.user_id=p_user;
$$;
revoke all on function public.portal_begin_verification(uuid,text,text,text),public.portal_finish_verification(uuid,text),public.lesson_dashboard_stats(uuid) from public,anon,authenticated;
grant execute on function public.portal_begin_verification(uuid,text,text,text),public.portal_finish_verification(uuid,text),public.lesson_dashboard_stats(uuid) to service_role;
