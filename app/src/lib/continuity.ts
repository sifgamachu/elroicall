import type { Session } from '@supabase/supabase-js';
import { ApiError,fetchJson,SUPABASE_URL } from './api';
export { NOTE_KINDS,continuationDraft,validateMemoryNote } from '../../../supabase/functions/_shared/continuity';
export type { MemoryNote,MemorySnapshot } from '../../../supabase/functions/_shared/continuity';
export async function continuityRequest<T>(path:string,session:Session,body?:unknown):Promise<T>{
 const result=await fetchJson<T>(`${SUPABASE_URL}/functions/v1/continuity${path}`,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 if(result.status<200||result.status>=300)throw new ApiError(typeof result.data==='object'&&result.data&&'error' in result.data?String(result.data.error):'Your saved notes are unavailable. Please try again.',result.status);
 return result.data;
}
