import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
const db=new PGlite();
const user='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const phone='+12025550124',sid='CA'+'b'.repeat(32);
before(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,phone text unique,phone_confirmed_at timestamptz);insert into auth.users(id) values('${user}'),('${other}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table calls(id uuid primary key default gen_random_uuid(),caller_id uuid,created_at timestamptz default now());
 create table call_schedules(id uuid primary key default gen_random_uuid(),phone text,active boolean default true);
 create table portal_accounts(user_id uuid primary key,email text,phone text unique,phone_verified boolean not null default false,verify_code text,verify_expires timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());alter table portal_accounts enable row level security;`);
 for(const file of ['20260908170059_scheduled_lessons.sql','20260908172553_member_dashboard.sql','20260908191019_phone_learning_booking.sql'])await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
});
beforeEach(async()=>{await db.exec('truncate portal_accounts,call_schedules,lesson_schedules,lesson_jobs,phone_booking_drafts cascade;update auth.users set phone=null,phone_confirmed_at=null;');});
after(()=>db.close());
function plan(){const date=new Date(Date.now()+86400000);return {content_type:'bible_study',topic:'Forgiveness',voice:'cedar',local_time:'19:17',timezone:'UTC',recurrence:'weekly',weekdays:[0,1,2,3,4,5,6],start_date:date.toISOString().slice(0,10),duration_minutes:10};}
async function prepare(action='book',input=plan(),call='CA'+randomUUID().replaceAll('-','')){return (await db.query('select * from phone_booking_prepare($1,$2,$3,$4::jsonb)',[call,phone,action,JSON.stringify(input)])).rows[0];}
const owner=async()=>(await db.query('select phone_booking_owner($1) as id',[phone])).rows[0].id;
const commit=async(item,who=user,callback=sid)=>(await db.query('select phone_booking_commit($1,$2,$3) as result',[item.id,callback,who])).rows[0].result;
async function recipient(item){await db.query("update phone_booking_drafts set status='submitted',callback_sid=$1 where id=$2",[sid,item.id]);}
async function verified(who=user){await db.query('insert into portal_accounts(user_id,phone,phone_verified) values($1,$2,true)',[who,phone]);}

test('drafts preserve exact choices and do not create schedules or users',async()=>{
 const p=plan(),item=await prepare('book',p);for(const key of Object.keys(p))assert.deepEqual(item.plan[key],p[key]);
 assert.equal(item.status,'draft');assert.equal((await db.query('select * from lesson_schedules')).rows.length,0);assert.equal(await owner(),null);
 await assert.rejects(commit(item),/Confirmation does not match/);
});
test('only matching callback and verified owner can commit, and retries save once',async()=>{
 await verified();const item=await prepare();await recipient(item);
 await assert.rejects(commit(item,user,'CA'+'c'.repeat(32)),/does not match/);
 await assert.rejects(commit(item,other),/ownership changed/);
 const a=await commit(item),b=await commit(item);assert.equal(a.schedule_id,b.schedule_id);
 const rows=(await db.query('select * from lesson_schedules')).rows;assert.equal(rows.length,1);assert.equal(rows[0].user_id,user);assert.equal(rows[0].phone,phone);assert.equal(rows[0].local_time,'19:17:00');assert.equal(rows[0].consent_version,'phone-scheduled-calls-v1');
});
test('changed drafts invalidate prior confirmation IDs and queued drafts cannot change',async()=>{
 const a=await prepare(),b=await prepare('book',{...plan(),voice:'onyx'},a.source_call_sid);assert.notEqual(a.id,b.id);assert.equal((await db.query('select * from phone_booking_drafts where id=$1',[a.id])).rows.length,0);
 await db.query("update phone_booking_drafts set status='queued' where id=$1",[b.id]);await assert.rejects(prepare('book',plan(),b.source_call_sid),/already requested/);
});
test('expired or cancelled confirmation never schedules',async()=>{
 await verified();const item=await prepare();await recipient(item);await db.query("update phone_booking_drafts set expires_at=now()-interval '1 second' where id=$1",[item.id]);await assert.rejects(commit(item),/expired/);
 await db.query("update phone_booking_drafts set expires_at=now()+interval '1 hour',status='cancelled' where id=$1",[item.id]);await assert.rejects(commit(item),/expired/);
 assert.equal((await db.query('select * from lesson_schedules')).rows.length,0);
});
test('a confirmed time cannot silently advance to the next recurring occurrence',async()=>{
 await verified();const item=await prepare();await recipient(item);await db.query("update phone_booking_drafts set next_run_at=next_run_at-interval '1 day' where id=$1",[item.id]);await assert.rejects(commit(item),/time is no longer available/);
});
test('verified portal account wins over a different phone-login account',async()=>{
 await verified();await db.query('update auth.users set phone=$1,phone_confirmed_at=now() where id=$2',[phone.slice(1),other]);assert.equal(await owner(),user);
});
test('new phone-confirmed Auth members get the same dashboard and scheduler ownership',async()=>{
 await db.query('update auth.users set phone=$1,phone_confirmed_at=now() where id=$2',[phone.slice(1),user]);assert.equal(await owner(),user);
 const item=await prepare();await recipient(item);await commit(item);const row=(await db.query('select * from portal_accounts')).rows[0];assert.equal(row.user_id,user);assert.equal(row.phone_verified,true);
});
test('unverified Auth identities and different canonical phones cannot be taken over',async()=>{
 await db.query('update auth.users set phone=$1 where id=$2',[phone.slice(1),user]);await assert.rejects(owner(),/Finish verifying/);
 await db.query('update auth.users set phone_confirmed_at=now() where id=$1',[user]);await db.query('insert into portal_accounts(user_id,phone,phone_verified) values($1,$2,true)',[user,'+12025550999']);
 const item=await prepare();await recipient(item);await assert.rejects(commit(item),/another phone/);
});
test('stop-all confirmation pauses both legacy and new plans for this number only',async()=>{
 await verified();let item=await prepare();await recipient(item);await commit(item);await db.query('insert into call_schedules(phone) values($1),($2)',[phone,'+12025550999']);
 // A second callback has its own SID.
 item=await prepare('pause_all');const second='CA'+'d'.repeat(32);await db.query("update phone_booking_drafts set status='submitted',callback_sid=$1 where id=$2",[second,item.id]);await commit(item,user,second);
 assert.equal((await db.query('select active from lesson_schedules')).rows[0].active,false);const legacy=(await db.query('select * from call_schedules')).rows;assert.equal(legacy.find(r=>r.phone===phone).active,false);assert.equal(legacy.find(r=>r.phone!==phone).active,true);
});
test('browser roles cannot access drafts, resolve owners, or create phone schedules',async()=>{
 await db.exec('set role authenticated');for(const sql of ['select * from phone_booking_drafts',`select phone_booking_owner('${phone}')`,`select phone_booking_commit('${randomUUID()}','${sid}','${user}')`])await assert.rejects(db.query(sql),/permission denied/);await db.exec('reset role');
});
