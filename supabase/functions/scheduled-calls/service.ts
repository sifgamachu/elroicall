import { validatePlan, VOICES, type CallPlanInput, type Voice } from '../_shared/scheduling.ts';
import { equalSecret, fetchDeadline, generateLesson, generateSpeech, lessonTwiml, placeCall, verifyTwilio, type Secrets } from '../_shared/providers.ts';

type ScheduleRow = CallPlanInput & { id: string; user_id: string; phone: string; active: boolean; next_run_at: string | null; created_at: string };
type Job = { id: string; schedule_id: string; due_at: string; status: string; script_chunks: string[]; audio_paths: string[]; call_sid: string | null; accepted: boolean; lesson_finished: boolean; failures: number; reference_list: string[]; title: string | null };
class HttpError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status=status; } }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = 'scheduled-call-audio';
const terminal = ['completed','busy','failed','no-answer','canceled','cancelled','missed'];
const hangup = '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>';

export function createSchedulingService(env: Secrets, client: typeof fetch = fetch) {
  const origin=env.SITE_ORIGIN || 'https://elroicall.com';
  const base=`${env.SUPABASE_URL}/functions/v1/scheduled-calls`;
  const serviceHeaders={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=representation'};
  const configured=()=>[env.SUPABASE_URL,env.SUPABASE_ANON_KEY,env.SUPABASE_SERVICE_ROLE_KEY,env.OPENAI_API_KEY,env.TWILIO_ACCOUNT_SID,env.TWILIO_AUTH_TOKEN,env.TWILIO_FROM_NUMBER,env.SCHEDULER_SECRET].every(Boolean);
  const enabled=()=>env.SCHEDULED_CALLS_ENABLED==='true'&&configured();
  const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS',Vary:'Origin'}});
  const xml=(body:string)=>new Response(body,{headers:{'Content-Type':'text/xml','Cache-Control':'no-store'}});
  async function db<T>(path:string,method='GET',body?:unknown):Promise<T> {
    const response=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/${path}`,{method,headers:serviceHeaders,body:body===undefined?undefined:JSON.stringify(body)},15000,client);
    if(!response.ok) {
      const error=await response.json().catch(()=>({}));
      if(error.code==='P0001') throw new HttpError(400,String(error.message));
      throw new Error(`database_${response.status}`);
    }
    return response.status===204?undefined as T:await response.json() as T;
  }
  const rpc=<T>(name:string,args:unknown={})=>db<T>(`rpc/${name}`,'POST',args);
  const schedule=async(id:string)=>(await db<ScheduleRow[]>(`lesson_schedules?id=eq.${id}&limit=1`))[0];
  const job=async(id:string)=>(await db<Job[]>(`lesson_jobs?id=eq.${id}&limit=1`))[0];
  async function user(request:Request):Promise<string> {
    const authorization=request.headers.get('authorization');
    if(!authorization?.startsWith('Bearer ')) throw new HttpError(401,'Sign in to manage your calls.');
    const response=await fetchDeadline(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:authorization,apikey:env.SUPABASE_ANON_KEY}},10000,client);
    if(!response.ok) throw new HttpError(401,'Your sign-in expired. Sign in again.');
    const data=await response.json();
    if(typeof data.id!=='string'||!UUID.test(data.id)) throw new HttpError(401,'Sign in again.');
    return data.id;
  }
  async function verifiedPhone(request:Request):Promise<string> {
    // Trust the authenticated existing portal, never a phone from the POST body.
    const response=await fetchDeadline(`${env.SUPABASE_URL}/functions/v1/portal/me`,{headers:{Authorization:request.headers.get('authorization')!,apikey:env.SUPABASE_ANON_KEY}},12000,client);
    if(!response.ok) throw new HttpError(503,'Your verified number could not be checked.');
    const data=await response.json();
    if(data.phone_verified!==true||typeof data.phone!=='string'||!/^\+[1-9]\d{7,14}$/.test(data.phone)) throw new HttpError(403,'Verify your phone in your room first.');
    return data.phone;
  }
  async function ready():Promise<boolean> {
    if(!enabled()) return false;
    const rows=await db<{id:string;heartbeat_at:string}[]>('lesson_runtime?select=id,heartbeat_at');
    return ['delivery','preparation'].every(id=>rows.some(row=>row.id===id&&Date.now()-new Date(row.heartbeat_at).getTime()<180000));
  }
  function publicPlan(plan:ScheduleRow,jobs:Job[]=[]) {
    const related=jobs.filter(item=>item.schedule_id===plan.id);
    const pending=related.filter(item=>['queued','preparing','ready','dialing','submitted'].includes(item.status)).map(item=>item.due_at).sort()[0];
    const last=related.filter(item=>terminal.includes(item.status)||item.status==='uncertain').sort((a,b)=>b.due_at.localeCompare(a.due_at))[0];
    return {id:plan.id,request_id:plan.request_id,content_type:plan.content_type,topic:plan.topic,voice:plan.voice,local_time:plan.local_time,timezone:plan.timezone,recurrence:plan.recurrence,weekdays:plan.weekdays,start_date:plan.start_date,duration_minutes:plan.duration_minutes,active:plan.active,created_at:plan.created_at,phone_last4:plan.phone.slice(-4),next_run_at:plan.active&&pending&&(!plan.next_run_at||pending<plan.next_run_at)?pending:plan.next_run_at,last_status:last?.status==='completed'?(last.lesson_finished?'lesson_finished':last.accepted?'call_ended':'not_started'):last?.status,last_called_at:last?.due_at,references:last?.reference_list??[]};
  }
  async function signedAudio(path:string):Promise<string> {
    const response=await fetchDeadline(`${env.SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${path}`,{method:'POST',headers:serviceHeaders,body:JSON.stringify({expiresIn:3600})},10000,client);
    if(!response.ok) throw new Error('audio_not_found');
    const data=await response.json();
    if(typeof data.signedURL!=='string'||!data.signedURL.startsWith('/object/sign/')) throw new Error('audio_url_invalid');
    return `${env.SUPABASE_URL}/storage/v1${data.signedURL}`;
  }
  async function uploadAudio(path:string,bytes:ArrayBuffer) {
    const response=await fetchDeadline(`${env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,{method:'POST',headers:{...serviceHeaders,'Content-Type':'audio/mpeg','x-upsert':'true'},body:bytes},20000,client);
    if(!response.ok) throw new Error('audio_upload_failed');
  }
  async function prepare(item:Job) {
    try {
      const plan=await schedule(item.schedule_id);
      if(!plan?.active) return;
      if(!item.script_chunks.length) {
        const recent=await db<{title:string}[]>(`lesson_jobs?schedule_id=eq.${plan.id}&title=not.is.null&order=due_at.desc&limit=5&select=title`);
        const lesson=await generateLesson(env,plan,client,recent.map(item=>item.title));
        await db(`lesson_jobs?id=eq.${item.id}&status=eq.preparing`,'PATCH',{title:lesson.title,reference_list:lesson.references,script_chunks:lesson.chunks,status:'queued',lease_until:null});
      } else {
        const indexes=Array.from({length:Math.min(3,item.script_chunks.length-item.audio_paths.length)},(_,i)=>item.audio_paths.length+i);
        if(!indexes.length) throw new Error('audio_sequence_invalid');
        const newPaths=await Promise.all(indexes.map(async index=>{
          const path=`${item.id}/${index}.mp3`;
          await uploadAudio(path,await generateSpeech(env,plan.voice,item.script_chunks[index],client));
          return path;
        }));
        const paths=[...item.audio_paths,...newPaths];
        await db(`lesson_jobs?id=eq.${item.id}&status=eq.preparing`,'PATCH',{audio_paths:paths,status:paths.length===item.script_chunks.length?'ready':'queued',lease_until:null});
      }
    } catch(issue) {
      // Error codes only; never log topics, phone numbers, scripts, or provider bodies.
      const code=issue instanceof Error&&/^(content_|speech_|audio_)/.test(issue.message)?issue.message:'preparation_failed';
      await db(`lesson_jobs?id=eq.${item.id}&status=eq.preparing`,'PATCH',{status:item.failures+1>=3?'failed':'queued',failures:item.failures+1,error_code:code,lease_until:null}).catch(()=>{});
    }
  }
  async function deliver(item:Job) {
    try {
      const plan=await schedule(item.schedule_id);
      if(!plan?.active) { await db(`lesson_jobs?id=eq.${item.id}&status=eq.dialing`,'PATCH',{status:'cancelled'}); return; }
      // Account removal cascades schedules; re-read immediately before dialing.
      const sid=await placeCall(env,plan.phone,item.id,client);
      await db(`lesson_jobs?id=eq.${item.id}&status=in.(dialing,uncertain)`,'PATCH',{status:'submitted',call_sid:sid});
    } catch(issue) {
      const knownRejection=issue instanceof Error&&issue.message.startsWith('call_rejected_');
      await db(`lesson_jobs?id=eq.${item.id}&status=eq.dialing`,'PATCH',{status:knownRejection?'failed':'uncertain',error_code:knownRejection?'provider_rejected':'provider_result_unknown'}).catch(()=>{});
    }
  }
  async function dispatch(preparing = false) {
    const heartbeat=preparing?'preparation':'delivery';
    const markHealthy=async()=>{
      const response=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/lesson_runtime?on_conflict=id`,{method:'POST',headers:{...serviceHeaders,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:heartbeat,heartbeat_at:new Date().toISOString()})},10000,client);
      if(!response.ok) throw new Error('heartbeat_failed');
    };
    if(!enabled()) { await markHealthy(); return {enabled:false}; }
    await rpc('lesson_enqueue');
    if (!preparing) {
      for(let i=0;i<3;i++) { const due=await rpc<Job[]>('lesson_claim_delivery'); if(!due.length) break; await deliver(due[0]); }
      await markHealthy(); return {enabled:true};
    }
    const preparation=await rpc<Job[]>('lesson_claim_preparation');
    await Promise.allSettled(preparation.map(prepare));
    await markHealthy(); return {enabled:true,preparing:preparation.length};
  }
  async function twilio(request:Request,url:URL) {
    const id=url.searchParams.get('job');
    if(request.method!=='POST'||!id||!UUID.test(id)) throw new HttpError(404,'Not found');
    if(!env.TWILIO_AUTH_TOKEN) throw new HttpError(503,'Voice service is unavailable.');
    const form=new URLSearchParams(await request.text());
    const canonical=`${base}${url.pathname.split('/scheduled-calls')[1]}${url.search}`;
    if(!await verifyTwilio(canonical,form,request.headers.get('x-twilio-signature')||'',env.TWILIO_AUTH_TOKEN)) throw new HttpError(403,'Invalid signature');
    if(form.get('AccountSid')!==env.TWILIO_ACCOUNT_SID) throw new HttpError(403,'Invalid account');
    const current=await job(id);
    if(!current) return xml(hangup);
    const plan=await schedule(current.schedule_id);
    const sid=form.get('CallSid')||'';
    if(!plan||form.get('To')!==plan.phone||!/^CA[0-9a-f]{32}$/i.test(sid)||(current.call_sid&&current.call_sid!==sid)) throw new HttpError(403,'Invalid call');
    if(url.pathname.endsWith('/status')) {
      const status=form.get('CallStatus')||'';
      if(['completed','busy','failed','no-answer','canceled'].includes(status)&&!terminal.includes(current.status)) await db(`lesson_jobs?id=eq.${id}&status=not.in.(completed,busy,failed,no-answer,canceled,cancelled,missed)`,'PATCH',{status,call_sid:sid,finished_at:new Date().toISOString()});
      return new Response(null,{status:204});
    }
    if(!enabled()||!plan.active||!['dialing','submitted','uncertain'].includes(current.status)||Date.now()-new Date(current.due_at).getTime()>3600000) return xml(hangup);
    if(!current.call_sid) await db(`lesson_jobs?id=eq.${id}&call_sid=is.null`,'PATCH',{call_sid:sid});
    if(form.get('Digits')==='9') { await rpc('lesson_pause_plan',{p_user:plan.user_id,p_id:plan.id}); return xml(hangup); }
    if(url.pathname.endsWith('/start')) return xml(lessonTwiml(await signedAudio(current.audio_paths[0]),`${base}/voice/lesson?job=${id}&part=1`,true));
    const part=Number(url.searchParams.get('part'));
    if(!Number.isInteger(part)||part<1||part>current.audio_paths.length) return xml(hangup);
    if(part===1) {
      if(form.get('Digits')!=='1') return xml(hangup);
      await db(`lesson_jobs?id=eq.${id}`,'PATCH',{accepted:true});
    } else if(!current.accepted) return xml(hangup);
    if(part===current.audio_paths.length) { await db(`lesson_jobs?id=eq.${id}`,'PATCH',{lesson_finished:true}); return xml(hangup); }
    return xml(lessonTwiml(await signedAudio(current.audio_paths[part]),`${base}/voice/lesson?job=${id}&part=${part+1}`));
  }
  return async function handle(request:Request):Promise<Response> {
    const url=new URL(request.url);
    const path=url.pathname.split('/scheduled-calls')[1]||'/';
    try {
      if(request.method==='OPTIONS') return json({ok:true});
      if(path.startsWith('/voice/')) return await twilio(request,url);
      if(path==='/dispatch'||path==='/prepare') {
        if(request.method!=='POST'||!await equalSecret(request.headers.get('x-scheduler-secret')||'',env.SCHEDULER_SECRET)) throw new HttpError(401,'Unauthorized');
        return json(await dispatch(path==='/prepare'));
      }
      if(path==='/capabilities'&&request.method==='GET') return json({version:1,ready:await ready(),voices:VOICES});
      const owner=await user(request);
      if(path==='/plans'&&request.method==='GET') {
        const plans=await db<ScheduleRow[]>(`lesson_schedules?user_id=eq.${owner}&order=created_at.desc&limit=50`);
        const ids=plans.map(plan=>plan.id);
        const jobs=ids.length?await db<Job[]>(`lesson_jobs?schedule_id=in.(${ids.join(',')})&order=due_at.desc&limit=250`):[];
        return json({plans:plans.map(plan=>publicPlan(plan,jobs))});
      }
      const pauseId=path.match(/^\/plans\/([0-9a-f-]+)\/pause$/i)?.[1];
      if(pauseId&&UUID.test(pauseId)&&request.method==='POST') {
        const paused=await rpc<boolean>('lesson_pause_plan',{p_user:owner,p_id:pauseId});
        if(!paused) throw new HttpError(404,'Schedule not found.');
        return json({ok:true});
      }
      if(!await ready()) throw new HttpError(503,'Scheduled calls are not accepting bookings yet.');
      if(path==='/plans'&&request.method==='POST') {
        if(Number(request.headers.get('content-length')||0)>8192) throw new HttpError(413,'Request too large.');
        const raw=await request.text(); if(raw.length>8192) throw new HttpError(413,'Request too large.');
        let payload:CallPlanInput; try { payload=JSON.parse(raw); } catch { throw new HttpError(400,'Invalid schedule.'); }
        const validation=validatePlan(payload); if(validation) throw new HttpError(400,validation);
        if(!await rpc<boolean>('lesson_rate_limit',{p_key:`plans:${owner}`,p_limit:20})) throw new HttpError(429,'Please wait before creating another schedule.');
        const phone=await verifiedPhone(request);
        const existing=await db<ScheduleRow[]>(`lesson_schedules?user_id=eq.${owner}&request_id=eq.${payload.request_id}&limit=1`);
        if(existing.length) {
          const old=existing[0];
          if(old.content_type!==payload.content_type||old.topic!==payload.topic||old.voice!==payload.voice||old.local_time.slice(0,5)!==payload.local_time||old.timezone!==payload.timezone||old.recurrence!==payload.recurrence||old.start_date!==payload.start_date||old.duration_minutes!==payload.duration_minutes||JSON.stringify(old.weekdays)!==JSON.stringify(payload.weekdays)||old.phone!==phone) throw new HttpError(409,'This request was already used for different choices.');
          return json({plan:publicPlan(old)});
        }
        const plan=await rpc<ScheduleRow>('lesson_create_plan',{p_user:owner,p_phone:phone,p_plan:payload});
        return json({plan:publicPlan(plan)},201);
      }
      const previewVoice=path.match(/^\/voice-preview\/([a-z]+)$/)?.[1];
      if(previewVoice&&request.method==='GET'&&VOICES.some(voice=>voice.id===previewVoice)) {
        if(!await rpc<boolean>('lesson_rate_limit',{p_key:`preview:${owner}`,p_limit:12})) throw new HttpError(429,'Please wait before requesting another sample.');
        const object=`previews/${previewVoice}-v1.mp3`;
        try { return json({url:await signedAudio(object)}); } catch { /* Create the shared sample on first use. */ }
        const text='Welcome to El Roi Call. This is an AI generated voice. You can choose a Bible study, sermon, lecture, story, or Bible facts, at a time that works for you. Let us make a little room for Scripture together.';
        await uploadAudio(object,await generateSpeech(env,previewVoice as Voice,text,client));
        return json({url:await signedAudio(object)});
      }
      throw new HttpError(404,'Not found.');
    } catch(issue) {
      if(issue instanceof HttpError) return json({error:issue.message},issue.status);
      return json({error:'The service could not complete this request. Please try again.'},503);
    }
  };
}
