-- Keep the deployed policy names and grants while making the publisher claim
-- a query-level init plan. This avoids replacing any active access policy.
alter policy "Publishing account manages catalog" on public.elroi_media
  using (((select auth.jwt())->'app_metadata'->>'elroi_editor')='true')
  with check (((select auth.jwt())->'app_metadata'->>'elroi_editor')='true');
