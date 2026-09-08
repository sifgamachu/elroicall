import { createSchedulingService } from './service.ts';
import type { Secrets } from '../_shared/providers.ts';

const keys: (keyof Secrets)[] = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','OPENAI_API_KEY','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER','SCHEDULER_SECRET','SCHEDULED_CALLS_ENABLED','CONTENT_MODEL','SITE_ORIGIN'];
const env=Object.fromEntries(keys.map(key=>[key,Deno.env.get(key)||''])) as Secrets;
Deno.serve(createSchedulingService(env));
