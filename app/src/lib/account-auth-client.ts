import { createAccountAuth, type AuthTokens } from './account-auth';
import { SUPABASE_URL } from './api';
import { SUPABASE_ANON_KEY, supabase } from './supabase';

export const accountAuth = createAccountAuth({ supabaseUrl: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY });
export async function acceptAccountSession(tokens: AuthTokens) {
  const { data, error } = await supabase.auth.setSession(tokens);
  if (error || !data.session) throw new Error('Your session could not be opened. Try a new code or link.');
}
