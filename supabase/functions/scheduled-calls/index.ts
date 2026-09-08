import { createSchedulingService } from './service.ts';
import type { Secrets } from '../_shared/providers.ts';
import { fetchDeadline } from '../_shared/providers.ts';

const keys: (keyof Secrets)[] = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','OPENAI_API_KEY','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER','SCHEDULER_SECRET','SCHEDULED_CALLS_ENABLED','CONTENT_MODEL','SITE_ORIGIN'];
const env=Object.fromEntries(keys.map(key=>[key,Deno.env.get(key)||''])) as Secrets;
env.TWILIO_FROM_NUMBER ||= '+18556197337';
// The cron token itself stays in Vault. The function receives only its digest.
let cached:{enabled:boolean;scheduler_secret_sha256:string}|null=null;
let loadedAt=0;
Deno.serve(async(request:Request)=>{
  try{
    if(!cached||Date.now()-loadedAt>15000){
      const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/lesson_service_settings?id=eq.true&limit=1`,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`}},8000);
      if(!r.ok)throw Error('Settings unavailable');
      cached=(await r.json())[0]||{enabled:false,scheduler_secret_sha256:''};loadedAt=Date.now();
    }
    return createSchedulingService({...env,SCHEDULED_CALLS_ENABLED:env.SCHEDULED_CALLS_ENABLED||String(cached?.enabled===true),SCHEDULER_SECRET_SHA256:cached?.scheduler_secret_sha256||''})(request);
  }catch{
    return new Response(JSON.stringify({error:'Service is temporarily unavailable.'}),{status:503,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':env.SITE_ORIGIN||'https://elroicall.com','Cache-Control':'no-store'}});
  }
});
