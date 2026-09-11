import {fetchDeadline,type Secrets} from '../_shared/providers.ts';
import {hex,pinDigest,validateCallingIdentity,type CallingIdentity} from '../_shared/call-identity.ts';
type Env=Secrets;
class Failure extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function createCallAccessService(env:Env,client:typeof fetch=fetch){
 const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json'};
 const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':env.SITE_ORIGIN||'https://elroicall.com','Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS',Vary:'Origin'}});
 async function rpc<T>(name:string,body:unknown):Promise<T>{
  const r=await fetchDeadline(`${env.SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers,body:JSON.stringify(body)},12000,client);
  if(!r.ok){const e=await r.json().catch(()=>({}));if(e.code==='P0001')throw new Failure(409,String(e.message));throw new Failure(503,'Your calling identity could not be saved. Refresh before trying again.');}return r.json();
 }
 return async(req:Request)=>{
  try{
   if(req.method==='OPTIONS')return json({ok:true});
   const path=new URL(req.url).pathname.split('/call-access')[1]||'/';
   if(!['GET','POST'].includes(req.method))throw new Failure(405,'Method not allowed.');
   const bearer=req.headers.get('authorization');if(!bearer?.startsWith('Bearer '))throw new Failure(401,'Sign in to manage your nickname and calling PIN.');
   const r=await fetchDeadline(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{Authorization:bearer,apikey:env.SUPABASE_ANON_KEY}},10000,client);
   if(!r.ok)throw new Failure(401,'Please sign in again.');
   const user=await r.json();if(typeof user.id!=='string'||! /^[0-9a-f-]{36}$/i.test(user.id))throw new Failure(401,'Please sign in again.');
   if(path==='/profile'&&req.method==='GET')return json(await rpc<CallingIdentity>('calling_identity_snapshot',{p_user:user.id}));
   if(path!=='/profile'||req.method!=='POST')throw new Failure(404,'Not found.');
   const raw=await req.text();if(raw.length>2048)throw new Failure(413,'The request is too long.');
   let body;try{body=JSON.parse(raw);}catch{throw new Failure(400,'Invalid request.');}
   if(!body||typeof body!=='object'||Array.isArray(body))throw new Failure(400,'Invalid request.');
   const issue=validateCallingIdentity(body.nickname,body.pin);if(issue)throw new Failure(400,issue);
   if(body.pin!==body.confirm_pin)throw new Failure(400,'The two PIN entries must match.');
   if(body.consent!==true)throw new Failure(400,'Confirm that you want to use this nickname and PIN for calling.');
   if(!Number.isInteger(body.revision)||body.revision<0)throw new Failure(400,'Refresh your calling identity before saving.');
   if(!await rpc<boolean>('lesson_rate_limit',{p_key:`calling-identity:${user.id}`,p_limit:10}))throw new Failure(429,'Please wait before changing your calling PIN again.');
   const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
   const digest=await pinDigest(body.pin,salt,user.id,env.SUPABASE_SERVICE_ROLE_KEY);
   return json(await rpc<CallingIdentity>('calling_identity_save',{p_user:user.id,p_nickname:body.nickname.trim(),p_salt:salt,p_digest:digest,p_revision:body.revision}));
  }catch(e){return json({error:e instanceof Failure?e.message:'Your calling identity is unavailable. Please try again.'},e instanceof Failure?e.status:503);}
 };
}
