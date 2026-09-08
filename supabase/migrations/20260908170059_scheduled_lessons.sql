-- Additive: does not alter the existing portal, inbound voice, or journey tables.
create table if not exists public.lesson_schedules (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 content_type text not null check (content_type in ('bible_study','sermon','lecture','story','bible_facts')),
 topic text not null check (length(topic) between 1 and 160),
 voice text not null check (voice in ('marin','cedar','coral','onyx')),
 local_time time not null, timezone text not null,
 recurrence text not null check (recurrence in ('once','weekly')),
 weekdays integer[] not null default '{}', start_date date not null,
 duration_minutes integer not null check (duration_minutes in (5,10,15)),
 phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
 consent_at timestamptz not null, consent_version text not null default 'scheduled-calls-v1',
 active boolean not null default true, next_run_at timestamptz,
 created_at timestamptz not null default now(), paused_at timestamptz,
 unique(user_id, request_id),
 check (weekdays <@ array[0,1,2,3,4,5,6]),
 check (recurrence = 'once' or cardinality(weekdays) > 0)
);
create table if not exists public.lesson_jobs (
 id uuid primary key default gen_random_uuid(),
 schedule_id uuid not null references public.lesson_schedules(id) on delete cascade,
 due_at timestamptz not null,
 status text not null default 'queued', lease_until timestamptz,
 failures integer not null default 0,
 title text, reference_list text[] not null default '{}',
 script_chunks text[] not null default '{}', audio_paths text[] not null default '{}',
 call_sid text unique, accepted boolean not null default false,
 lesson_finished boolean not null default false,
 error_code text, created_at timestamptz not null default now(),
 finished_at timestamptz, unique(schedule_id, due_at)
);
create index if not exists lesson_schedule_due on public.lesson_schedules(next_run_at) where active;
create index if not exists lesson_job_due on public.lesson_jobs(status, due_at);
create table if not exists public.lesson_runtime (
 id text primary key check(id in ('delivery','preparation')), heartbeat_at timestamptz not null
);
create table if not exists public.lesson_rate_limits (
 key text primary key, window_start timestamptz not null, attempts integer not null
);
alter table public.lesson_schedules enable row level security;
alter table public.lesson_jobs enable row level security;
alter table public.lesson_runtime enable row level security;
alter table public.lesson_rate_limits enable row level security;
revoke all on public.lesson_schedules, public.lesson_jobs, public.lesson_runtime, public.lesson_rate_limits from anon, authenticated;
grant all on public.lesson_schedules, public.lesson_jobs, public.lesson_runtime, public.lesson_rate_limits to service_role;

-- Wall-clock scheduling: PostgreSQL chooses the standard-time occurrence of a
-- repeated local time. Nonexistent times are skipped, never shifted silently.
create or replace function public.lesson_next_run(p_time time, p_timezone text, p_recurrence text, p_days integer[], p_start date, p_after timestamptz)
returns timestamptz language plpgsql stable set search_path = public as $$
declare day date; candidate timestamptz; i integer;
begin
 if not exists(select 1 from pg_timezone_names where name = p_timezone) then raise exception 'Invalid timezone'; end if;
 for i in 0..370 loop
  day := greatest((p_after at time zone p_timezone)::date, p_start) + i;
  if p_recurrence = 'once' and day <> p_start then return null; end if;
  if p_recurrence = 'weekly' and not (extract(dow from day)::integer = any(p_days)) then continue; end if;
  candidate := (day + p_time) at time zone p_timezone;
  if (candidate at time zone p_timezone) <> day + p_time then continue; end if;
  if candidate > p_after then return candidate; end if;
 end loop;
 return null;
end; $$;

create or replace function public.lesson_create_plan(p_user uuid, p_phone text, p_plan jsonb)
returns public.lesson_schedules language plpgsql security invoker set search_path = public as $$
declare item public.lesson_schedules; next_at timestamptz;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
 select * into item from lesson_schedules where user_id=p_user and request_id=(p_plan->>'request_id')::uuid;
 if found then
  if item.phone <> p_phone or item.content_type <> p_plan->>'content_type' or item.topic <> p_plan->>'topic' or item.voice <> p_plan->>'voice' or item.local_time <> (p_plan->>'local_time')::time or item.timezone <> p_plan->>'timezone' or item.recurrence <> p_plan->>'recurrence' or item.start_date <> (p_plan->>'start_date')::date or item.duration_minutes <> (p_plan->>'duration_minutes')::integer or item.weekdays <> array(select jsonb_array_elements_text(p_plan->'weekdays')::integer) then raise exception 'This save request was already used for different choices'; end if;
  return item;
 end if;
 if (select count(*) from lesson_schedules where user_id=p_user and active and (next_run_at is not null or exists(select 1 from lesson_jobs where schedule_id=lesson_schedules.id and status in ('queued','preparing','ready','dialing','submitted')))) >= 5 then raise exception 'Maximum five active schedules'; end if;
 next_at := lesson_next_run((p_plan->>'local_time')::time, p_plan->>'timezone', p_plan->>'recurrence', array(select jsonb_array_elements_text(p_plan->'weekdays')::integer), (p_plan->>'start_date')::date, now() + interval '20 minutes');
 if next_at is null then raise exception 'Choose a call time at least twenty minutes in the future'; end if;
 if exists(select 1 from lesson_schedules where user_id=p_user and active and abs(extract(epoch from(next_run_at-next_at))) < 1200) then raise exception 'A call is already scheduled near that time'; end if;
 insert into lesson_schedules(user_id,request_id,content_type,topic,voice,local_time,timezone,recurrence,weekdays,start_date,duration_minutes,phone,consent_at,next_run_at)
 values(p_user,(p_plan->>'request_id')::uuid,p_plan->>'content_type',p_plan->>'topic',p_plan->>'voice',(p_plan->>'local_time')::time,p_plan->>'timezone',p_plan->>'recurrence',array(select jsonb_array_elements_text(p_plan->'weekdays')::integer),(p_plan->>'start_date')::date,(p_plan->>'duration_minutes')::integer,p_phone,now(),next_at) returning * into item;
 return item;
end; $$;

create or replace function public.lesson_pause_plan(p_user uuid, p_id uuid)
returns boolean language plpgsql security invoker set search_path = public as $$
begin
 update lesson_schedules set active=false,next_run_at=null,paused_at=now() where id=p_id and user_id=p_user;
 if not found then return false; end if;
 update lesson_jobs set status='cancelled',finished_at=now() where schedule_id=p_id and status in ('queued','preparing','ready');
 return true;
end; $$;

-- Atomic occurrence creation and advancement. Unique keys + row locks prevent
-- duplicate jobs even when cron invocations overlap or repeat.
create or replace function public.lesson_enqueue()
returns integer language plpgsql security invoker set search_path = public as $$
declare item public.lesson_schedules; added integer := 0;
begin
 for item in select * from lesson_schedules where active and next_run_at <= now()+interval '20 minutes' order by next_run_at for update skip locked limit 100 loop
  insert into lesson_jobs(schedule_id,due_at,status,error_code)
   values(item.id,item.next_run_at,case when item.next_run_at < now()+interval '1 minute' then 'missed' else 'queued' end,case when item.next_run_at < now()+interval '1 minute' then 'preparation_window_missed' else null end)
   on conflict(schedule_id,due_at) do nothing;
  update lesson_schedules set next_run_at=case when item.recurrence='once' then null else lesson_next_run(item.local_time,item.timezone,item.recurrence,item.weekdays,item.start_date,greatest(item.next_run_at,now())) end where id=item.id;
  added := added+1;
 end loop;
 update lesson_jobs set status='missed',error_code='preparation_incomplete',finished_at=now() where status in ('queued','preparing') and due_at <= now();
 update lesson_jobs set status='missed',error_code='delivery_window_missed',finished_at=now() where status='ready' and due_at < now()-interval '2 minutes';
 -- A lease may expire only before dialing. Never retry an ambiguous phone call.
 update lesson_jobs set status='queued',lease_until=null,failures=failures+1 where status='preparing' and lease_until < now() and due_at > now() and failures < 3;
 update lesson_jobs set status='failed',error_code='preparation_attempts_exhausted',finished_at=now() where status in ('queued','preparing') and failures >= 3;
 return added;
end; $$;
create or replace function public.lesson_claim_preparation()
returns setof public.lesson_jobs language sql security invoker set search_path = public as $$
 update lesson_jobs set status='preparing',lease_until=now()+interval '2 minutes'
 where id in (select j.id from lesson_jobs j join lesson_schedules s on s.id=j.schedule_id where j.status='queued' and j.due_at>now() and s.active order by j.due_at for update of j skip locked limit 2)
 returning *;
$$;
create or replace function public.lesson_claim_delivery()
returns setof public.lesson_jobs language plpgsql security invoker set search_path = public as $$
begin
 perform pg_advisory_xact_lock(714321098);
 return query update lesson_jobs set status='dialing',lease_until=null
 where id in (select j.id from lesson_jobs j join lesson_schedules s on s.id=j.schedule_id where j.status='ready' and j.due_at<=now() and j.due_at>=now()-interval '2 minutes' and s.active and s.consent_at is not null
 and not exists(select 1 from lesson_jobs other join lesson_schedules os on os.id=other.schedule_id where os.user_id=s.user_id and other.id<>j.id and other.status in ('dialing','submitted','uncertain') and other.due_at>now()-interval '30 minutes')
 order by j.due_at for update of j skip locked limit 1)
 returning *;
end; $$;
create or replace function public.lesson_rate_limit(p_key text, p_limit integer)
returns boolean language plpgsql security invoker set search_path = public as $$
declare amount integer;
begin
 insert into lesson_rate_limits(key,window_start,attempts) values(p_key,date_trunc('hour',now()),1)
 on conflict(key) do update set attempts=case when lesson_rate_limits.window_start < date_trunc('hour',now()) then 1 else lesson_rate_limits.attempts+1 end, window_start=date_trunc('hour',now()) returning attempts into amount;
 return amount <= p_limit;
end; $$;

revoke execute on function public.lesson_next_run(time,text,text,integer[],date,timestamptz), public.lesson_create_plan(uuid,text,jsonb), public.lesson_pause_plan(uuid,uuid), public.lesson_enqueue(), public.lesson_claim_preparation(), public.lesson_claim_delivery(), public.lesson_rate_limit(text,integer) from public, anon, authenticated;
grant execute on function public.lesson_next_run(time,text,text,integer[],date,timestamptz), public.lesson_create_plan(uuid,text,jsonb), public.lesson_pause_plan(uuid,uuid), public.lesson_enqueue(), public.lesson_claim_preparation(), public.lesson_claim_delivery(), public.lesson_rate_limit(text,integer) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('scheduled-call-audio','scheduled-call-audio',false,20971520,array['audio/mpeg']) on conflict(id) do nothing;
