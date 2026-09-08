-- Run only after deploying scheduled-calls and adding matching server secrets.
-- These named Vault entries must exist: elroi_scheduler_secret and elroi_supabase_url.
-- Existing inbound call hooks and existing journey cron jobs are not changed.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('elroi-lesson-delivery','* * * * *',$$
 select net.http_post(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='elroi_supabase_url')||'/functions/v1/scheduled-calls/dispatch',
  headers:=jsonb_build_object('Content-Type','application/json','x-scheduler-secret',(select decrypted_secret from vault.decrypted_secrets where name='elroi_scheduler_secret')),
  body:='{}'::jsonb, timeout_milliseconds:=120000
 );
$$);
select cron.schedule('elroi-lesson-preparation','* * * * *',$$
 select net.http_post(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='elroi_supabase_url')||'/functions/v1/scheduled-calls/prepare',
  headers:=jsonb_build_object('Content-Type','application/json','x-scheduler-secret',(select decrypted_secret from vault.decrypted_secrets where name='elroi_scheduler_secret')),
  body:='{}'::jsonb, timeout_milliseconds:=120000
 );
$$);
