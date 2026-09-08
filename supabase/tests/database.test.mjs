import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { randomUUID } from 'node:crypto';
const db=new PGlite();
const user='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
before(async()=>{
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values('${user}'),('${other}'); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 await db.exec(await readFile(new URL('../migrations/202609080001_scheduled_lessons.sql',import.meta.url),'utf8'));
});
beforeEach(async()=>{await db.exec('truncate lesson_jobs,lesson_schedules,lesson_rate_limits cascade');});
after(()=>db.close());
async function next(time,zone,repeat,days,start,after){ const {rows}=await db.query('select lesson_next_run($1::time,$2,$3,$4::integer[],$5::date,$6::timestamptz) as result',[time,zone,repeat,days,start,after]);return rows[0].result?.toISOString()??null; }
function input(){const date=new Date(Date.now()+3600000);return {request_id:randomUUID(),content_type:'bible_study',topic:'Psalm 23',voice:'cedar',local_time:date.toISOString().slice(11,16),timezone:'UTC',recurrence:'once',weekdays:[],start_date:date.toISOString().slice(0,10),duration_minutes:10,consent:true};}
async function create(data=input(),owner=user){return (await db.query('select * from lesson_create_plan($1::uuid,$2,$3::jsonb)',[owner,'+12025550123',JSON.stringify(data)])).rows[0];}
async function readyJob(owner=user){const plan=await create(input(),owner); const id=randomUUID();await db.query("insert into lesson_jobs(id,schedule_id,due_at,status) values($1,$2,now()-interval '10 seconds','ready')",[id,plan.id]);return {id,plan};}

test('exact minute and fractional time zones are preserved',async()=>{
 assert.equal(await next('08:17','UTC','once',[],'2027-01-01','2026-12-31T00:00:00Z'),'2027-01-01T08:17:00.000Z');
 assert.equal(await next('09:17','Asia/Kolkata','once',[],'2027-01-01','2026-12-31T00:00:00Z'),'2027-01-01T03:47:00.000Z');
});
test('recurring calls follow daylight saving, not a fixed UTC offset',async()=>{
 assert.equal(await next('08:17','America/New_York','weekly',[1,2,3,4,5],'2027-03-12','2027-03-12T14:00:00Z'),'2027-03-15T12:17:00.000Z');
});
test('a nonexistent spring-forward local time is skipped',async()=>{
 assert.equal(await next('02:30','America/New_York','weekly',[0],'2027-03-14','2027-03-13T00:00:00Z'),'2027-03-21T06:30:00.000Z');
 assert.equal(await next('02:30','America/New_York','once',[],'2027-03-14','2027-03-13T00:00:00Z'),null);
});
test('fall-back repeated time uses standard time once, with no second occurrence',async()=>{
 assert.equal(await next('01:30','America/New_York','weekly',[0],'2026-11-01','2026-10-31T00:00:00Z'),'2026-11-01T06:30:00.000Z');
 assert.equal(await next('01:30','America/New_York','weekly',[0],'2026-11-01','2026-11-01T06:30:01Z'),'2026-11-08T06:30:00.000Z');
});
test('repeated create requests return one schedule and reject changed choices',async()=>{
 const data=input();const first=await create(data);assert.equal((await create(data)).id,first.id);
 await assert.rejects(create({...data,voice:'onyx'}),/already used/);
 assert.equal((await db.query('select count(*)::int as n from lesson_schedules')).rows[0].n,1);
});
test('unrelated nearby calls are rejected without overwriting earlier plans',async()=>{
 await create(); await assert.rejects(create(),/already scheduled/);
});
test('repeated cron ticks create one occurrence and advance a recurring plan',async()=>{
 const plan=await create(); await db.query("update lesson_schedules set recurrence='weekly',weekdays=array[0,1,2,3,4,5,6],next_run_at=now()+interval '19 minutes' where id=$1",[plan.id]);
 await db.query('select lesson_enqueue()');await db.query('select lesson_enqueue()');
 assert.equal((await db.query('select count(*)::int as n from lesson_jobs')).rows[0].n,1);
 assert.equal((await db.query('select next_run_at>now()+interval \'20 minutes\' as future from lesson_schedules')).rows[0].future,true);
});
test('pausing is owner-scoped and cancels prepared occurrences',async()=>{
 const {id,plan}=await readyJob();assert.equal((await db.query('select lesson_pause_plan($1,$2) as paused',[other,plan.id])).rows[0].paused,false);
 assert.equal((await db.query('select lesson_pause_plan($1,$2) as paused',[user,plan.id])).rows[0].paused,true);
 assert.equal((await db.query('select status from lesson_jobs where id=$1',[id])).rows[0].status,'cancelled');
 assert.equal((await db.query('select * from lesson_claim_delivery()')).rows.length,0);
});
test('delivery is claimed once and ambiguous calls cannot be automatically redialed',async()=>{
 const {id}=await readyJob();assert.equal((await db.query('select * from lesson_claim_delivery()')).rows.length,1);
 await db.query("update lesson_jobs set status='uncertain' where id=$1",[id]);
 await db.query('select lesson_enqueue()');assert.equal((await db.query('select * from lesson_claim_delivery()')).rows.length,0);
});
test('simultaneous schedules do not place overlapping calls to the same user',async()=>{
 const {plan}=await readyJob();await db.query("insert into lesson_jobs(schedule_id,due_at,status) values($1,now()-interval '20 seconds','ready')",[plan.id]);
 assert.equal((await db.query('select * from lesson_claim_delivery()')).rows.length,1);
 assert.equal((await db.query('select * from lesson_claim_delivery()')).rows.length,0);
});
test('late calls are marked missed instead of ringing at an unwanted time',async()=>{
 const {id}=await readyJob();await db.query("update lesson_jobs set due_at=now()-interval '3 minutes' where id=$1",[id]);await db.query('select lesson_enqueue()');
 assert.equal((await db.query('select status from lesson_jobs where id=$1',[id])).rows[0].status,'missed');
 assert.equal((await db.query('select * from lesson_claim_delivery()')).rows.length,0);
});
test('only preparation leases can retry, and repeated failures stop',async()=>{
 const plan=await create();await db.query("insert into lesson_jobs(schedule_id,due_at,status,lease_until,failures) values($1,now()+interval '10 minutes','preparing',now()-interval '1 minute',2)",[plan.id]);await db.query('select lesson_enqueue()');
 assert.equal((await db.query('select status from lesson_jobs')).rows[0].status,'failed');
});
test('browser roles cannot directly read schedules or invoke privileged scheduler functions',async()=>{
 await db.exec('set role authenticated');
 await assert.rejects(db.query('select * from public.lesson_schedules'),/permission denied/);
 await assert.rejects(db.query('select public.lesson_enqueue()'),/permission denied/);
 await db.exec('reset role');
});
test('per-user rate limits are atomic and enforce the requested cap',async()=>{
 for(let n=0;n<2;n++)assert.equal((await db.query("select lesson_rate_limit('preview:test',2) as allowed")).rows[0].allowed,true);
 assert.equal((await db.query("select lesson_rate_limit('preview:test',2) as allowed")).rows[0].allowed,false);
});
