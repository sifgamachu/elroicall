import type { Session } from '@supabase/supabase-js';
import { fetchJson, SUPABASE_URL } from './api';
import { SUPABASE_ANON_KEY } from './supabase';
import type { CallingIdentity } from '../../../supabase/functions/_shared/call-identity';
export type { CallingIdentity };
export async function getCallingProfile(session:Session):Promise<CallingIdentity>{
  const result=await fetchJson<CallingIdentity>(`${SUPABASE_URL}/functions/v1/call-access/profile`,{headers:{Authorization:`Bearer ${session.access_token}`,apikey:SUPABASE_ANON_KEY}},20000);
  if(result.status!==200 || typeof result.data?.pin_set!=='boolean' || typeof result.data?.phone_ready!=='boolean')throw Error('Calling access could not be loaded.');
  return result.data;
}
