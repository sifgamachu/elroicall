import {fetchDeadline,verifyTwilio} from './providers.ts';
import {escapeXml} from './scheduling.ts';
import {callOpening,pinDigest,PIN_NOTICE,PIN_SETUP_NOTICE,SIGNUP_NOTICE} from './call-identity.ts';

export type GuardEnv={SUPABASE_URL:string;SUPABASE_SERVICE_ROLE_KEY:string;TWILIO_ACCOUNT_SID:string;TWILIO_AUTH_TOKEN:string;TWILIO_FROM_NUMBER:string};
export type CallPermit={call_sid:string;phone:string;kind:'inbound'|'outbound'|'lesson';context_id:string|null;user_id:string|null;status:string;duration_minutes:number;relay_token:string;deadline_at:string|null;pin_salt?:string;nickname?:string};
type CarrierCall={sid:string;account_sid:string;from:string;to:string;direction:string;status:string;start_time:string};
const SID=/^CA[0-9a-f]{32}$/i;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const xml=(content:string)=>new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${content}</Response>`,{headers:{'Content-Type':'text/xml','Cache-Control':'no-store'}});
const say=(message:string)=>`<Say voice="Polly.Joanna">${escapeXml(message)}</Say>`;
const stop=(message:string)=>xml(say(message)+'<Hangup/>');
const unavailable=()=>stop('We cannot verify this call right now. Please try again later, or visit elroicall dot com.');
export function remainingSeconds(permit:CallPermit,now=Date.now()):number{return Math.max(0,Math.ceil((Date.parse(permit.deadline_at||'')-now)/1000))||0;}

export function createCallGuard(env:GuardEnv,client:typeof fetch=fetch){
 const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
 async function rpc<T>(name:string,args:unknown={}):Promise<T>{
  const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers,body:JSON.stringify(args)},10000,client);
  if(!r.ok)throw Error('call_access_unavailable');return r.json();
 }
 const enabled=()=>rpc<boolean>('calling_security_enabled');
 const get=(callSid:string)=>rpc<CallPermit|null>('calling_access_get',{p_call:callSid});
 const permit=(callSid:string,token:string)=>SID.test(callSid)&&UUID.test(token)?rpc<CallPermit|null>('calling_access_permit',{p_call:callSid,p_token:token}):Promise.resolve(null);
 const end=(callSid:string)=>rpc('calling_access_end',{p_call:callSid});
 function carrierUrl(sid:string){return `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${sid}.json`;}
 const carrierHeaders=()=>({Authorization:`Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,'Content-Type':'application/x-www-form-urlencoded'});
 async function verifyCarrier(req:Request,form:URLSearchParams,kind:CallPermit['kind']):Promise<CarrierCall>{
  const sid=form.get('CallSid')||'';
  if(!SID.test(sid)||!env.TWILIO_AUTH_TOKEN||!env.TWILIO_ACCOUNT_SID||!env.TWILIO_FROM_NUMBER)throw Error('unverified_call');
  const url=new URL(req.url);const canonical=`${env.SUPABASE_URL}${url.pathname.startsWith('/functions/v1/')?url.pathname:'/functions/v1'+url.pathname}${url.search}`;
  if(form.get('AccountSid')!==env.TWILIO_ACCOUNT_SID||!await verifyTwilio(canonical,form,req.headers.get('x-twilio-signature')||'',env.TWILIO_AUTH_TOKEN))throw Error('unverified_call');
  const r=await fetchDeadline(carrierUrl(sid),{headers:carrierHeaders()},10000,client);
  if(!r.ok)throw Error('unverified_call');const call:CarrierCall=await r.json();
  const incoming=kind==='inbound';
  if(call.sid!==sid||call.account_sid!==env.TWILIO_ACCOUNT_SID||call.status!=='in-progress'||(incoming?call.direction!=='inbound':!call.direction.startsWith('outbound'))||call.from!==form.get('From')||call.to!==form.get('To')||(incoming?call.to:call.from)!==env.TWILIO_FROM_NUMBER)throw Error('unverified_call');
  return call;
 }
 async function limit(call:CarrierCall,access:CallPermit){
  const remaining=remainingSeconds(access);const start=Date.parse(call.start_time);
  if(!remaining||!Number.isFinite(start))throw Error('call_expired');
  // Twilio TimeLimit is total call age, not a new duration starting at this update.
  const total=Math.max(1,Math.ceil((Date.now()-start)/1000)+remaining);
  const r=await fetchDeadline(carrierUrl(call.sid),{method:'POST',headers:carrierHeaders(),body:new URLSearchParams({TimeLimit:String(total)})},10000,client);
  if(!r.ok)throw Error('call_limit_unavailable');
 }
 function challenge(access:CallPermit,callback:string,retry=false):Response{
  if(access.status==='signup')return stop(SIGNUP_NOTICE);
  if(access.status==='setup')return stop(PIN_SETUP_NOTICE);
  if(!['pending_pin','pending_guest'].includes(access.status))return unavailable();
  const guest=access.status==='pending_guest';
  const message=retry?'That PIN did not match. Please try again using your keypad.':callOpening(access.duration_minutes,guest)+(access.kind==='lesson'?'':' Calls may be recorded. This is not a crisis service.')+(guest?' Press 1 to accept and begin.':` ${PIN_NOTICE}`);
  return xml(`<Gather input="dtmf" numDigits="${guest?1:6}" timeout="12" actionOnEmptyResult="true" method="POST" action="${escapeXml(callback)}">${say(message)}</Gather><Hangup/>`);
 }
 /** Run before any private context, generated greeting, audio URL, or model session. */
 async function enter(req:Request,form:URLSearchParams,options:{kind:CallPermit['kind'];context?:string|null;callback:string;resume:string;answer?:boolean}):Promise<{response?:Response;access?:CallPermit}>{
  try{
   if(!await enabled())return {};
   if(req.method!=='POST')return {response:unavailable()};
   const call=await verifyCarrier(req,form,options.kind);
   const phone=options.kind==='inbound'?call.from:call.to;
   const sid=call.sid;
   let access=await get(sid);
   if(!access){
    if(options.answer)return {response:unavailable()};
    await rpc('calling_access_begin',{p_call:sid,p_phone:phone,p_kind:options.kind,p_context:options.context||null});
    access=await get(sid);
   }
   if(!access||access.phone!==phone||access.kind!==options.kind||access.context_id!==(options.context||null))return {response:unavailable()};
   if(['member','guest'].includes(access.status)){
    const grant=await permit(sid,access.relay_token);
    if(!grant)return {response:unavailable()};
    // Also run on duplicate webhooks: a previous provider update may have failed.
    await limit(call,grant);
    return options.answer?{response:xml(`<Redirect method="POST">${escapeXml(options.resume)}</Redirect>`)}:{access:grant};
   }
   if(!options.answer)return {response:challenge(access,options.callback)};
   const digits=form.get('Digits')||'';
   if(!digits)return {response:stop('No PIN or selection was entered. You can call again when you are ready.')};
   const guest=access.status==='pending_guest';
   if(guest&&digits!=='1')return {response:stop('Your guest call has not started. Goodbye for now.')};
   if(!['pending_guest','pending_pin'].includes(access.status))return {response:challenge(access,options.callback)};
   // Malformed PIN attempts count too. No PIN is sent to an AI or placed in a URL.
   const digest=!guest&&/^\d{6}$/.test(digits)&&access.pin_salt&&access.user_id?await pinDigest(digits,access.pin_salt,access.user_id,env.SUPABASE_SERVICE_ROLE_KEY):null;
   const result=await rpc<CallPermit>('calling_access_verify',{p_call:sid,p_salt:access.pin_salt||null,p_digest:digest,p_guest:guest});
   if(result.status==='wrong_pin')return {response:challenge(access,options.callback,true)};
   if(result.status==='locked')return {response:stop('We could not verify your PIN. Please wait 15 minutes before trying again, or reset your calling PIN in your signed in dashboard.')};
   if(!['guest','member'].includes(result.status))return {response:challenge(result,options.callback)};
   try{await limit(call,result);}catch{await end(sid);throw Error('call_limit_unavailable');}
   return {response:xml((result.status==='member'?say(`Thank you, ${result.nickname||'friend'}. You are verified.`):'')+`<Redirect method="POST">${escapeXml(options.resume)}</Redirect>`)};
  }catch{return {response:unavailable()};}
 }
 return {enabled,get,permit,end,enter};
}
