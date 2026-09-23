import { createPortalService } from './service.ts';
import type { PortalEnv } from './transport.ts';
const keys: (keyof PortalEnv)[]=['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER','SITE_ORIGIN'];
const env=Object.fromEntries(keys.map(key=>[key,Deno.env.get(key)||''])) as PortalEnv;
env.TWILIO_FROM_NUMBER ||= '+18556197337';
Deno.serve(createPortalService(env));
