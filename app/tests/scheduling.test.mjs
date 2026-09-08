import assert from 'node:assert/strict';
import { randomUUID, createHmac } from 'node:crypto';
import { test } from 'node:test';
import { validatePlan, splitSpeech, localDate } from '../../supabase/functions/_shared/scheduling.ts';
import { generateSpeech, placeCall, verifyTwilio, lessonTwiml } from '../../supabase/functions/_shared/providers.ts';
import { createSchedulingService } from '../../supabase/functions/scheduled-calls/service.ts';
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service',SUPABASE_ANON_KEY:'synthetic-public',OPENAI_API_KEY:'synthetic-openai',TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'synthetic-token',TWILIO_FROM_NUMBER:'+12025550123',SCHEDULER_SECRET:'synthetic-cron',SCHEDULED_CALLS_ENABLED:'true'};
const owner='11111111-1111-4111-8111-111111111111';
function plan(){return {request_id:randomUUID(),content_type:'lecture',topic:'The parables of Jesus',voice:'onyx',local_time:'17:23',timezone:'America/New_York',recurrence:'weekly',weekdays:[1,3,5],start_date:localDate(new Date(Date.now()+86400000),'America/New_York'),duration_minutes:10,consent:true};}
function request(path,body){return new Request(`${env.SUPABASE_URL}/functions/v1/scheduled-calls${path}`,{method:body?'POST':'GET',headers:{Authorization:'Bearer synthetic-user','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});}
const heartbeat=()=>['preparation','delivery'].map(id=>({id,heartbeat_at:new Date().toISOString()}));

test('valid content, voice, local time, selected days, date, and consent are required',()=>{
 assert.equal(validatePlan(plan()),null);
 for(const change of [{content_type:'random'},{voice:'celebrity'},{weekdays:[]},{weekdays:[1,1]},{local_time:'25:30'},{timezone:'Moon/Sea'},{consent:false},{start_date:'2027-02-30'},{duration_minutes:90},{topic:''}])assert.ok(validatePlan({...plan(),...change}));
 assert.equal(validatePlan({...plan(),recurrence:'once',weekdays:[]}),null);
});
test('speech chunks preserve words and respect provider input limits',()=>{
 const text=Array.from({length:1700},(_,i)=>`word${i}`).join(' ');const chunks=splitSpeech(text);
 assert.ok(chunks.length>1);assert.ok(chunks.every(chunk=>chunk.length<=2800));assert.equal(chunks.join(' '),text);
});
test('both preparation and delivery must be healthy before accepting bookings',async()=>{
 const service=createSchedulingService(env,async()=>Response.json([heartbeat()[0]]));
 assert.equal((await (await service(request('/capabilities'))).json()).ready,false);
});
test('missing credentials never produce a ready response or a provider request',async()=>{
 let called=false;const service=createSchedulingService({...env,OPENAI_API_KEY:''},async()=>{called=true;throw Error('Unexpected request');});
 assert.equal((await (await service(request('/capabilities'))).json()).ready,false);assert.equal(called,false);
});
test('schedules and voice samples require server-validated authentication',async()=>{
 const service=createSchedulingService(env,async()=>{throw Error('Unexpected request');});
 for(const path of ['/plans','/voice-preview/marin'])assert.equal((await service(new Request(`${env.SUPABASE_URL}/functions/v1/scheduled-calls${path}`))).status,401);
});
test('unverified phone numbers cannot receive scheduled calls',async()=>{
 let writes=0;const service=createSchedulingService(env,async url=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:owner});
  if(url.includes('lesson_runtime'))return Response.json(heartbeat());
  if(url.includes('lesson_rate_limit'))return Response.json(true);
  if(url.endsWith('/portal/me'))return Response.json({phone:'+12025550123',phone_verified:false});
  writes++;throw Error('Unexpected write');
 });
 assert.equal((await service(request('/plans',plan()))).status,403);assert.equal(writes,0);
});
test('caller identity and phone come from trusted services, never the submitted form',async()=>{
 const payload={...plan(),phone:'+12025550999',user_id:'22222222-2222-4222-8222-222222222222'};
 let persisted;const service=createSchedulingService(env,async(url,init)=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:owner});
  if(url.includes('lesson_runtime'))return Response.json(heartbeat());
  if(url.includes('lesson_rate_limit'))return Response.json(true);
  if(url.endsWith('/portal/me'))return Response.json({phone:'+12025550123',phone_verified:true});
  if(url.includes('/lesson_schedules?'))return Response.json([]);
  if(url.endsWith('/rpc/lesson_create_plan')){persisted=JSON.parse(init.body);return Response.json({...payload,id:randomUUID(),user_id:owner,phone:persisted.p_phone,active:true,next_run_at:new Date(Date.now()+3600000).toISOString(),created_at:new Date().toISOString()});}
  throw Error('Unexpected request');
 });
 const response=await service(request('/plans',payload));assert.equal(response.status,201);assert.equal(persisted.p_user,owner);assert.equal(persisted.p_phone,'+12025550123');
 const data=await response.json();assert.equal(data.plan.phone,undefined);assert.equal(data.plan.user_id,undefined);assert.equal(data.plan.phone_last4,'0123');
});
test('the chosen narration voice goes directly to OpenAI Speech',async()=>{
 let body,endpoint;const audio=await generateSpeech(env,'cedar','Synthetic voice test.',async(url,init)=>{endpoint=url;body=JSON.parse(init.body);return new Response(new Uint8Array(128),{headers:{'Content-Type':'audio/mpeg'}});});
 assert.equal(endpoint,'https://api.openai.com/v1/audio/speech');assert.equal(body.voice,'cedar');assert.equal(body.model,'gpt-4o-mini-tts');assert.equal(audio.byteLength,128);
});
test('outbound creation uses a dedicated playback hook and never changes inbound settings',async()=>{
 let body,endpoint;const id=randomUUID();await placeCall(env,'+12025550124',id,async(url,init)=>{endpoint=url;body=new URLSearchParams(init.body);return Response.json({sid:'CA'+'b'.repeat(32)});});
 assert.match(endpoint,/\/Calls.json$/);assert.equal(body.get('To'),'+12025550124');assert.equal(body.get('Url'),`${env.SUPABASE_URL}/functions/v1/scheduled-calls/voice/start?job=${id}`);assert.equal(body.get('Record'),'false');
});
test('an uncertain call result is never automatically retried',async()=>{
 let attempts=0;await assert.rejects(placeCall(env,'+12025550124',randomUUID(),async()=>{attempts++;throw new TypeError('connection lost');}));assert.equal(attempts,1);
});
test('Twilio signatures cover the precise callback URL and all form fields',async()=>{
 const url='https://project.supabase.co/functions/v1/scheduled-calls/voice/lesson?job=test&part=1';const form=new URLSearchParams({Digits:'1',CallSid:'CA'+'a'.repeat(32)});
 const signature=createHmac('sha1','synthetic-token').update(url+'CallSid'+form.get('CallSid')+'Digits1').digest('base64');
 assert.equal(await verifyTwilio(url,form,signature,'synthetic-token'),true);assert.equal(await verifyTwilio(url.replace('part=1','part=2'),form,signature,'synthetic-token'),false);
 form.set('Digits','9');assert.equal(await verifyTwilio(url,form,signature,'synthetic-token'),false);
});
test('unsigned voice callbacks cannot mutate schedules',async()=>{
 let touched=false;const service=createSchedulingService(env,async()=>{touched=true;throw Error('Unexpected request');});
 const response=await service(new Request(`${env.SUPABASE_URL}/functions/v1/scheduled-calls/voice/start?job=${randomUUID()}`,{method:'POST',body:'Digits=9'}));assert.equal(response.status,403);assert.equal(touched,false);
});
test('playback captures opt-out digits and safely encodes signed audio links',()=>{
 const xml=lessonTwiml('https://audio.test/clip?a=1&b=2','https://hook.test/next?part=1&job=test',true);
 assert.match(xml,/<Gather input="dtmf"/);assert.match(xml,/numDigits="1"/);assert.match(xml,/a=1&amp;b=2/);assert.match(xml,/timeout="8"/);
});
