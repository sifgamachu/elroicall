-- Phone drafts are not schedules. Only a signed callback with keypad consent can commit one.
alter table public.lesson_runtime drop constraint lesson_runtime_id_check;
alter table public.lesson_runtime add constraint lesson_runtime_id_check check(id in ('delivery','preparation','phone_booking'));
insert into public.lesson_runtime(id,heartbeat_at) values('phone_booking','1970-01-01');
create table public.phone_booking_drafts (
 id uuid primary key default gen_random_uuid(),
 source_call_sid text not null unique check(source_call_sid ~ '^CA[0-9a-fA-F]{32}$'),
 phone text not null check(phone ~ '^\+[1-9][0-9]{7,14}$'),
 action text not null check(action in ('book','pause_all')),
 plan jsonb not null default '{}',
 next_run_at timestamptz,
 status text not null default 'draft' check(status in ('draft','queued','dialing','submitted','uncertain','confirmed','cancelled','expired','failed')),
 callback_sid text unique,
 schedule_id uuid references public.lesson_schedules(id) on delete set null,
 user_id uuid references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '20 minutes',
 consent_at timestamptz,
 constraint phone_draft_plan check(action='pause_all' or (jsonb_typeof(plan)='object' and next_run_at is not null))
);
create index phone_booking_pending on public.phone_booking_drafts(created_at) where status='queued';
create index phone_booking_owner_id on public.phone_booking_drafts(user_id) where user_id is not null;
create index phone_booking_schedule_id on public.phone_booking_drafts(schedule_id) where schedule_id is not null;
alter table public.phone_booking_drafts enable row level security;
revoke all on public.phone_booking_drafts from public,anon,authenticated;
grant all on public.phone_booking_drafts to service_role;

create function public.phone_booking_prepare(p_call text,p_phone text,p_action text,p_plan jsonb)
returns public.phone_booking_drafts language plpgsql security invoker set search_path=public as $$
declare item phone_booking_drafts; next_at timestamptz; request uuid:=gen_random_uuid();
begin
 perform pg_advisory_xact_lock(hashtextextended(p_call,3));
 select * into item from phone_booking_drafts where source_call_sid=p_call for update;
 if found and item.status<>'draft' then raise exception 'A confirmation was already requested on this call. Finish it before starting another request'; end if;
 if p_action='book' then
  next_at:=lesson_next_run((p_plan->>'local_time')::time,p_plan->>'timezone',p_plan->>'recurrence',array(select jsonb_array_elements_text(p_plan->'weekdays')::integer),(p_plan->>'start_date')::date,now()+interval '40 minutes');
  if next_at is null then raise exception 'Choose a call time at least forty minutes ahead to allow confirmation and preparation'; end if;
 end if;
 -- A changed draft gets a fresh ID so an earlier verbal confirmation cannot approve new choices.
 if item.id is not null then delete from phone_booking_drafts where id=item.id; end if;
 insert into phone_booking_drafts(id,source_call_sid,phone,action,plan,next_run_at)
 values(request,p_call,p_phone,p_action,p_plan||jsonb_build_object('request_id',request,'consent',true),next_at) returning * into item;
 return item;
end; $$;

create function public.phone_booking_owner(p_phone text)
-- service_role cannot read auth.users directly. Expose only a phone-to-owner lookup;
-- all browser roles are denied EXECUTE below. No identity metadata is trusted.
returns uuid language plpgsql stable security definer set search_path=public as $$
declare owner uuid;
begin
 select user_id into owner from portal_accounts where phone=p_phone and phone_verified;
 if owner is not null then return owner; end if;
 select id into owner from auth.users where phone in (p_phone,ltrim(p_phone,'+')) and phone_confirmed_at is not null;
 if owner is null and exists(select 1 from auth.users where phone in (p_phone,ltrim(p_phone,'+'))) then raise exception 'Finish verifying this number in your account before scheduling by phone'; end if;
 return owner;
end; $$;

create function public.phone_booking_commit(p_id uuid,p_sid text,p_user uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare item phone_booking_drafts; account portal_accounts; owner uuid; result lesson_schedules; target record;
begin
 select * into item from phone_booking_drafts where id=p_id for update;
 if not found or item.callback_sid is distinct from p_sid then raise exception 'Confirmation does not match'; end if;
 if item.status='confirmed' then return jsonb_build_object('confirmed',true,'schedule_id',item.schedule_id,'action',item.action); end if;
 if item.status not in ('submitted','dialing','uncertain') or item.expires_at<now() then raise exception 'This confirmation has expired. Please call again'; end if;
 -- Same lock order as portal verification and lesson_create_plan.
 if p_user is not null then perform pg_advisory_xact_lock(hashtextextended(p_user::text,0)); end if;
 perform pg_advisory_xact_lock(hashtextextended(item.phone,1));
 owner:=phone_booking_owner(item.phone);
 if owner is distinct from p_user then raise exception 'Phone ownership changed. Please call again'; end if;
 if item.action='pause_all' then
  update call_schedules set active=false where phone=item.phone;
  for target in select id from lesson_schedules where user_id=p_user and phone=item.phone and active loop
   perform lesson_pause_plan(p_user,target.id);
  end loop;
 else
  if p_user is null then raise exception 'An account could not be connected'; end if;
  select * into account from portal_accounts where user_id=p_user for update;
  if account.phone is not null and account.phone<>item.phone then raise exception 'Your account uses another phone. Verify this number in your dashboard first'; end if;
  if exists(select 1 from portal_accounts where phone=item.phone and user_id<>p_user) then raise exception 'This number is linked to another account. Verify it in your dashboard first'; end if;
  if lesson_next_run((item.plan->>'local_time')::time,item.plan->>'timezone',item.plan->>'recurrence',array(select jsonb_array_elements_text(item.plan->'weekdays')::integer),(item.plan->>'start_date')::date,now()+interval '20 minutes') is distinct from item.next_run_at then raise exception 'The confirmed time is no longer available. Please call again to choose a later time'; end if;
  insert into portal_accounts(user_id,phone,phone_verified) values(p_user,item.phone,true)
  on conflict(user_id) do update set phone=excluded.phone,phone_verified=true,updated_at=now();
  result:=lesson_create_plan(p_user,item.phone,item.plan);
  update lesson_schedules set consent_version='phone-scheduled-calls-v1' where id=result.id;
 end if;
 update phone_booking_drafts set status='confirmed',consent_at=now(),schedule_id=result.id,user_id=p_user where id=p_id;
 return jsonb_build_object('confirmed',true,'schedule_id',result.id,'action',item.action);
end; $$;
revoke all on function public.phone_booking_prepare(text,text,text,jsonb),public.phone_booking_owner(text),public.phone_booking_commit(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.phone_booking_prepare(text,text,text,jsonb),public.phone_booking_owner(text),public.phone_booking_commit(uuid,text,uuid) to service_role;

-- Hosted projects already have pg_cron, pg_net and the scheduler token in Vault.
-- Isolated migration tests omit these extensions and exercise the worker through fixtures.
do $install$
begin
 if exists(select 1 from pg_namespace where nspname='cron') then
  perform cron.schedule('elroi-phone-booking','* * * * *',$job$
   select net.http_post(
    url:=(select decrypted_secret from vault.decrypted_secrets where name='elroi_supabase_url')||'/functions/v1/phone-scheduling/dispatch',
    headers:=jsonb_build_object('Content-Type','application/json','x-scheduler-secret',(select decrypted_secret from vault.decrypted_secrets where name='elroi_scheduler_secret')),
    body:='{}'::jsonb,timeout_milliseconds:=120000
   );
  $job$);
 end if;
end; $install$;
