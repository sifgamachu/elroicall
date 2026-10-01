-- The existing calling/account schema is preserved. This adds the app library.
create table public.elroi_media (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  title text not null check (length(title) between 1 and 140),
  synopsis text not null check (length(synopsis) between 1 and 2000),
  section text not null check (section in ('watch','cinema')),
  book text not null check (length(book) between 1 and 60),
  passage text not null check (length(passage) between 1 and 160),
  artwork text not null check (artwork in ('creation','hagar','joseph','rescue','wilderness','wisdom','galilee','empty-tomb','new-creation','worship')),
  provider text not null check (provider in ('youtube','storage')),
  youtube_id text check (youtube_id ~ '^[a-zA-Z0-9_-]{11}$'),
  storage_path text check (storage_path ~ '^videos/[a-f0-9-]{36}\.mp4$'),
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 21600),
  status text not null default 'draft' check (status in ('draft','coming_soon','published')),
  access text not null default 'free' check (access in ('free','member')),
  reflection_question text not null check (length(reflection_question) between 1 and 500),
  study_day smallint check (study_day between 1 and 84),
  position integer not null default 0 check (position between 0 and 9999),
  created_at timestamptz not null default now(),
  constraint elroi_published_source check (status <> 'published' or (provider='youtube' and youtube_id is not null) or (provider='storage' and storage_path is not null)),
  constraint elroi_paid_media_private check (access='free' or provider='storage'),
  constraint elroi_single_source check ((provider='youtube' and storage_path is null) or (provider='storage' and youtube_id is null))
);
create index elroi_media_catalog on public.elroi_media(section,status,position);
alter table public.elroi_media enable row level security;
grant select on public.elroi_media to anon,authenticated;
grant insert,update,delete on public.elroi_media to authenticated;
grant all on public.elroi_media to service_role;
create policy "Released catalog is public" on public.elroi_media for select to anon,authenticated using (status in ('published','coming_soon'));
create policy "Publishing account manages catalog" on public.elroi_media for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'elroi_editor') = 'true')
  with check ((select auth.jwt()->'app_metadata'->>'elroi_editor') = 'true');

create table public.elroi_study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  day smallint not null check (day between 1 and 84),
  completed boolean not null default false,
  reflection text not null default '' check (length(reflection) <= 4000),
  primary key(user_id,day)
);
alter table public.elroi_study_progress enable row level security;
grant select,insert,update,delete on public.elroi_study_progress to authenticated;
grant all on public.elroi_study_progress to service_role;
create policy "Readers own app progress" on public.elroi_study_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Partial writes preserve a saved reflection when marking complete and vice versa.
create function public.save_elroi_study_progress(p_day smallint, p_completed boolean default null, p_reflection text default null)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in to save progress'; end if;
  insert into public.elroi_study_progress(user_id,day,completed,reflection)
    values(auth.uid(),p_day,coalesce(p_completed,false),coalesce(p_reflection,''))
    on conflict(user_id,day) do update set
      completed=coalesce(p_completed,elroi_study_progress.completed),
      reflection=coalesce(p_reflection,elroi_study_progress.reflection);
end;
$$;
revoke all on function public.save_elroi_study_progress(smallint,boolean,text) from public,anon;
grant execute on function public.save_elroi_study_progress(smallint,boolean,text) to authenticated;

-- No public storage links: playback issues a short-lived signed URL only after
-- checking publication and, for member films, the store-backed entitlement.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('elroi-media','elroi-media',false,52428800,array['video/mp4']);
create policy "Publishing account uploads films" on storage.objects for insert to authenticated
  with check (bucket_id='elroi-media' and (select auth.jwt()->'app_metadata'->>'elroi_editor')='true' and name ~ '^videos/[a-f0-9-]{36}\.mp4$');
create policy "Publishing account reads film files" on storage.objects for select to authenticated
  using (bucket_id='elroi-media' and (select auth.jwt()->'app_metadata'->>'elroi_editor')='true');
create policy "Publishing account removes film files" on storage.objects for delete to authenticated
  using (bucket_id='elroi-media' and (select auth.jwt()->'app_metadata'->>'elroi_editor')='true');

-- Existing channel messages and honest upcoming Genesis entries.
insert into public.elroi_media(slug,title,synopsis,section,book,passage,artwork,provider,youtube_id,storage_path,duration_seconds,status,access,reflection_question,study_day,position)
select slug,title,synopsis,section,book,passage,artwork,provider,youtube_id,storage_path,duration_seconds,status,access,reflection_question,study_day,position from jsonb_to_recordset($catalog$[{"slug":"rooted-in-god","title":"Rooted in God.","synopsis":"A devotion on staying nourished by Scripture, trusting God’s timing, and growing through dry seasons.","section":"watch","book":"Psalms","passage":"Psalm 1:3","artwork":"creation","provider":"youtube","youtube_id":"7bT1Tzisz-A","storage_path":null,"duration_seconds":862,"status":"published","access":"free","reflection_question":"What would help you stay rooted in God in the season you are in?","study_day":34,"position":0},{"slug":"morning-prayer","title":"Begin the day with God.","synopsis":"Pause before the day begins with a prayer for guidance, grace, and confidence in God’s presence.","section":"watch","book":"Psalms","passage":"Psalm 5:12","artwork":"worship","provider":"youtube","youtube_id":"UPNGrIWqtSE","storage_path":null,"duration_seconds":201,"status":"published","access":"free","reflection_question":"What part of today would you like to bring to God before you begin?","study_day":34,"position":1},{"slug":"night-prayer","title":"Rest in being known.","synopsis":"An evening prayer about dignity, releasing comparison, and remembering the worth God gives His creation.","section":"watch","book":"Psalms","passage":"Psalm 8:5","artwork":"worship","provider":"youtube","youtube_id":"y_mAxFernTY","storage_path":null,"duration_seconds":165,"status":"published","access":"free","reflection_question":"What would you like to release before you rest tonight?","study_day":34,"position":2},{"slug":"walk-by-faith","title":"One faithful step.","synopsis":"A reflection on trust in ordinary decisions, perseverance in waiting, and bringing honest doubts to God.","section":"watch","book":"2 Corinthians","passage":"2 Corinthians 5:7","artwork":"worship","provider":"youtube","youtube_id":"ZG983G9I0FY","storage_path":null,"duration_seconds":492,"status":"published","access":"free","reflection_question":"Where are you being invited to take one small, faithful step?","study_day":77,"position":3},{"slug":"genesis-creation","title":"In the beginning","passage":"Genesis 1–2","artwork":"creation","synopsis":"Creation, light, life, and a world called good.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 1–2?","study_day":1,"position":0},{"slug":"genesis-eden","title":"The garden and the choice","passage":"Genesis 3","artwork":"creation","synopsis":"Trust, temptation, and the first promise of hope.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 3?","study_day":1,"position":1},{"slug":"genesis-noah","title":"Noah and the covenant","passage":"Genesis 6–9","artwork":"wilderness","synopsis":"The flood, a new beginning, and a covenant marked by a rainbow.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 6–9?","study_day":1,"position":2},{"slug":"genesis-abraham","title":"A promise beneath the stars","passage":"Genesis 12–15","artwork":"wilderness","synopsis":"Abraham leaves the familiar and learns to trust the promise of God.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 12–15?","study_day":1,"position":3},{"slug":"genesis-hagar","title":"The God who sees","passage":"Genesis 16","artwork":"hagar","synopsis":"Hagar is found beside a spring. The story behind El Roi Calls.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 16?","study_day":2,"position":4},{"slug":"genesis-jacob","title":"Jacob: the long way home","passage":"Genesis 25–35","artwork":"wilderness","synopsis":"Family conflict, an encounter with God, and a changed name.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 25–35?","study_day":2,"position":5},{"slug":"genesis-joseph","title":"Joseph: from pit to purpose","passage":"Genesis 37–50","artwork":"joseph","synopsis":"Betrayal, endurance, reconciliation, and provision for a family.","section":"cinema","book":"Genesis","provider":"storage","youtube_id":null,"storage_path":null,"duration_seconds":0,"status":"coming_soon","access":"free","reflection_question":"What do you notice about God in Genesis 37–50?","study_day":3,"position":6}]$catalog$::jsonb) as x(slug text,title text,synopsis text,section text,book text,passage text,artwork text,provider text,youtube_id text,storage_path text,duration_seconds integer,status text,access text,reflection_question text,study_day smallint,position integer);
