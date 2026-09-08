-- Run once through an authorized database connection. No secret is returned.
do $$
begin
 if not exists(select 1 from vault.secrets where name='elroi_supabase_url') then
  perform vault.create_secret('https://mkocnufwmsfchivfbhuf.supabase.co','elroi_supabase_url');
 end if;
 if not exists(select 1 from vault.secrets where name='elroi_scheduler_secret') then
  perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'elroi_scheduler_secret');
 end if;
 update public.lesson_service_settings set scheduler_secret_sha256=encode(extensions.digest((select decrypted_secret from vault.decrypted_secrets where name='elroi_scheduler_secret'),'sha256'),'hex') where id=true;
end; $$;
