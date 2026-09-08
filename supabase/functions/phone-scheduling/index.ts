import { createPhoneSchedulingService } from './service.ts';
import type { Secrets } from '../_shared/providers.ts';
import { fetchDeadline } from '../_shared/providers.ts';
const keys:(keyof Secrets)[]=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','OPENAI_API_KEY','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER','SCHEDULER_SECRET','SCHEDULED_CALLS_ENABLED'];
const env=Object.fromEntries(keys.map(key=>[key,Deno.env.get(key)||''])) as Secrets;
env.TWILIO_FROM_NUMBER||='+18556197337';
let digest='';let loadedAt=0;
Deno.serve(async(request:Request)=>{
  try{
    if(Date.now()-loadedAt>15000){
      const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/lesson_service_settings?id=eq.true&select=scheduler_secret_sha256&limit=1`,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`}},8000);
      if(!r.ok)throw Error('settings');digest=(await r.json())[0]?.scheduler_secret_sha256||'';loadedAt=Date.now();
    }
    return await createPhoneSchedulingService({...env,SCHEDULER_SECRET_SHA256:digest,PHONE_BOOKING_VOICE_ENABLED:Deno.env.get('PHONE_BOOKING_VOICE_ENABLED')||''})(request);
  }catch{return new Response(JSON.stringify({error:'Phone scheduling is temporarily unavailable.',booked:false}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}
});
