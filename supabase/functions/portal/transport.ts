// The account/phone portal does not depend on AI narration or scheduler configuration.
export type PortalEnv = {
  SUPABASE_URL: string; SUPABASE_ANON_KEY: string; SUPABASE_SERVICE_ROLE_KEY: string;
  TWILIO_ACCOUNT_SID: string; TWILIO_AUTH_TOKEN: string; TWILIO_FROM_NUMBER: string;
  SITE_ORIGIN?: string;
};
export async function fetchDeadline(url: string, init: RequestInit, milliseconds = 15000, client: typeof fetch = fetch): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), milliseconds);
  try {
    const result = await client(url, { ...init, signal: controller.signal });
    const bytes = await result.arrayBuffer();
    return new Response([204,205,304].includes(result.status) ? null : bytes, { status: result.status, headers: result.headers });
  } finally { clearTimeout(timer); }
}
export async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2,'0')).join('');
}
