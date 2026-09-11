import {createCallAccessService} from './service.ts';
import type {Secrets} from '../_shared/providers.ts';
const keys:(keyof Secrets)[]=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','SITE_ORIGIN'];
const env=Object.fromEntries(keys.map(key=>[key,Deno.env.get(key)||''])) as Secrets;
Deno.serve(createCallAccessService(env));
