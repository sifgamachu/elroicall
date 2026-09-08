import { CONTENT_TYPES, WEEKDAYS, escapeXml, validatePlan, type CallPlanInput } from '../_shared/scheduling.ts';
import { equalSecret, fetchDeadline, verifyTwilio, type Secrets } from '../_shared/providers.ts';
import { sha256 } from '../_shared/member.ts';

export type PhoneDraft = { id:string; source_call_sid:string; phone:string; action:'book'|'pause_all'; plan:CallPlanInput; next_run_at:string; status:string; callback_sid:string|null; expires_at:string; schedule_id:string|null };
const SID=/^CA[0-9a-f]{32}$/i;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PENDING='dialing,submitted,uncertain';
const UNAVAILABLE='Scheduled learning calls are not accepting bookings yet. Nothing has been scheduled. You can still call El Roi whenever you want a conversation.';
class Issue extends Error { status:number; constructor(status:number,message:string){super(message);this.status=status;} }
export function readback(draft:PhoneDraft):string {
  if(draft.action==='pause_all')return 'Stop all future scheduled calls to this number, including Bible lessons and existing daily tracks.';
  const p=draft.plan;
  const when=new Intl.DateTimeFormat('en-US',{timeZone:p.timezone,weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'long'}).format(new Date(draft.next_run_at));
  const repeat=p.recurrence==='once'?'This is a one-time call.':`It repeats every ${p.weekdays.map(n=>WEEKDAYS[n]).join(', ')} at the same local time.`;
  return `A ${p.duration_minutes}-minute ${CONTENT_TYPES.find(t=>t.id===p.content_type)?.name}, about ${p.topic}, using the ${p.voice} AI voice. The first call is ${when}. ${repeat}`;
}
export function createPhoneSchedulingService(env:Secrets&{PHONE_BOOKING_VOICE_ENABLED?:string},client:typeof fetch=fetch){
  const base=`${env.SUPABASE_URL}/functions/v1/phone-scheduling`;
  const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation'};
  const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  const xml=(body:string)=>new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,{headers:{'Content-Type':'text/xml','Cache-Control':'no-store'}});
  const say=(text:string)=>`<Say>${escapeXml(text)}</Say>`;
  const end=(text='')=>xml(`${text?say(text):''}<Hangup/>`);
  async function db<T>(path:string,method='GET',body?:unknown):Promise<T>{
    const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)},8000,client);
    if(!r.ok){const data=await r.json().catch(()=>({}));if(data.code==='P0001')throw new Issue(400,String(data.message));throw new Issue(503,'The request could not be completed. Please try again.');}
    return r.status===204?undefined as T:await r.json();
  }
  const rpc=<T>(name:string,body:unknown={})=>db<T>(`rpc/${name}`,'POST',body);
  const draft=async(id:string)=>(await db<PhoneDraft[]>(`phone_booking_drafts?id=eq.${id}&limit=1`))[0];
  const phoneReady=()=>Boolean(env.TWILIO_ACCOUNT_SID&&env.TWILIO_AUTH_TOKEN&&env.TWILIO_FROM_NUMBER);
  async function ready(){
    if(env.PHONE_BOOKING_VOICE_ENABLED!=='true'||!phoneReady())return false;
    const runtime=await db<{heartbeat_at:string}[]>('lesson_runtime?id=eq.phone_booking&select=heartbeat_at&limit=1');
    if(!runtime[0]||Date.now()-new Date(runtime[0].heartbeat_at).getTime()>180000)return false;
    const r=await fetchDeadline(`${env.SUPABASE_URL}/functions/v1/scheduled-calls/capabilities`,{},8000,client);
    return r.ok&&(await r.json()).ready===true;
  }
  async function call(sid:string){
    if(!SID.test(sid))throw new Issue(403,'This phone call could not be verified.');
    const r=await fetchDeadline(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${sid}.json`,{headers:{Authorization:`Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`}},8000,client);
    if(!r.ok)throw new Issue(503,'This phone call could not be verified. Please try again.');
    const data=await r.json();
    if(data.sid!==sid||data.account_sid!==env.TWILIO_ACCOUNT_SID)throw new Issue(403,'This phone call could not be verified.');
    return data;
  }
  function destination(data:{direction:string;from:string;to:string}):string{
    const phone=data.direction==='inbound'&&data.to===env.TWILIO_FROM_NUMBER?data.from:data.direction==='outbound-api'&&data.from===env.TWILIO_FROM_NUMBER?data.to:'';
    if(!/^\+[1-9]\d{7,14}$/.test(phone)||phone===env.TWILIO_FROM_NUMBER)throw new Issue(403,'Please call from the number where you want to receive your lessons, with caller ID enabled.');
    return phone;
  }
  async function worker(){
    await db(`phone_booking_drafts?expires_at=lt.${encodeURIComponent(new Date().toISOString())}&status=in.(draft,queued,dialing,submitted,uncertain)`,'PATCH',{status:'expired'});
    // Short-lived abandoned drafts are removed; confirmed consent remains beside the schedule.
    await db(`phone_booking_drafts?expires_at=lt.${encodeURIComponent(new Date(Date.now()-7*86400000).toISOString())}&status=neq.confirmed`,'DELETE');
    await db(`phone_booking_drafts?expires_at=lt.${encodeURIComponent(new Date(Date.now()-7*86400000).toISOString())}&action=eq.pause_all&user_id=is.null`,'DELETE');
    await db('lesson_runtime?id=eq.phone_booking','PATCH',{heartbeat_at:new Date().toISOString()});
    if(!phoneReady())return {processed:0,ready:false};
    const items=await db<PhoneDraft[]>('phone_booking_drafts?status=eq.queued&order=created_at&limit=3');
    let processed=0;
    for(const item of items){
      try{
        const source=await call(item.source_call_sid);
        if(destination(source)!==item.phone)continue;
        // Wait for the conversation to finish; do not ring while the caller is still on the line.
        if(source.status!=='completed')continue;
        if(item.action==='book'&&!await ready())continue;
        const claimed=await db<PhoneDraft[]>(`phone_booking_drafts?id=eq.${item.id}&status=eq.queued`,'PATCH',{status:'dialing'});
        if(!claimed.length)continue;
        processed++;
        const form=new URLSearchParams({To:item.phone,From:env.TWILIO_FROM_NUMBER,Url:`${base}/verify/start?draft=${item.id}`,Method:'POST',StatusCallback:`${base}/verify/status?draft=${item.id}`,StatusCallbackMethod:'POST',StatusCallbackEvent:'completed',Timeout:'25',TimeLimit:'240',Record:'false'});
        try{
          const r=await fetchDeadline(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`,{method:'POST',headers:{Authorization:`Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,'Content-Type':'application/x-www-form-urlencoded'},body:form},12000,client);
          if(!r.ok){await db(`phone_booking_drafts?id=eq.${item.id}&status=eq.dialing`,'PATCH',{status:r.status<500?'failed':'uncertain'});continue;}
          const result=await r.json();
          if(!SID.test(result.sid||''))throw Error('uncertain');
          await db(`phone_booking_drafts?id=eq.${item.id}&status=eq.dialing`,'PATCH',{callback_sid:result.sid,status:'submitted'});
        }catch{await db(`phone_booking_drafts?id=eq.${item.id}&status=eq.dialing`,'PATCH',{status:'uncertain'}).catch(()=>{});}
        // Ambiguous create-call results are never retried. Signed webhooks can reconcile them.
      }catch{ /* Leave unclaimed drafts for a later tick; no provider or caller data in logs. */ }
    }
    return {processed,ready:true};
  }
  async function webhook(request:Request,url:URL,path:string){
    if(request.method!=='POST'||!phoneReady())return new Response('Unauthorized',{status:401});
    const raw=await request.text();if(raw.length>16384)return new Response('Too large',{status:413});
    const form=new URLSearchParams(raw);
    if(!await verifyTwilio(`${base}${path}${url.search}`,form,request.headers.get('x-twilio-signature')||'',env.TWILIO_AUTH_TOKEN)||form.get('AccountSid')!==env.TWILIO_ACCOUNT_SID)return new Response('Unauthorized',{status:401});
    const id=url.searchParams.get('draft')||'';if(!UUID.test(id))return end();
    let item=await draft(id);const sid=form.get('CallSid')||'';
    if(!item||!SID.test(sid)||form.get('To')!==item.phone||form.get('From')!==env.TWILIO_FROM_NUMBER)return end();
    if(item.callback_sid&&item.callback_sid!==sid)return end();
    if(item.status==='confirmed')return end(item.action==='book'?'Your schedule is already saved. Goodbye.':'Your scheduled calls are already stopped. Goodbye.');
    if(!PENDING.split(',').includes(item.status)||new Date(item.expires_at).getTime()<Date.now())return end('This confirmation has expired. Nothing was scheduled. Please call El Roi again.');
    if(!item.callback_sid){
      // A webhook may arrive before the Calls API response. Bind it once using the signed destination.
      const bound=await db<PhoneDraft[]>(`phone_booking_drafts?id=eq.${id}&callback_sid=is.null&status=in.(${PENDING})`,'PATCH',{callback_sid:sid,status:'submitted'});
      item=bound[0]||await draft(id);
      if(item.callback_sid!==sid)return end();
    }
    if(path==='/verify/status'){
      if(['completed','busy','failed','no-answer','canceled'].includes(form.get('CallStatus')||''))await db(`phone_booking_drafts?id=eq.${id}&status=in.(${PENDING})`,'PATCH',{status:'cancelled'});
      return end();
    }
    if(path==='/verify/start'){
      // Start is deliberately separate: voicemail hears no private topic, and DTMF is needed to proceed.
      return xml(`<Gather input="dtmf" numDigits="1" timeout="8" action="${escapeXml(`${base}/verify/review?draft=${id}`)}" method="POST" actionOnEmptyResult="true">${say(`Hello, this is El Roi Call using an automated voice. You requested a scheduling confirmation. Press 1 to hear your request. If you did not request this call, hang up.`)}</Gather><Hangup/>`);
    }
    if(path==='/verify/review'&&form.get('Digits')==='1'){
      const instruction=item.action==='book'?'Press 1 to agree to these automated calls and save this schedule.':'Press 1 to stop all scheduled calls to this number.';
      return xml(`${say(readback(item))}<Gather input="dtmf" numDigits="1" timeout="10" action="${escapeXml(`${base}/verify/confirm?draft=${id}`)}" method="POST" actionOnEmptyResult="true">${say(`${instruction} Press 9 to cancel this request. You can stop future lesson calls by pressing 9 during a lesson or through your dashboard.`)}</Gather><Hangup/>`);
    }
    if(path!=='/verify/confirm'||form.get('Digits')!=='1'){
      await db(`phone_booking_drafts?id=eq.${id}&status=in.(${PENDING})`,'PATCH',{status:'cancelled'});
      return end('The request was cancelled. No changes were made.');
    }
    if(item.action==='book'&&!await ready())return end(UNAVAILABLE);
    // Only the signed recipient confirmation reaches account resolution or schedule creation.
    let owner=await rpc<string|null>('phone_booking_owner',{p_phone:item.phone});
    if(!owner&&item.action==='book'){
      const r=await fetchDeadline(`${env.SUPABASE_URL}/auth/v1/admin/users`,{method:'POST',headers,body:JSON.stringify({phone:item.phone,phone_confirm:true})},8000,client);
      if(r.ok){const user=await r.json();owner=user.id;}
      else owner=await rpc<string|null>('phone_booking_owner',{p_phone:item.phone}); // concurrent creation
      if(!owner||!UUID.test(owner))throw new Issue(503,'Your account could not be connected. No lesson was scheduled. Please try again.');
    }
    const result=await rpc<{confirmed:boolean}>('phone_booking_commit',{p_id:id,p_sid:sid,p_user:owner});
    if(!result.confirmed)throw new Issue(503,'We could not confirm that the request was saved. Please check your dashboard or call again.');
    return end(item.action==='book'?`Your schedule is saved. ${readback(item)} You can manage it in your El Roi dashboard using this verified number. Goodbye.`:'All future scheduled calls to this number are stopped. You can still call us whenever you want. Goodbye.');
  }
  return async(request:Request):Promise<Response>=>{
    const url=new URL(request.url);const path=url.pathname.split('/phone-scheduling')[1]||'/';
    try{
      if(path.startsWith('/verify/'))return await webhook(request,url,path);
      if(path==='/capabilities'&&request.method==='GET'){
        const response=json({version:1,ready:await ready(),confirmation:'callback_keypad',minimum_notice_minutes:40});
        response.headers.set('Access-Control-Allow-Origin',env.SITE_ORIGIN||'https://elroicall.com');response.headers.set('Vary','Origin');return response;
      }
      if(path==='/dispatch'){
        const secret=request.headers.get('x-scheduler-secret')||'';
        const valid=env.SCHEDULER_SECRET?await equalSecret(secret,env.SCHEDULER_SECRET):Boolean(secret&&env.SCHEDULER_SECRET_SHA256&&await equalSecret(await sha256(secret),env.SCHEDULER_SECRET_SHA256));
        if(request.method!=='POST'||!valid)throw new Issue(401,'Unauthorized');
        return json(await worker());
      }
      if(request.method!=='POST'||!await equalSecret(request.headers.get('authorization')||'',`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`)||!env.SUPABASE_SERVICE_ROLE_KEY)throw new Issue(401,'Unauthorized');
      if(!phoneReady())throw new Issue(503,UNAVAILABLE);
      const raw=await request.text();if(raw.length>8192)throw new Issue(413,'Request too large.');
      let body:Record<string,unknown>;try{body=JSON.parse(raw);}catch{throw new Issue(400,'Invalid request.');}
      const sid=typeof body.call_sid==='string'?body.call_sid:'';
      const source=await call(sid);
      if(source.status!=='in-progress')throw new Issue(403,'Please start a new call to schedule a lesson.');
      const phone=destination(source);
      if(path==='/draft'){
        const action=body.action==='pause_all'?'pause_all':'book';
        if(action==='book'&&!await ready())throw new Issue(503,UNAVAILABLE);
        const plan={...(body.plan as object),request_id:crypto.randomUUID(),consent:true};
        if(action==='book'){const error=validatePlan(plan);if(error)throw new Issue(400,error);}
        if(!await rpc<boolean>('lesson_rate_limit',{p_key:`phone-draft:${await sha256(phone)}`,p_limit:12}))throw new Issue(429,'Please wait before requesting another schedule.');
        const item=await rpc<PhoneDraft>('phone_booking_prepare',{p_call:sid,p_phone:phone,p_action:action,p_plan:plan});
        return json({draft_id:item.id,booked:false,speech:`${readback(item)} Is that right, and may we make one automated confirmation call to this number after you hang up? Nothing is saved until you answer that call and press 1 to confirm.`});
      }
      if(path==='/confirm'){
        if(body.consent!==true)throw new Issue(400,'Ask permission for the confirmation call first.');
        const id=typeof body.draft_id==='string'?body.draft_id:'';if(!UUID.test(id))throw new Issue(400,'Please review the schedule first.');
        const item=await draft(id);
        if(!item||item.source_call_sid!==sid||item.phone!==phone||new Date(item.expires_at).getTime()<Date.now())throw new Issue(400,'Please review your choices again before confirming.');
        if(item.status==='draft'){
          if(!await rpc<boolean>('lesson_rate_limit',{p_key:`phone-callback:${await sha256(phone)}`,p_limit:3}))throw new Issue(429,'You have reached the confirmation call limit. Please try again in an hour.');
          await db(`phone_booking_drafts?id=eq.${id}&status=eq.draft`,'PATCH',{status:'queued'});
        }else if(!['queued','dialing','submitted','uncertain'].includes(item.status))throw new Issue(400,'This request is closed. Please call again.');
        return json({booked:false,callback_requested:true,speech:'Your confirmation call is requested. Please hang up when you are ready; it should arrive within two minutes. Answer it, listen to the details, and press 1 to save. If it does not arrive, no schedule is confirmed. Please call again later.'});
      }
      throw new Issue(404,'Not found');
    }catch(error){
      const message=error instanceof Issue?error.message:'We could not confirm that the request was saved. Please check your dashboard or call again.';
      if(path.startsWith('/verify/'))return end(message);
      return json({error:message,booked:false},error instanceof Issue?error.status:503);
    }
  };
}
