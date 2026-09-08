import { equalSecret,fetchDeadline,type Secrets } from '../_shared/providers.ts';
import { sha256 } from '../_shared/member.ts';
import { NOTE_UUID,validateMemoryNote,type MemorySnapshot } from '../_shared/continuity.ts';
type Env=Secrets&{VOICE_CONTINUITY_ENABLED?:string};
class Failure extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function createContinuityService(env:Env,client:typeof fetch=fetch){
 const serviceHeaders={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
 const phoneReady=()=>env.VOICE_CONTINUITY_ENABLED==='true'&&Boolean(env.TWILIO_ACCOUNT_SID&&env.TWILIO_AUTH_TOKEN&&env.TWILIO_FROM_NUMBER);
 const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':env.SITE_ORIGIN||'https://elroicall.com','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS',Vary:'Origin'}});
 async function rpc<T>(name:string,body:unknown):Promise<T>{
  const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:serviceHeaders,body:JSON.stringify(body)},10000,client);
  if(!r.ok){const e=await r.json().catch(()=>({}));if(e.code==='P0001')throw new Failure(409,String(e.message));throw new Failure(503,'Your notes could not be updated. Refresh before trying again.');}
  return await r.json();
 }
 async function limit(key:string,n:number){if(!await rpc<boolean>('lesson_rate_limit',{p_key:key,p_limit:n}))throw new Failure(429,'Please wait before trying again.');}
 async function verifiedCall(sid:unknown):Promise<{sid:string;phone:string}>{
  if(typeof sid!=='string'||!/^CA[0-9a-f]{32}$/i.test(sid))throw new Failure(403,'Call not verified.');
  const r=await fetchDeadline(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${sid}.json`,{headers:{Authorization:`Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`}},8000,client);
  if(!r.ok)throw new Failure(503,'This call could not be verified.');
  const c=await r.json();
  const phone=c.direction==='inbound'&&c.to===env.TWILIO_FROM_NUMBER?c.from:c.direction==='outbound-api'&&c.from===env.TWILIO_FROM_NUMBER?c.to:'';
  if(c.sid!==sid||c.account_sid!==env.TWILIO_ACCOUNT_SID||c.status!=='in-progress'||!/^\+[1-9]\d{7,14}$/.test(phone)||phone===env.TWILIO_FROM_NUMBER)throw new Failure(403,'Call from your verified number to share a note.');
  return {sid,phone};
 }
 return async(request:Request):Promise<Response>=>{
  try{
   const path=new URL(request.url).pathname.split('/continuity')[1]||'/';
   if(request.method==='OPTIONS')return json({ok:true});
   if(path==='/capabilities'&&request.method==='GET')return json({saved_notes:true,phone_ready:phoneReady()});
   if(!['GET','POST'].includes(request.method))throw new Failure(405,'Method not allowed.');
   let body:Record<string,unknown>={};
   if(request.method==='POST'){const raw=await request.text();if(raw.length>10000)throw new Failure(413,'The note is too long.');try{body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();}catch{throw new Failure(400,'Invalid request.');}}
   if(path.startsWith('/phone/')){
    if(request.method!=='POST'||!env.SUPABASE_SERVICE_ROLE_KEY||!await equalSecret(request.headers.get('authorization')||'',`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`))throw new Failure(401,'Unauthorized');
    if(!phoneReady())throw new Failure(503,'Saved-note sharing by phone is being connected. Your notes remain available in your dashboard.');
    const c=await verifiedCall(body.call_sid);
    if(path==='/phone/redeem'){
     await limit(`memory-call:${c.sid}`,5);await limit(`memory-phone:${await sha256(c.phone)}`,10);
     if(typeof body.code!=='string'||!/^\d{6}$/.test(body.code))throw new Failure(400,'Use the six-digit code from your dashboard.');
     const result=await rpc('member_memory_redeem',{p_hash:await sha256(body.code),p_phone:c.phone,p_call:c.sid});
     if(!result)throw new Failure(403,'That code is unavailable. Open Saved notes for a new code, and call from your verified number.');
     return json(result);
    }
    if(path==='/phone/context'){
     if(typeof body.handoff_id!=='string'||!NOTE_UUID.test(body.handoff_id))throw new Failure(400,'Invalid continuation.');
     return json({note:await rpc('member_memory_context',{p_id:body.handoff_id,p_call:c.sid})});
    }
    throw new Failure(404,'Not found.');
   }
   const authorization=request.headers.get('authorization');if(!authorization?.startsWith('Bearer '))throw new Failure(401,'Sign in to open your saved notes.');
   const auth=await fetchDeadline(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:authorization,apikey:env.SUPABASE_ANON_KEY}},10000,client);
   if(!auth.ok)throw new Failure(401,'Your sign-in expired. Please sign in again.');
   const user=await auth.json();if(typeof user.id!=='string'||!NOTE_UUID.test(user.id))throw new Failure(401,'Sign in again.');
   const snapshot=async()=>({...await rpc<MemorySnapshot>('member_memory_snapshot',{p_user:user.id}),phone_ready:phoneReady()});
   if(path==='/notes'&&request.method==='GET')return json(await snapshot());
   const continueId=path.match(/^\/notes\/([0-9a-f-]+)\/continue$/i)?.[1];
   if(continueId&&NOTE_UUID.test(continueId)&&request.method==='POST'){
    const current=await snapshot();const note=current.notes.find(n=>n.id===continueId);
    if(!current.enabled||!note)throw new Failure(409,'This note is paused or unavailable. Refresh your notes.');
    return json({note});
   }
   if(request.method!=='POST')throw new Failure(404,'Not found.');
   if(!Number.isInteger(body.revision)||Number(body.revision)<0)throw new Failure(400,'Refresh your saved notes first.');
   if(path==='/handoff'){
    if(!phoneReady())throw new Failure(503,'Phone continuation is being connected. You can continue in writing now.');
    if(body.consent!==true||typeof body.note_id!=='string'||!NOTE_UUID.test(body.note_id))throw new Failure(400,'Choose a note and confirm you want to share it with the phone guide.');
    await limit(`memory-handoff:${user.id}`,6);
    const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);
    const result=await rpc<Record<string,unknown>>('member_memory_issue',{p_user:user.id,p_note:body.note_id,p_revision:body.revision,p_hash:await sha256(code)});
    return json({...result,code});
   }
   const action=path==='/settings'?(body.enabled===true?'enable':body.enabled===false?'pause':''):path==='/notes'?'save':path==='/delete'?'delete':path==='/clear'?'clear':'';
   if(!action)throw new Failure(404,'Not found.');
   if(action==='enable'&&body.consent!==true)throw new Failure(400,'Confirm you want to keep saved notes in this account.');
   if(action==='clear'&&body.confirm!==true)throw new Failure(400,'Confirm that you want to remove all saved notes.');
   const note=body.note as Record<string,unknown>|undefined;
   if(action==='save'){const error=validateMemoryNote(note);if(error)throw new Failure(400,error);}
   if(action==='delete'&&(!note||typeof note.id!=='string'||!NOTE_UUID.test(note.id)))throw new Failure(400,'Choose a note to remove.');
   await limit(`memory-write:${user.id}`,90);
   return json({...await rpc<MemorySnapshot>('member_memory_change',{p_user:user.id,p_action:action,p_revision:body.revision,p_note:note||{}}),phone_ready:phoneReady()});
  }catch(error){return json({error:error instanceof Failure?error.message:'Your notes could not be loaded. Please try again.'},error instanceof Failure?error.status:503);}
 };
}
