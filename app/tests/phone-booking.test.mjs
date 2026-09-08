import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { createPhoneSchedulingService, readback } from '../../supabase/functions/phone-scheduling/service.ts';
import { phoneSchedulingTurn } from '../../supabase/functions/voice/phone-scheduling.ts';
import { patchVoiceScheduling } from '../../scripts/patch-voice-scheduling.mjs';
const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service',SUPABASE_ANON_KEY:'synthetic-public',OPENAI_API_KEY:'synthetic-openai',TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'synthetic-token',TWILIO_FROM_NUMBER:'+12025550123',SCHEDULER_SECRET:'synthetic-cron',SCHEDULED_CALLS_ENABLED:'true',PHONE_BOOKING_VOICE_ENABLED:'true'};
const phone='+12025550124',sourceSid='CA'+'a'.repeat(32),callback='CA'+'b'.repeat(32),user=randomUUID();
const base=env.SUPABASE_URL+'/functions/v1/phone-scheduling';
function item(){return {id:randomUUID(),source_call_sid:sourceSid,phone,action:'book',status:'submitted',callback_sid:callback,expires_at:new Date(Date.now()+1200000).toISOString(),next_run_at:'2027-01-05T00:17:00Z',plan:{content_type:'bible_study',topic:'Forgiveness <script>',voice:'cedar',duration_minutes:10,local_time:'19:17',timezone:'America/New_York',recurrence:'weekly',weekdays:[1],start_date:new Date(Date.now()+86400000).toISOString().slice(0,10)}};}
function request(path,body,authorization='Bearer synthetic-service'){return new Request(base+path,{method:'POST',headers:{authorization,'Content-Type':'application/json'},body:JSON.stringify(body)});}
function hook(path,row,changes={},signed=true){const url=base+path+'?draft='+row.id;const form=new URLSearchParams({AccountSid:env.TWILIO_ACCOUNT_SID,CallSid:callback,To:phone,From:env.TWILIO_FROM_NUMBER,...changes});let payload=url;for(const [key,value] of [...form.entries()].sort(([a],[b])=>a.localeCompare(b)))payload+=key+value;return new Request(url,{method:'POST',body:form,headers:signed?{'x-twilio-signature':createHmac('sha1',env.TWILIO_AUTH_TOKEN).update(payload).digest('base64')}:{}});}
function fixture(row=item(),options={}){
 const writes=[],providerCalls=[];let commits=0;
 const client=async(url,init={})=>{
  const body=init.body&&typeof init.body==='string'?JSON.parse(init.body):{};
  if(url.includes('lesson_runtime'))return Response.json([{heartbeat_at:new Date(options.stale?0:Date.now()).toISOString()}]);
  if(url.endsWith('/scheduled-calls/capabilities'))return Response.json({ready:options.ready!==false});
  if(url.includes('/Calls/')&&url.endsWith('.json'))return Response.json({sid:sourceSid,account_sid:env.TWILIO_ACCOUNT_SID,from:phone,to:env.TWILIO_FROM_NUMBER,direction:'inbound',status:options.sourceStatus||'in-progress'});
  if(url.endsWith('/Calls.json')){providerCalls.push(init.body);if(options.uncertain)throw Error('timeout');return Response.json({sid:callback});}
  if(url.endsWith('/rpc/lesson_rate_limit'))return Response.json(true);
  if(url.endsWith('/rpc/phone_booking_owner'))return Response.json(user);
  if(url.endsWith('/rpc/phone_booking_commit')){commits++;assert.equal(body.p_user,user);assert.equal(body.p_sid,callback);row.status='confirmed';return Response.json({confirmed:true});}
  if(url.endsWith('/rpc/phone_booking_prepare')){writes.push(body);return Response.json({...row,id:randomUUID(),plan:body.p_plan,status:'draft'});}
  if(url.includes('/phone_booking_drafts?')){
   if(init.method==='DELETE')return new Response(null,{status:204});
   if(init.method==='PATCH'){
    writes.push(body);
    if(url.includes('expires_at=lt.'))return Response.json([]);
    if(url.includes('status=eq.queued')&&row.status!=='queued')return Response.json([]);
    if(url.includes('status=eq.dialing')&&row.status!=='dialing')return Response.json([]);
    Object.assign(row,body);return Response.json([row]);
   }
   if(url.includes('status=eq.queued'))return Response.json(row.status==='queued'?[row]:[]);
   return Response.json([row]);
  }
  throw Error('Unexpected endpoint '+url);
 };
 return {service:createPhoneSchedulingService(env,client),writes,providerCalls,get commits(){return commits;}};
}

test('phone readback includes format, exact local time, time zone, date, recurrence, voice and topic',()=>{
 const speech=readback(item());for(const pattern of [/10-minute Bible study/,/Forgiveness/,/cedar/,/7:17/,/Eastern Standard Time/,/January 4, 2027/,/every Monday/])assert.match(speech,pattern);
});
test('unauthorized internal requests and unsigned callbacks cause no reads or writes',async()=>{
 let calls=0;const service=createPhoneSchedulingService(env,async()=>{calls++;throw Error('Unexpected');});
 assert.equal((await service(request('/draft',{},'Bearer user-token'))).status,401);assert.equal((await service(hook('/verify/confirm',item(),{Digits:'1'},false))).status,401);assert.equal(calls,0);
});
test('missing credentials and stale workers prevent phone bookings',async()=>{
 const disabled=createPhoneSchedulingService({...env,TWILIO_AUTH_TOKEN:''},async()=>{throw Error('Unexpected');});assert.equal((await (await disabled(new Request(base+'/capabilities'))).json()).ready,false);
 const f=fixture(item(),{stale:true});assert.equal((await (await f.service(new Request(base+'/capabilities'))).json()).ready,false);
});
test('a deployed backend cannot advertise phone booking before the guide is activated',async()=>{
 const service=createPhoneSchedulingService({...env,PHONE_BOOKING_VOICE_ENABLED:'false'},async()=>{throw Error('Unexpected');});assert.equal((await (await service(new Request(base+'/capabilities'))).json()).ready,false);
});
test('the guarded voice patch removes embedded credentials and refuses changed source',()=>{
 const source=`const TOKEN = "synthetic-route-credential";
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "synthetic-anthropic-credential";
if (url.searchParams.get("token") !== TOKEN) {
    handoffSent: boolean;
          ? [TRANSFER_TOOL, PRAYER_TOOL, SCHEDULE_TOOL, CHURCH_TOOL, END_TOOL]
          : st.phase === "daily"
            ? [SCHEDULE_TOOL, END_TOOL]
            : [TRANSFER_TOOL, END_TOOL];
await chat(st.system, st.messages, tools, (t) => send(t, false))
        if (toolUse?.name === "schedule_calls" && st.from) {
          legacy();
        }
        if (toolUse?.name === "church_code" && st.from) {
`;
 const patched=patchVoiceScheduling(source);assert.doesNotMatch(patched,/synthetic-route-credential|synthetic-anthropic-credential|legacy\(\)/);assert.match(patched,/Deno.env.get\("VOICE_ROUTE_TOKEN"\)/);assert.match(patched,/if \(!TOKEN \|\|/);assert.match(patched,/phoneSchedulingTurn\(SB_URL/);assert.throws(()=>patchVoiceScheduling(patched),/already installed/);assert.throws(()=>patchVoiceScheduling(source.replace('    handoffSent: boolean;','')),/source changed/);
});
test('the model cannot choose the receiving number or owner',async()=>{
 const row=item(),f=fixture(row);const response=await f.service(request('/draft',{call_sid:sourceSid,phone:'+12025550999',user_id:randomUUID(),plan:row.plan}));assert.equal(response.status,200);const persisted=f.writes.at(-1);assert.equal(persisted.p_phone,phone);assert.equal(persisted.p_call,sourceSid);assert.equal(persisted.p_user,undefined);assert.equal(f.commits,0);assert.equal((await response.json()).booked,false);
});
test('wrong callback number or CallSID cannot reach account resolution or save',async()=>{
 for(const change of [{To:'+12025550999',Digits:'1'},{CallSid:'CA'+'c'.repeat(32),Digits:'1'}]){const row=item(),f=fixture(row);await f.service(hook('/verify/confirm',row,change));assert.equal(f.commits,0);assert.equal(f.writes.length,0);}
});
test('voicemail greeting reveals no topic; exact readback plays before consent gather',async()=>{
 const row=item(),f=fixture(row);const start=await (await f.service(hook('/verify/start',row))).text();assert.doesNotMatch(start,/Forgiveness/);assert.match(start,/Press 1 to hear/);
 const review=await (await f.service(hook('/verify/review',row,{Digits:'1'}))).text();assert.match(review,/Forgiveness &lt;script&gt;/);assert.ok(review.indexOf('Forgiveness')<review.indexOf('<Gather'));assert.match(review,/automated calls/);assert.equal(f.commits,0);
});
test('silence and cancel never book; signed press 1 saves exactly once',async()=>{
 for(const digits of ['', '9']){const row=item(),f=fixture(row);await f.service(hook('/verify/confirm',row,{Digits:digits}));assert.equal(f.commits,0);assert.equal(row.status,'cancelled');}
 const row=item(),f=fixture(row);assert.match(await (await f.service(hook('/verify/confirm',row,{Digits:'1'}))).text(),/Your schedule is saved/);await f.service(hook('/verify/confirm',row,{Digits:'1'}));assert.equal(f.commits,1);
});
test('bookings cannot be confirmed after expiry or service withdrawal',async()=>{
 const expired=item();expired.expires_at=new Date(0).toISOString();const a=fixture(expired);await a.service(hook('/verify/confirm',expired,{Digits:'1'}));assert.equal(a.commits,0);
 const row=item(),b=fixture(row,{ready:false});assert.match(await (await b.service(hook('/verify/confirm',row,{Digits:'1'}))).text(),/not accepting bookings/);assert.equal(b.commits,0);
});
test('callback waits for hangup and ambiguous creation never redials',async()=>{
 const row=item();row.status='queued';row.callback_sid=null;const a=fixture(row);const tick=()=>new Request(base+'/dispatch',{method:'POST',headers:{'x-scheduler-secret':env.SCHEDULER_SECRET}});await a.service(tick());assert.equal(a.providerCalls.length,0);
 const b=fixture(row,{sourceStatus:'completed',uncertain:true});await b.service(tick());await b.service(tick());assert.equal(b.providerCalls.length,1);assert.equal(row.status,'uncertain');
});
test('conversation keeps the server draft and cannot claim a completed booking',async()=>{
 const state={},id=randomUUID();const client=async(url,init)=>{const body=JSON.parse(init.body);if(url.endsWith('/draft'))return Response.json({draft_id:id,speech:'Readback. May we call to confirm?',booked:false});assert.equal(body.draft_id,id);return Response.json({speech:'Answer the callback and press 1 to save.',booked:false});};
 await phoneSchedulingTurn(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,sourceSid,state,'prepare_bible_call',item().plan,client);assert.equal(state.phoneDraft,id);assert.match(await phoneSchedulingTurn(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,sourceSid,state,'confirm_bible_call',{consent:true,draft_id:randomUUID()},client),/callback/);
 const error=await phoneSchedulingTurn(env.SUPABASE_URL,'key',sourceSid,state,'prepare_bible_call',{},async()=>Response.json({error:'Not accepting bookings.'},{status:503}));assert.equal(error,'Not accepting bookings.');
});
