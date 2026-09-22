-- Finite, need-led Call Journeys and private post-call takeaway cards.
-- All data remains behind the existing authenticated Edge Function. Browser
-- roles retain no direct table or RPC access.

alter table public.lesson_schedules
  add column if not exists journey_slug text,
  add column if not exists journey_total integer,
  add column if not exists occurrences_created integer not null default 0;

alter table public.lesson_schedules
  add constraint lesson_schedules_journey_slug_check
    check (journey_slug is null or journey_slug in ('peace','grief','sleep','purpose','courage','foundations')),
  add constraint lesson_schedules_journey_total_check
    check (journey_total is null or journey_total between 2 and 30),
  add constraint lesson_schedules_journey_pair_check
    check ((journey_slug is null) = (journey_total is null)),
  add constraint lesson_schedules_occurrences_check
    check (occurrences_created >= 0 and (journey_total is null or occurrences_created <= journey_total));

alter table public.lesson_jobs
  add column if not exists session_number integer,
  add column if not exists takeaway_truth text,
  add column if not exists takeaway_action text,
  add column if not exists takeaway_prayer text;

alter table public.lesson_jobs
  add constraint lesson_jobs_session_number_check check (session_number is null or session_number between 1 and 30),
  add constraint lesson_jobs_takeaway_truth_check check (takeaway_truth is null or char_length(takeaway_truth) between 1 and 400),
  add constraint lesson_jobs_takeaway_action_check check (takeaway_action is null or char_length(takeaway_action) between 1 and 400),
  add constraint lesson_jobs_takeaway_prayer_check check (takeaway_prayer is null or char_length(takeaway_prayer) between 1 and 700);

create index if not exists lesson_schedules_owner_created
  on public.lesson_schedules(user_id, created_at desc);

create or replace function public.lesson_create_plan(p_user uuid, p_phone text, p_plan jsonb)
returns public.lesson_schedules language plpgsql security invoker set search_path = public as $$
declare
 item public.lesson_schedules;
 next_at timestamptz;
 journey text := nullif(p_plan->>'journey_slug','');
 journey_length integer := nullif(p_plan->>'journey_total','')::integer;
 selected_days integer[] := array(select jsonb_array_elements_text(p_plan->'weekdays')::integer);
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));

 if (journey is null) <> (journey_length is null) then
  raise exception 'Choose a complete Call Journey.';
 end if;
 if journey is not null and (
   journey not in ('peace','grief','sleep','purpose','courage','foundations')
   or journey_length <> 7
   or p_plan->>'recurrence' <> 'weekly'
   or selected_days <> array[0,1,2,3,4,5,6]
 ) then
  raise exception 'This Call Journey is not available.';
 end if;

 select * into item
 from lesson_schedules
 where user_id=p_user and request_id=(p_plan->>'request_id')::uuid;
 if found then
  if item.phone is distinct from p_phone
   or item.content_type is distinct from p_plan->>'content_type'
   or item.topic is distinct from p_plan->>'topic'
   or item.voice is distinct from p_plan->>'voice'
   or item.local_time is distinct from (p_plan->>'local_time')::time
   or item.timezone is distinct from p_plan->>'timezone'
   or item.recurrence is distinct from p_plan->>'recurrence'
   or item.start_date is distinct from (p_plan->>'start_date')::date
   or item.duration_minutes is distinct from (p_plan->>'duration_minutes')::integer
   or item.weekdays is distinct from selected_days
   or item.journey_slug is distinct from journey
   or item.journey_total is distinct from journey_length
  then
   raise exception 'This save request was already used for different choices';
  end if;
  return item;
 end if;

 if (select count(*) from lesson_schedules
     where user_id=p_user and active
       and (next_run_at is not null or exists(
         select 1 from lesson_jobs
         where schedule_id=lesson_schedules.id
           and status in ('queued','preparing','ready','dialing','submitted')
       ))) >= 5 then
  raise exception 'Maximum five active schedules';
 end if;

 next_at := lesson_next_run(
   (p_plan->>'local_time')::time,
   p_plan->>'timezone',
   p_plan->>'recurrence',
   selected_days,
   (p_plan->>'start_date')::date,
   now() + interval '20 minutes'
 );
 if next_at is null then
  raise exception 'Choose a call time at least twenty minutes in the future';
 end if;
 if exists(select 1 from lesson_schedules
           where user_id=p_user and active
             and abs(extract(epoch from(next_run_at-next_at))) < 1200) then
  raise exception 'A call is already scheduled near that time';
 end if;

 insert into lesson_schedules(
   user_id,request_id,content_type,topic,voice,local_time,timezone,
   recurrence,weekdays,start_date,duration_minutes,phone,consent_at,
   next_run_at,journey_slug,journey_total
 ) values(
   p_user,(p_plan->>'request_id')::uuid,p_plan->>'content_type',p_plan->>'topic',
   p_plan->>'voice',(p_plan->>'local_time')::time,p_plan->>'timezone',
   p_plan->>'recurrence',selected_days,(p_plan->>'start_date')::date,
   (p_plan->>'duration_minutes')::integer,p_phone,now(),next_at,journey,journey_length
 ) returning * into item;
 return item;
end; $$;

create or replace function public.lesson_enqueue()
returns integer language plpgsql security invoker set search_path = public as $$
declare
 item public.lesson_schedules;
 added integer := 0;
 next_count integer;
 inserted boolean;
begin
 for item in
  select * from lesson_schedules
  where active and next_run_at <= now()+interval '20 minutes'
  order by next_run_at
  for update skip locked
  limit 100
 loop
  inserted := false;
  insert into lesson_jobs(schedule_id,due_at,status,error_code,session_number)
   values(
     item.id,
     item.next_run_at,
     case when item.next_run_at < now()+interval '1 minute' then 'missed' else 'queued' end,
     case when item.next_run_at < now()+interval '1 minute' then 'preparation_window_missed' else null end,
     case when item.journey_slug is null then null else item.occurrences_created+1 end
   )
   on conflict(schedule_id,due_at) do nothing
   returning true into inserted;

  if coalesce(inserted,false) then
   next_count := item.occurrences_created+1;
   update lesson_schedules
   set occurrences_created=next_count,
       next_run_at=case
         when item.recurrence='once' then null
         when item.journey_total is not null and next_count>=item.journey_total then null
         else lesson_next_run(
           item.local_time,item.timezone,item.recurrence,item.weekdays,
           item.start_date,greatest(item.next_run_at,now())
         )
       end
   where id=item.id;
   added := added+1;
  end if;
 end loop;

 update lesson_jobs
 set status='missed',error_code='preparation_incomplete',finished_at=now()
 where status in ('queued','preparing') and due_at <= now();
 update lesson_jobs
 set status='missed',error_code='delivery_window_missed',finished_at=now()
 where status='ready' and due_at < now()-interval '2 minutes';
 update lesson_jobs
 set status='queued',lease_until=null,failures=failures+1
 where status='preparing' and lease_until < now() and due_at > now() and failures < 3;
 update lesson_jobs
 set status='failed',error_code='preparation_attempts_exhausted',finished_at=now()
 where status in ('queued','preparing') and failures >= 3;
 return added;
end; $$;

-- Reassert the service-only boundary after replacing the functions.
revoke execute on function public.lesson_create_plan(uuid,text,jsonb), public.lesson_enqueue()
  from public, anon, authenticated;
grant execute on function public.lesson_create_plan(uuid,text,jsonb), public.lesson_enqueue()
  to service_role;
