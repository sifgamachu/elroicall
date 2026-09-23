import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortalService } from '../../supabase/functions/portal/service.ts';
import { callingSetup, connectionTestIssue, requestConnectionTest } from '../../supabase/functions/portal/call-test.ts';
const owner='11111111-1111-4111-8111-111111111111';
const requestId='22222222-2222-4222-8222-222222222222';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'server-secret',TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'provider-secret',TWILIO_FROM_NUMBER:'+18556197337'};
const account={user_id:owner,email:'test@example.invalid',phone:'+12025550123',phone_verified:true};
const body={consent:true,request_id:requestId};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
const req=(path='/test-call',value=body,authorized=true)=>new Request(`${env.SUPABASE_URL}/functions/v1/portal${path}`,{method:'POST',headers:{'Content-Type':'application/json',...(authorized?{Authorization:'Bearer user-session'}:{})},body:JSON.stringify(value)});
function fixture(options={}) {
 const seen=[];let reads=0;
 const client=async(url,init={})=>{
  seen.push({url,init});
  if(url.endsWith('/auth/v1/user'))return options.authDenied?json({error:'bad session'},401):json({id:owner});
  if(url.includes('/portal_accounts?')){
   if(init.method==='PATCH')return json([]);
   reads++;
   return json([options.changed&&reads>1?{...account,phone:'+12025550999'}:options.account||account]);
  }
  if(url.endsWith('/lesson_rate_limit')){
   const value=JSON.parse(init.body);
   return json(!(options.duplicate&&value.p_key.startsWith('test-request:')||options.limited&&value.p_key.startsWith('test-user:')));
  }
  if(url.endsWith('/portal_begin_verification'))return json(null);
  if(url.startsWith('https://api.twilio.com/')){
   if(options.networkFailure)throw Error('network unavailable');
   return options.provider ? options.provider() : json({sid:'CA'+'b'.repeat(32)},201);
  }
  throw Error('Unexpected route '+url);
 };
 return {seen,client,service:createPortalService(options.env||env,client),outbound:()=>seen.filter(item=>item.url.startsWith('https://api.twilio.com/'))};
}
test('missing calling credentials cannot advertise ready',()=>{
 for(const key of ['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER']){const value=callingSetup({...env,[key]:''});assert.equal(value.verification_ready,false);assert.equal(value.test_call_ready,false);assert.equal(value.reason,'calling_provider_not_configured');}
});
test('configuration status returns booleans, never secrets or phone values',()=>{
 const raw=JSON.stringify(callingSetup(env));for(const value of Object.values(env))assert.ok(!raw.includes(value));
 assert.deepEqual(Object.values(callingSetup(env).checks),[true,true,true]);
});
test('connection tests do not require AI or scheduler enablement',()=>assert.equal(callingSetup({...env,OPENAI_API_KEY:'',SCHEDULED_CALLS_ENABLED:'false'}).test_call_ready,true));
test('public capabilities never call Auth, database, or provider',async()=>{
 const service=createPortalService(env,async()=>{throw Error('No network needed');});
 const r=await service(new Request(`${env.SUPABASE_URL}/functions/v1/portal/capabilities`));assert.equal(r.status,200);assert.equal((await r.json()).version,1);assert.equal(r.headers.get('Cache-Control'),'no-store');
});
test('anonymous test requests cannot reach user data or dial',async()=>{const f=fixture();assert.equal((await f.service(req('/test-call',body,false))).status,401);assert.equal(f.seen.length,0);});
test('a rejected Auth session cannot dial',async()=>{const f=fixture({authDenied:true});assert.equal((await f.service(req())).status,401);assert.equal(f.outbound().length,0);});
test('test readiness is enforced on the server',async()=>{const f=fixture({env:{...env,TWILIO_AUTH_TOKEN:''}});const r=await f.service(req());assert.equal(r.status,503);assert.equal((await r.json()).error,'test_call_unavailable');assert.equal(f.outbound().length,0);});
test('unverified accounts cannot receive connection tests',async()=>{const f=fixture({account:{...account,phone_verified:false}});assert.equal((await f.service(req())).status,403);assert.equal(f.outbound().length,0);});
test('missing or malformed verified numbers are rejected',()=>{for(const phone of [null,'','2025550123','not-a-number'])assert.equal(connectionTestIssue(body,{phone,phone_verified:true},env.TWILIO_FROM_NUMBER).status,403);});
test('the service cannot place a connection test to itself',async()=>{const f=fixture({account:{...account,phone:env.TWILIO_FROM_NUMBER}});const r=await f.service(req());assert.equal((await r.json()).error,'service_number_not_allowed');assert.equal(f.outbound().length,0);});
test('each test requires explicit true consent',async()=>{for(const consent of [false,null,'true',1]){const f=fixture();const r=await f.service(req('/test-call',{...body,consent}));assert.equal(r.status,400);assert.equal(f.outbound().length,0);}});
test('test payload cannot choose phone, owner, narration, or topic',async()=>{for(const extra of [{phone:'+12025550999'},{user_id:'another-user'},{Twiml:'<Dial>bad</Dial>'},{topic:'private topic'},{voice:'coral'}]){const f=fixture();const r=await f.service(req('/test-call',{...body,...extra}));assert.equal(r.status,400);assert.equal(f.outbound().length,0);}});
test('test request requires a valid UUID v4',async()=>{for(const value of ['',null,'not-a-uuid','1'.repeat(900)]){const f=fixture();assert.equal((await f.service(req('/test-call',{...body,request_id:value}))).status,400);assert.equal(f.outbound().length,0);}});
test('a duplicate within the hourly request limit cannot redial',async()=>{const f=fixture({duplicate:true});const r=await f.service(req());assert.equal(r.status,409);assert.equal((await r.json()).error,'test_already_requested');assert.equal(f.outbound().length,0);});
test('per-user test limit blocks the provider request',async()=>{const f=fixture({limited:true});assert.equal((await f.service(req())).status,429);assert.equal(f.outbound().length,0);});
test('a changed receiving number is not silently substituted',async()=>{const f=fixture({changed:true});const r=await f.service(req());assert.equal(r.status,409);assert.equal((await r.json()).error,'calling_number_changed');assert.equal(f.outbound().length,0);});
test('accepted connection test is short, unrecorded and does not modify a schedule',async()=>{
 const f=fixture();const r=await f.service(req());assert.equal(r.status,200);const result=await r.json();assert.deepEqual(result,{test:'requested',phone_last4:'0123',lesson_booked:false});
 const out=f.outbound();assert.equal(out.length,1);const form=new URLSearchParams(out[0].init.body);assert.equal(form.get('To'),account.phone);assert.equal(form.get('From'),env.TWILIO_FROM_NUMBER);assert.equal(form.get('Record'),'false');assert.equal(form.get('TimeLimit'),'35');assert.equal(form.get('Timeout'),'20');assert.match(form.get('Twiml'),/system-voice test/);assert.equal(form.get('Url'),null);
 assert.ok(!f.seen.some(item=>item.url.includes('lesson_schedules')||item.url.includes('lesson_jobs')||item.url.includes('call_schedules')));
 const limits=f.seen.filter(item=>item.url.endsWith('/lesson_rate_limit')).map(item=>JSON.parse(item.init.body));assert.deepEqual(limits.map(item=>item.p_limit),[1,3,3]);assert.ok(!limits[2].p_key.includes(account.phone));
});
test('provider 5xx stays uncertain with no automatic redial',async()=>{const f=fixture({provider:()=>json({error:'provider body'},503)});const r=await f.service(req());assert.equal(r.status,202);assert.equal((await r.json()).test,'uncertain');assert.equal(f.outbound().length,1);});
test('malformed accepted provider result is not claimed as delivered',async()=>{for(const provider of [()=>json({status:'queued'},201),()=>new Response('not json',{status:201})]){const f=fixture({provider});const r=await f.service(req());assert.equal(r.status,202);assert.equal((await r.json()).test,'uncertain');assert.equal(f.outbound().length,1);}});
test('provider 4xx rejection cannot leak provider body',async()=>{const f=fixture({provider:()=>json({message:'private provider information'},403)});const r=await f.service(req());assert.equal(r.status,503);assert.equal((await r.json()).error,'test_call_failed');assert.equal(f.outbound().length,1);});
test('network failure is uncertain and never automatically repeated',async()=>{const f=fixture({networkFailure:true});const r=await f.service(req());assert.equal(r.status,202);assert.equal((await r.json()).test,'uncertain');assert.equal(f.outbound().length,1);});
test('GET cannot place a connection test',async()=>{const f=fixture();const r=await f.service(new Request(`${env.SUPABASE_URL}/functions/v1/portal/test-call`,{headers:{Authorization:'Bearer session'}}));assert.equal(r.status,404);assert.equal(f.outbound().length,0);});
test('verification 5xx keeps its pending hash usable and does not claim success',async()=>{const f=fixture({account:{...account,phone_verified:false},provider:()=>json({},503)});const r=await f.service(req('/phone',{phone:account.phone,consent:true}));assert.equal(r.status,202);assert.equal((await r.json()).verify,'uncertain');assert.ok(!f.seen.some(item=>item.init.method==='PATCH'));assert.equal(f.outbound().length,1);});
test('malformed verification response stays uncertain',async()=>{const f=fixture({provider:()=>json({},201)});const r=await f.service(req('/phone',{phone:account.phone,consent:true}));assert.equal(r.status,202);assert.equal((await r.json()).verify,'uncertain');});
test('verification cannot dial the public service number',async()=>{const f=fixture();const r=await f.service(req('/phone',{phone:env.TWILIO_FROM_NUMBER,consent:true}));assert.equal(r.status,400);assert.equal((await r.json()).error,'service_number_not_allowed');assert.equal(f.outbound().length,0);});
test('a valid carrier ID means requested, not answered',async()=>{const f=fixture();assert.equal(await requestConnectionTest(env,account.phone,f.client),'requested');assert.equal(f.outbound().length,1);});
