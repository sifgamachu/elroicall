import assert from 'node:assert/strict';
import {createHmac,randomUUID} from 'node:crypto';
import {test} from 'node:test';
import {pinDigest,validateCallingIdentity,callOpening} from '../../supabase/functions/_shared/call-identity.ts';
import {createCallAccessService} from '../../supabase/functions/call-access/service.ts';
import {createCallGuard,remainingSeconds} from '../../supabase/functions/_shared/call-guard.ts';
import {createSchedulingService} from '../../supabase/functions/scheduled-calls/service.ts';
import {patchVoiceCallingIdentity} from '../../scripts/patch-voice-calling-identity.mjs';
const user=randomUUID(),sid='CA'+'a'.repeat(32),phone='+12025550124',pin='739482',salt='a'.repeat(32);
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service',SUPABASE_ANON_KEY:'synthetic-public',TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'synthetic-token',TWILIO_FROM_NUMBER:'+12025550123'};
const base=env.SUPABASE_URL+'/functions/v1/voice';
const options={kind:'inbound',callback:base+'/calling-pin',resume:base+'/'};
const profile={nickname:'Grace',pin_set:true,revision:1,phone_verified:true,phone_last4:'0124',phone_ready:false};
function memberRequest(body){return new Request(env.SUPABASE_URL+'/functions/v1/call-access/profile',{method:body?'POST':'GET',headers:{Authorization:'Bearer member'},body:body?JSON.stringify(body):undefined});}
function signedRequest(digits,changes={},signed=true){const form=new URLSearchParams({AccountSid:env.TWILIO_ACCOUNT_SID,CallSid:sid,From:phone,To:env.TWILIO_FROM_NUMBER,...changes});if(digits!==undefined)form.set('Digits',digits);const url=digits===undefined?base+'/':options.callback;let payload=url;for(const [key,value] of [...form.entries()].sort(([a],[b])=>a.localeCompare(b)))payload+=key+value;const req=new Request(url,{method:'POST',body:form,headers:signed?{'x-twilio-signature':createHmac('sha1',env.TWILIO_AUTH_TOKEN).update(payload).digest('base64')}:{}});return {req,form};}
function guardFixture(config={}){
 const calls=[];
 let access={call_sid:sid,phone,kind:'inbound',context_id:null,user_id:user,status:'pending_pin',duration_minutes:10,relay_token:randomUUID(),deadline_at:null,pin_salt:salt,...config.access};
 const client=async(url,init={})=>{
  const body=typeof init.body==='string'?JSON.parse(init.body):init.body instanceof URLSearchParams?Object.fromEntries(init.body):{};calls.push({url,method:init.method||'GET',body});
  if(url.endsWith('/calling_security_enabled'))return Response.json(config.enabled!==false);
  if(url.endsWith('/calling_access_get'))return Response.json(access);
  if(url.endsWith('/calling_access_begin'))return Response.json(access);
  if(url.endsWith('/calling_access_permit'))return Response.json(config.revoked?null:access);
  if(url.endsWith('/calling_access_end')){access.status='ended';return Response.json(null);}
  if(url.endsWith('/calling_access_verify')){access={...access,status:config.result||'member',nickname:'Grace',deadline_at:new Date(Date.now()+600000).toISOString()};return Response.json(access);}
  if(url.includes('/Calls/')&&init.method==='POST')return Response.json({sid},{status:config.limitFailure?503:200});
  if(url.includes('/Calls/'))return Response.json({sid,account_sid:env.TWILIO_ACCOUNT_SID,from:phone,to:env.TWILIO_FROM_NUMBER,direction:'inbound',status:'in-progress',start_time:new Date(Date.now()-25000).toISOString(),...config.carrier});
  throw Error('Unexpected endpoint');
 };
 return {guard:createCallGuard(env,client),calls};
}
test('nickname and PIN validation supports names, leading zeroes and rejects weak or invalid input',()=>{
 assert.equal(validateCallingIdentity('Grâce','039482'),null);for(const [name,code] of [['A',pin],['<script>',pin],['Grace','12345'],['Grace','123456'],['Grace','000000'],['Grace','12ab34']])assert.ok(validateCallingIdentity(name,code));
});
test('PIN hashes depend on random salt, user and server-held pepper',async()=>{
 const original=await pinDigest(pin,salt,user,env.SUPABASE_SERVICE_ROLE_KEY);assert.match(original,/^[0-9a-f]{64}$/);assert.equal(original,await pinDigest(pin,salt,user,env.SUPABASE_SERVICE_ROLE_KEY));for(const args of [[pin,'b'.repeat(32),user,env.SUPABASE_SERVICE_ROLE_KEY],[pin,salt,randomUUID(),env.SUPABASE_SERVICE_ROLE_KEY],[pin,salt,user,'rotated-key']])assert.notEqual(original,await pinDigest(...args));await assert.rejects(pinDigest(pin,salt,user,''));
});
test('identity writes use the authenticated owner and never store or return the PIN',async()=>{
 const calls=[];const service=createCallAccessService(env,async(url,init)=>{const body=init.body?JSON.parse(init.body):{};calls.push({url,body});if(url.endsWith('/user'))return Response.json({id:user});if(url.endsWith('/lesson_rate_limit'))return Response.json(true);if(url.endsWith('/calling_identity_save'))return Response.json(profile);throw Error('Unexpected endpoint');});
 const r=await service(memberRequest({nickname:'Grace',pin,confirm_pin:pin,revision:0,consent:true,user_id:randomUUID()}));assert.equal(r.status,200);const write=calls.find(c=>c.url.endsWith('/calling_identity_save')).body;assert.equal(write.p_user,user);assert.match(write.p_digest,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(write).includes(pin));assert.deepEqual(await r.json(),profile);
});
test('unauthenticated, mismatched and unconfirmed identity changes never write credentials',async()=>{
 const calls=[];const service=createCallAccessService(env,async url=>{calls.push(url);if(url.endsWith('/user'))return Response.json({id:user});throw Error('Unexpected mutation');});
 assert.equal((await service(new Request(env.SUPABASE_URL+'/functions/v1/call-access/profile'))).status,401);assert.equal(calls.length,0);for(const changes of [{consent:false},{confirm_pin:'936284'},{revision:-1},{pin:'12345'}])assert.equal((await service(memberRequest({nickname:'Grace',pin,confirm_pin:pin,consent:true,revision:0,...changes}))).status,400);assert.ok(calls.every(url=>url.endsWith('/user')));
});
test('first-call announcement states the budget and signup requirement without requiring payment',()=>{
 assert.match(callOpening(10,true),/10 minutes/);assert.match(callOpening(10,true),/Before your second call, sign up/);assert.ok(!callOpening(5,false).includes('second call'));assert.match(callOpening(5,false),/5 minutes/);
});
test('unsigned or mismatched carrier calls never read a calling identity',async()=>{
 for(const config of [{signed:false},{carrier:{from:'+12025550999'}},{carrier:{sid:'CA'+'b'.repeat(32)}},{carrier:{status:'completed'}}]){const f=guardFixture(config);const {req,form}=signedRequest(undefined,{},config.signed!==false);const r=await f.guard.enter(req,form,options);assert.match(await r.response.text(),/<Hangup/);assert.ok(!f.calls.some(c=>c.url.endsWith('/calling_access_get')));}
});
test('keypad challenge reveals neither nickname nor private context, and limits entry to six digits',async()=>{
 const f=guardFixture();const {req,form}=signedRequest();const r=await f.guard.enter(req,form,options);const body=await r.response.text();assert.match(body,/numDigits="6"/);assert.match(body,/input="dtmf"/);assert.match(body,/10 minutes/);assert.ok(!body.includes('Grace'));assert.ok(!body.includes(salt));assert.ok(!f.calls.some(c=>c.url.endsWith('/calling_access_verify')));
});
test('first guests explicitly accept and repeated guests hear signup instructions',async()=>{
 for(const [state,expected] of [['pending_guest',/Before your second call/],['signup',/To continue calling, sign up/],['setup',/set your nickname/]]){const f=guardFixture({access:{status:state,user_id:null}});const {req,form}=signedRequest();const body=await (await f.guard.enter(req,form,options)).response.text();assert.match(body,expected);assert.ok(!f.calls.some(c=>c.url.endsWith('/calling_access_verify')));}
});
test('silence never authenticates and malformed PIN attempts are counted',async()=>{
 const quiet=guardFixture();let input=signedRequest('');assert.match(await (await quiet.guard.enter(input.req,input.form,{...options,answer:true})).response.text(),/No PIN/);assert.ok(!quiet.calls.some(c=>c.url.endsWith('/calling_access_verify')));
 const bad=guardFixture({result:'wrong_pin'});input=signedRequest('abc');const body=await (await bad.guard.enter(input.req,input.form,{...options,answer:true})).response.text();assert.match(body,/did not match/);assert.equal(bad.calls.find(c=>c.url.endsWith('/calling_access_verify')).body.p_digest,null);
});
test('successful PIN entry uses a hashed candidate, sets a carrier time limit and redirects without credentials',async()=>{
 const f=guardFixture();const {req,form}=signedRequest(pin);const body=await (await f.guard.enter(req,form,{...options,answer:true})).response.text();assert.match(body,/Thank you, Grace/);assert.match(body,/<Redirect/);assert.ok(!body.includes(pin));const check=f.calls.find(c=>c.url.endsWith('/calling_access_verify')).body;assert.equal(check.p_digest,await pinDigest(pin,salt,user,env.SUPABASE_SERVICE_ROLE_KEY));const seconds=Number(f.calls.find(c=>c.url.includes('/Calls/')&&c.method==='POST').body.TimeLimit);assert.ok(seconds>=620&&seconds<=630);
});
test('carrier limit failure ends admission and never reaches a personalized greeting',async()=>{
 const f=guardFixture({limitFailure:true});const {req,form}=signedRequest(pin);const body=await (await f.guard.enter(req,form,{...options,answer:true})).response.text();assert.match(body,/<Hangup/);assert.ok(!body.includes('<Redirect'));assert.ok(!body.includes('Grace'));assert.ok(f.calls.some(c=>c.url.endsWith('/calling_access_end')));
});
test('revoked and expired sessions cannot resume and call budgets never reset',async()=>{
 const deadline=new Date(Date.now()+120000).toISOString();const f=guardFixture({revoked:true,access:{status:'member',deadline_at:deadline}});const {req,form}=signedRequest();assert.match(await (await f.guard.enter(req,form,options)).response.text(),/<Hangup/);assert.equal(remainingSeconds({deadline_at:'2000-01-01T00:00:00Z'}),0);assert.ok(remainingSeconds({deadline_at:deadline})<=120);assert.equal(await f.guard.permit('bad','bad'),null);
});
test('deployment adapter rejects missing prerequisites and duplicate application',()=>{
 assert.throws(()=>patchVoiceCallingIdentity('const legacy = true;'),/secure scheduling/);assert.throws(()=>patchVoiceCallingIdentity('CONTINUITY_INSTRUCTIONS Deno.env.get("VOICE_ROUTE_TOKEN") createCallGuard'),/already installed/);
});
test('scheduled lesson entry and direct segment requests cannot reveal audio before PIN verification',async()=>{
 const job=randomUUID(),plan=randomUUID(),requests=[];
 const liveEnv={...env,SCHEDULED_CALLS_ENABLED:'true',OPENAI_API_KEY:'synthetic-openai',SCHEDULER_SECRET:'synthetic-scheduler'};
 const service=createSchedulingService(liveEnv,async(url,init={})=>{
  requests.push(url);
  if(url.includes('/rest/v1/lesson_jobs?'))return Response.json([{id:job,schedule_id:plan,call_sid:sid,status:'submitted',due_at:new Date().toISOString(),audio_paths:['private/0.mp3','private/1.mp3'],accepted:false}]);
  if(url.includes('/rest/v1/lesson_schedules?'))return Response.json([{id:plan,user_id:user,phone,active:true,duration_minutes:10}]);
  if(url.endsWith('/calling_security_enabled'))return Response.json(true);
  if(url.includes('/Calls/'))return Response.json({sid,account_sid:env.TWILIO_ACCOUNT_SID,from:env.TWILIO_FROM_NUMBER,to:phone,direction:'outbound-api',status:'in-progress',start_time:new Date().toISOString()});
  if(url.endsWith('/calling_access_get'))return Response.json({call_sid:sid,phone,kind:'lesson',context_id:job,user_id:user,status:'pending_pin',duration_minutes:10,pin_salt:salt});
  throw Error('Unexpected private access: '+url+' '+init.method);
 });
 for(const part of ['start','lesson']){
  const url=env.SUPABASE_URL+`/functions/v1/scheduled-calls/voice/${part}?job=${job}&part=1`;
  const form=new URLSearchParams({AccountSid:env.TWILIO_ACCOUNT_SID,CallSid:sid,From:env.TWILIO_FROM_NUMBER,To:phone,Digits:'1'});
  let payload=url;for(const [key,value] of [...form.entries()].sort(([a],[b])=>a.localeCompare(b)))payload+=key+value;
  const r=await service(new Request(url,{method:'POST',body:form,headers:{'x-twilio-signature':createHmac('sha1',env.TWILIO_AUTH_TOKEN).update(payload).digest('base64')}}));
  const body=await r.text();assert.equal(r.status,200);assert.match(body,/numDigits="6"/);assert.ok(!body.includes('<Play'));
 }
 assert.ok(!requests.some(url=>url.includes('/storage/')));
});
