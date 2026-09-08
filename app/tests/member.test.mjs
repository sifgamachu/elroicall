import {test} from 'node:test';
import assert from 'node:assert/strict';
import { createPortalService } from '../../supabase/functions/portal/service.ts';
import { createSchedulingService } from '../../supabase/functions/scheduled-calls/service.ts';
import { DEFAULT_PREFERENCES,sha256,validatePreferences } from '../../supabase/functions/_shared/member.ts';
const owner='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'server',TWILIO_ACCOUNT_SID:'account',TWILIO_AUTH_TOKEN:'twilio-secret',TWILIO_FROM_NUMBER:'+18556197337',OPENAI_API_KEY:'',SCHEDULER_SECRET:'cron-secret',SCHEDULED_CALLS_ENABLED:'false'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const request=(service,path,body)=>new Request(`${env.SUPABASE_URL}/functions/v1/${service}${path}`,{method:body?'POST':'GET',headers:{authorization:'Bearer user-token','content-type':'application/json'},body:body?JSON.stringify(body):undefined});

test('portal never reads call history or schedules for an unverified phone',async()=>{
 const seen=[];const service=createPortalService(env,async(url)=>{seen.push(url);if(url.endsWith('/auth/v1/user'))return json({id:owner,email:'test@example.invalid'});if(url.includes('/portal_accounts?'))return json([{phone:'+12025550123',phone_verified:false}]);throw Error('Private caller data was requested');});
 const result=await service(request('portal','/me'));assert.equal(result.status,200);const data=await result.json();assert.deepEqual(data.history,[]);assert.equal(data.total_calls,0);assert.equal(seen.length,2);
});
test('portal revalidates tokens with Auth and rejects forged identities',async()=>{
 const service=createPortalService(env,async()=>json({error:'invalid token'},401));
 assert.equal((await service(request('portal','/me'))).status,401);
});
test('phone verification requires consent and never calls without it',async()=>{
 const service=createPortalService(env,async(url)=>url.endsWith('/auth/v1/user')?json({id:owner}):url.includes('/portal_accounts?')?json([]):Promise.reject(Error('Unexpected provider request')));
 const r=await service(request('portal','/phone',{phone:'+12025550123'}));assert.equal(r.status,400);assert.equal((await r.json()).error,'consent_required');
});
test('verification uses a six-digit random code, stores only a hash and reports provider rejection',async()=>{
 let stored;let spoken;
 const service=createPortalService(env,async(url,init)=>{
  if(url.endsWith('/auth/v1/user'))return json({id:owner});
  if(url.includes('/portal_accounts?'))return json([]);
  if(url.includes('/lesson_rate_limit'))return json(true);
  if(url.includes('/portal_begin_verification')){stored=JSON.parse(init.body);return json(null);}
  if(url.includes('api.twilio.com')){spoken=new URLSearchParams(init.body).get('Twiml');return json({error:'unavailable'},400);}
  throw Error('Unexpected URL');
 });
 const r=await service(request('portal','/phone',{phone:'+12025550123',consent:true,user_id:other}));assert.equal(r.status,503);assert.equal(stored.p_user,owner);assert.match(stored.p_hash,/^[a-f0-9]{64}$/);assert.match(spoken,/six digit code is (\d, ){5}\d/);assert.equal((await r.json()).error,'verification_call_failed');
});
test('account cancellation is unavailable before phone ownership is verified',async()=>{
 const service=createPortalService(env,async(url)=>url.endsWith('/auth/v1/user')?json({id:owner}):json([{phone:'+12025550123',phone_verified:false}]));
 assert.equal((await service(request('portal','/cancel',{mode:'all'}))).status,403);
});
test('preferences reject arbitrary voices, invalid zones and overlong names',()=>{
 assert.equal(validatePreferences(DEFAULT_PREFERENCES),null);
 for(const change of [{default_voice:'impersonate'},{timezone:'Nowhere/Zone'},{duration_minutes:90},{display_name:'a'.repeat(61)}])assert.ok(validatePreferences({...DEFAULT_PREFERENCES,...change}));
});
test('saving preferences uses the authenticated owner and exposes no server fields',async()=>{
 let saved;
 const service=createSchedulingService(env,async(url,init)=>{
  if(url.endsWith('/auth/v1/user'))return json({id:owner});
  if(url.includes('/lesson_rate_limit'))return json(true);
  if(url.includes('/member_preferences?')){saved=JSON.parse(init.body);return json([saved]);}
  throw Error('Unexpected request');
 });
 const r=await service(request('scheduled-calls','/preferences',{...DEFAULT_PREFERENCES,display_name:'  Sam  ',user_id:other,phone:'+12025550999'}));assert.equal(r.status,200);assert.equal(saved.user_id,owner);assert.equal(saved.display_name,'Sam');assert.equal(saved.phone,undefined);assert.equal((await r.json()).preferences.user_id,undefined);
});
test('dashboard can load while calling is disabled and scopes data to its owner',async()=>{
 const seen=[];
 const service=createSchedulingService(env,async(url,init)=>{seen.push(url);if(url.endsWith('/auth/v1/user'))return json({id:owner});if(url.includes('/lesson_schedules?')){assert.ok(url.includes(`user_id=eq.${owner}`));return json([]);}if(url.includes('/member_preferences?'))return json([]);if(url.includes('/lesson_dashboard_stats')){assert.equal(JSON.parse(init.body).p_user,owner);return json({lessons_finished:0,calls_answered:0,last_activity_at:null});}throw Error('Unexpected URL');});
 const r=await service(request('scheduled-calls','/dashboard'));assert.equal(r.status,200);assert.deepEqual((await r.json()).history,[]);assert.equal(seen.some(url=>url.includes('twilio')),false);
});
test('hashed cron authorization accepts only the exact Vault token',async()=>{
 const settings={...env,SCHEDULER_SECRET:'',SCHEDULER_SECRET_SHA256:await sha256('vault-token')};
 const service=createSchedulingService(settings,async()=>new Response(null,{status:204}));
 const req=token=>new Request(`${env.SUPABASE_URL}/functions/v1/scheduled-calls/dispatch`,{method:'POST',headers:{'x-scheduler-secret':token}});
 assert.equal((await service(req('wrong'))).status,401);assert.equal((await service(req(''))).status,401);assert.equal((await service(req('vault-token'))).status,200);
});
test('anonymous dashboard requests never reach privileged database APIs',async()=>{
 const service=createSchedulingService(env,async()=>{throw Error('Database should not be contacted');});
 assert.equal((await service(new Request(`${env.SUPABASE_URL}/functions/v1/scheduled-calls/dashboard`))).status,401);
});
