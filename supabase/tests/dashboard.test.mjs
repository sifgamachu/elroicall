import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
const db=new PGlite();
const user='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
before(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${user}'),('${other}');create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table calls(id uuid primary key default gen_random_uuid(),caller_id uuid,created_at timestamptz default now());
 create table call_schedules(id uuid primary key default gen_random_uuid(),phone text,active boolean default true);
 create table portal_accounts(user_id uuid primary key,email text,phone text unique,phone_verified boolean not null default false,verify_code text,verify_expires timestamptz,created_at timestamptz default now(),updated_at timestamptz default now());alter table portal_accounts enable row level security;`);
 await db.exec(await readFile(new URL('../migrations/20260908170059_scheduled_lessons.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../migrations/20260908172553_member_dashboard.sql',import.meta.url),'utf8'));
});
beforeEach(async()=>{await db.exec('truncate portal_accounts,call_schedules,lesson_schedules,lesson_jobs,member_preferences cascade');});
after(()=>db.close());
const begin=(owner,phone,hash='correct-hash')=>db.query('select portal_begin_verification($1,$2,$3,$4)',[owner,'test@example.invalid',phone,hash]);
const finish=async(owner,hash='correct-hash')=>(await db.query('select portal_finish_verification($1,$2) as result',[owner,hash])).rows[0].result;
async function plan(owner){return (await db.query(`insert into lesson_schedules(user_id,request_id,content_type,topic,voice,local_time,timezone,recurrence,weekdays,start_date,duration_minutes,phone,consent_at,next_run_at) values($1,gen_random_uuid(),'bible_study','Psalm 23','marin','08:00','UTC','weekly',array[1],current_date,10,'+12025550123',now(),now()+interval '1 day') returning id`,[owner])).rows[0].id;}

test('starting replacement verification retains the currently verified phone',async()=>{
 await db.query('insert into portal_accounts(user_id,phone,phone_verified) values($1,$2,true)',[user,'+12025550123']);await begin(user,'+12025550456');
 const account=(await db.query('select * from portal_accounts')).rows[0];assert.equal(account.phone,'+12025550123');assert.equal(account.phone_verified,true);assert.equal(account.pending_phone,'+12025550456');
});
test('verification locks after five incorrect guesses, including a later correct guess',async()=>{
 await begin(user,'+12025550123');for(let i=0;i<5;i++)assert.equal((await finish(user,'wrong')).error,'wrong_code');
 assert.equal((await finish(user)).error,'too_many_attempts');assert.equal((await db.query('select phone_verified from portal_accounts')).rows[0].phone_verified,false);
});
test('expired verification never changes phone ownership',async()=>{
 await begin(user,'+12025550123');await db.exec("update portal_accounts set verify_expires=now()-interval '1 minute'");assert.equal((await finish(user)).error,'expired');
});
test('confirming a replacement pauses old-number plans and only that owners lessons',async()=>{
 await db.query('insert into portal_accounts(user_id,phone,phone_verified) values($1,$2,true)',[user,'+12025550123']);
 await db.query('insert into call_schedules(phone) values($1),($2)',['+12025550123','+12025550999']);const mine=await plan(user);const theirs=await plan(other);
 await db.query("insert into lesson_jobs(schedule_id,due_at,status) values($1,now()+interval '1 minute','ready')",[mine]);
 await begin(user,'+12025550456');assert.equal((await finish(user)).phone_verified,true);
 const accounts=(await db.query('select * from portal_accounts')).rows[0];assert.equal(accounts.phone,'+12025550456');assert.equal(accounts.verify_code,null);assert.equal(accounts.pending_phone,null);
 const rows=(await db.query('select id,active from lesson_schedules')).rows;assert.equal(rows.find(row=>row.id===mine).active,false);assert.equal(rows.find(row=>row.id===theirs).active,true);
 assert.equal((await db.query('select status from lesson_jobs')).rows[0].status,'cancelled');
 const tracks=(await db.query('select phone,active from call_schedules')).rows;assert.equal(tracks.find(row=>row.phone==='+12025550123').active,false);assert.equal(tracks.find(row=>row.phone==='+12025550999').active,true);
});
test('another account cannot take a number already verified by a member',async()=>{
 await begin(user,'+12025550123');await finish(user);await assert.rejects(begin(other,'+12025550123'),/Phone unavailable/);
});
test('completed lesson counts never include another account',async()=>{
 const a=await plan(user);const b=await plan(other);await db.query("insert into lesson_jobs(schedule_id,due_at,status,accepted,lesson_finished) values($1,now(),'completed',true,true),($2,now(),'completed',true,true),($2,now()-interval '1 day','completed',true,true)",[a,b]);
 const result=(await db.query('select lesson_dashboard_stats($1) as value',[user])).rows[0].value;assert.equal(result.lessons_finished,1);assert.equal(result.calls_answered,1);
});
test('member preferences and verification controls are inaccessible to browser database roles',async()=>{
 await db.exec('set role authenticated');
 for(const query of ['select * from member_preferences','select * from lesson_service_settings','select * from portal_accounts',`select portal_finish_verification('${user}','hash')`,`select lesson_dashboard_stats('${other}')`])await assert.rejects(db.query(query),/permission denied/);
 await db.exec('reset role');
});
test('account deletion cascades saved preferences and its verified phone record',async()=>{
 await begin(user,'+12025550123');await db.query('insert into member_preferences(user_id) values($1)',[user]);await db.query('delete from auth.users where id=$1',[user]);
 assert.equal((await db.query('select * from portal_accounts')).rows.length,0);assert.equal((await db.query('select * from member_preferences')).rows.length,0);await db.query('insert into auth.users values($1)',[user]);
});
