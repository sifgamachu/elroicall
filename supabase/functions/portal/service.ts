import { fetchDeadline, type Secrets } from '../_shared/providers.ts';
import { sha256 } from '../_shared/member.ts';
import { progressFor } from './legacy-progress.ts';
type Account={user_id:string;email:string;phone:string|null;phone_verified:boolean;pending_phone:string|null;verify_code:string|null;verify_expires:string|null;created_at:string};
type Track={mode:string;active:boolean;journey_day:number;hour_local:number;minute_local:number;tz:string;days:string;caller_name:string|null;last_called_date:string|null};
class PortalError extends Error {status:number;constructor(status:number,message:string){super(message);this.status=status;}}
const MODES=['journey','inspiration','random','sermon'];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function normalizePortalPhone(raw:unknown):string|null {
 if(typeof raw!=='string'||!/^[+\d\s().-]+$/.test(raw)) return null;
 const digits=raw.replace(/\D/g,'');
 if(raw.trim().startsWith('+')) return /^[1-9]\d{7,14}$/.test(digits)?`+${digits}`:null;
 if(digits.length===10&&/^[2-9]\d{2}[2-9]\d{6}$/.test(digits))return `+1${digits}`;
 if(digits.length===11&&digits.startsWith('1'))return `+${digits}`;
 return null;
}
export function createPortalService(env:Secrets,client:typeof fetch=fetch) {
 const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
 const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':env.SITE_ORIGIN||'https://elroicall.com','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS',Vary:'Origin'}});
 async function db<T>(path:string,method='GET',body?:unknown):Promise<T>{
  const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/${path}`,{method,headers:{...headers,Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)},12000,client);
  if(!r.ok){const error=await r.json().catch(()=>({}));if(error.code==='23505'||error.message==='Phone unavailable')throw new PortalError(409,'phone_unavailable');throw new PortalError(503,'account_unavailable');}
  return r.status===204?undefined as T:await r.json();
 }
 const rpc=<T>(name:string,body:unknown)=>db<T>(`rpc/${name}`,'POST',body);
 const account=async(id:string)=>(await db<Account[]>(`portal_accounts?user_id=eq.${id}&limit=1`))[0];
 async function limit(key:string,count:number){if(!await rpc<boolean>('lesson_rate_limit',{p_key:key,p_limit:count}))throw new PortalError(429,'too_many_requests');}
 return async(request:Request):Promise<Response>=>{
  try{
   if(request.method==='OPTIONS')return response({ok:true});
   const authorization=request.headers.get('authorization');
   if(!authorization?.startsWith('Bearer '))throw new PortalError(401,'unauthorized');
   const auth=await fetchDeadline(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:authorization,apikey:env.SUPABASE_ANON_KEY}},10000,client);
   if(!auth.ok)throw new PortalError(401,'unauthorized');
   const user=await auth.json();if(typeof user.id!=='string'||!UUID.test(user.id))throw new PortalError(401,'unauthorized');
   const path=new URL(request.url).pathname.split('/portal')[1]||'/';
   let body:Record<string,unknown>={};
   if(request.method==='POST'){const raw=await request.text();if(raw.length>8192)throw new PortalError(413,'request_too_large');try{body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();}catch{throw new PortalError(400,'invalid_request');}}
   const acct=await account(user.id);
   const phoneReady=Boolean(env.TWILIO_ACCOUNT_SID&&env.TWILIO_AUTH_TOKEN&&env.TWILIO_FROM_NUMBER);
   if(path==='/me'&&request.method==='GET'){
    let schedules:unknown[]=[],history:unknown[]=[],total=0,callerName:string|null=null;
    // An entered phone is not proof of ownership. Never read its history until verified.
    if(acct?.phone_verified&&acct.phone){
     const phone=encodeURIComponent(acct.phone);
     const [tracks,callers]=await Promise.all([db<Track[]>(`call_schedules?phone=eq.${phone}&order=hour_local.asc,minute_local.asc`),db<{id:string;name:string|null}[]>(`callers?phone=eq.${phone}&select=id,name&limit=1`)]);
     schedules=tracks.map(t=>({mode:t.mode,active:t.active,hour_local:t.hour_local,minute_local:t.minute_local,tz:t.tz,days:t.days,journey_day:t.journey_day,caller_name:t.caller_name,last_called_date:t.last_called_date,progress:t.active?progressFor(t.mode,(t.journey_day||0)+1):null}));
     if(callers[0]){
      callerName=callers[0].name;
      const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/calls?caller_id=eq.${callers[0].id}&select=id,figure_name,summary,created_at&order=created_at.desc&limit=50`,{headers:{...headers,Prefer:'count=exact'}},12000,client);
      if(!r.ok)throw new PortalError(503,'history_unavailable');
      history=await r.json();total=Number(r.headers.get('content-range')?.split('/')[1])||history.length;
     }
    }
    return response({email:user.email||acct?.email||'',phone:acct?.phone||null,phone_verified:acct?.phone_verified===true,pending_phone:acct?.pending_phone||null,verification_pending:Boolean(acct?.pending_phone&&acct.verify_expires&&new Date(acct.verify_expires).getTime()>Date.now()),member_since:acct?.created_at||null,caller_name:callerName,schedules,history,total_calls:total,verify_ready:phoneReady});
   }
   if(path==='/phone'&&request.method==='POST'){
    const phone=normalizePortalPhone(body.phone);if(!phone)throw new PortalError(400,'invalid_phone');
    if(!phoneReady)throw new PortalError(503,'verification_unavailable');
    if(body.consent!==true)throw new PortalError(400,'consent_required');
    await limit(`verify-user:${user.id}`,3);await limit(`verify-phone:${await sha256(phone)}`,3);
    const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);
    const hash=await sha256(`${user.id}:${phone}:${code}`);
    await rpc('portal_begin_verification',{p_user:user.id,p_email:user.email||'',p_phone:phone,p_hash:hash});
    const digits=code.split('').join(', ');
    const twiml=`<Response><Say voice="Polly.Joanna">This is your requested El Roi Call verification. Your six digit code is ${digits}. Again, ${digits}. If you did not request this call, please hang up.</Say></Response>`;
    let result:Response;
    try{result=await fetchDeadline(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`,{method:'POST',headers:{Authorization:`Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({To:phone,From:env.TWILIO_FROM_NUMBER,Twiml:twiml,Record:'false',Timeout:'25',TimeLimit:'90'})},15000,client);}
    catch{return response({ok:false,verify:'uncertain'},202);}
    if(!result.ok){await db(`portal_accounts?user_id=eq.${user.id}&verify_code=eq.${hash}`,'PATCH',{verify_code:null,verify_expires:null});throw new PortalError(503,'verification_call_failed');}
    return response({ok:true,verify:'calling'});
   }
   if(path==='/verify'&&request.method==='POST'){
    if(!acct?.pending_phone)throw new PortalError(400,'no_pending');
    if(typeof body.code!=='string'||!/^\d{6}$/.test(body.code))throw new PortalError(400,'wrong_code');
    const data=await rpc<{error?:string;phone_verified?:boolean}>('portal_finish_verification',{p_user:user.id,p_hash:await sha256(`${user.id}:${acct.pending_phone}:${body.code}`)});
    return response(data,data.error?400:200);
   }
   if(path==='/cancel'&&request.method==='POST'){
    if(!acct?.phone||!acct.phone_verified)throw new PortalError(403,'phone_not_verified');
    if(body.mode!=='all'&&typeof body.mode!=='undefined'&&!MODES.includes(String(body.mode)))throw new PortalError(400,'invalid_mode');
    const filter=MODES.includes(String(body.mode))?`&mode=eq.${body.mode}`:'';
    await db(`call_schedules?phone=eq.${encodeURIComponent(acct.phone)}${filter}`,'PATCH',{active:false});
    return response({ok:true});
   }
   // New bookings use the single planner; existing journeys remain visible and can be paused.
   if(path==='/schedule'&&request.method==='POST')throw new PortalError(410,'use_schedule_planner');
   throw new PortalError(404,'not_found');
  }catch(error){return response({error:error instanceof PortalError?error.message:'account_unavailable'},error instanceof PortalError?error.status:503);}
 };
}
