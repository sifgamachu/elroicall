import { fetchDeadline, type PortalEnv } from './transport.ts';

export function callingSetup(env: PortalEnv) {
  const checks = { account_configured: Boolean(env.TWILIO_ACCOUNT_SID), token_configured: Boolean(env.TWILIO_AUTH_TOKEN), caller_configured: Boolean(env.TWILIO_FROM_NUMBER) };
  const ready = Object.values(checks).every(Boolean);
  // Presence is not proof of valid credentials, sufficient balance, or answered calls.
  return { version: 1, verification_ready: ready, test_call_ready: ready, reason: ready ? null : 'calling_provider_not_configured', checks };
}
export function connectionTestIssue(body: Record<string, unknown>, account: {phone?: string|null; phone_verified?: boolean}|undefined, from: string): {status:number; error:string}|null {
  if (!account?.phone_verified || !account.phone || !/^\+[1-9]\d{7,14}$/.test(account.phone)) return {status:403,error:'phone_not_verified'};
  if (account.phone === from) return {status:400,error:'service_number_not_allowed'};
  if (Object.keys(body).some(key => !['consent','request_id'].includes(key))) return {status:400,error:'invalid_request'};
  if (body.consent !== true) return {status:400,error:'consent_required'};
  if (typeof body.request_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.request_id)) return {status:400,error:'invalid_request'};
  return null;
}
export const CONNECTION_TEST_TWIML = '<Response><Say voice="Polly.Joanna">This is your requested El Roi Call connection test. If you can hear this message clearly, your phone audio is working. This is a short system-voice test, not your selected Bible-study voice or lesson. No Bible lesson has been booked and no existing schedule has been changed by this test. You may hang up now. Goodbye.</Say><Hangup/></Response>';
export async function requestConnectionTest(env: PortalEnv, phone: string, client: typeof fetch = fetch): Promise<'requested'|'uncertain'|'rejected'> {
  try {
    const response = await fetchDeadline(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`, {
      method:'POST', headers:{Authorization:`Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({To:phone,From:env.TWILIO_FROM_NUMBER,Twiml:CONNECTION_TEST_TWIML,Record:'false',Timeout:'20',TimeLimit:'35'}),
    },15000,client);
    if(response.status>=500)return 'uncertain';
    if(!response.ok)return 'rejected';
    const data=await response.json();
    return typeof data.sid==='string'&&/^CA[0-9a-f]{32}$/i.test(data.sid)?'requested':'uncertain';
  } catch { return 'uncertain'; }
}
