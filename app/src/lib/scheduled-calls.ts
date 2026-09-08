import type { Session } from '@supabase/supabase-js';
import { ApiError, fetchJson, SUPABASE_URL } from './api';
import { SUPABASE_ANON_KEY } from './supabase';
export { CONTENT_TYPES, VOICES, WEEKDAYS, localDate, validatePlan, planLabel } from '../../../supabase/functions/_shared/scheduling';
export type { CallPlan, CallPlanInput } from '../../../supabase/functions/_shared/scheduling';
export const SCHEDULE_API = `${SUPABASE_URL}/functions/v1/scheduled-calls`;
export async function schedulingRequest<T>(path: string, session?: Session | null, body?: unknown) {
  const result = await fetchJson<T>(`${SCHEDULE_API}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, path.startsWith('/voice-preview/') ? 65000 : 20000);
  if (result.status < 200 || result.status >= 300) throw new ApiError(typeof result.data === 'object' && result.data && 'error' in result.data ? String(result.data.error) : 'Request failed', result.status);
  return result.data;
}
