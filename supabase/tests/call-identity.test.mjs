import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {before,beforeEach,after,test} from 'node:test';
import assert from 'node:assert/strict';
const db=new PGlite(),owner=randomUUID(),other=randomUUID(),phone='+12025550124',salt='a'.repeat(32),digest='b'.repeat(64);
const sid=n=>'CA'+n.toString(16).padStart(32,'0');
const rpc=async(name,args=[])=>{const slots=args.map((_,i)=>'$'+(i+1)).join(',');return (await db.query(`select ${name}(${slots}) as result`,args)).rows[0].result;};
const begin=(n=1,kind='inbound',context=null,number=phone)=>rpc('calling_access_begin',[sid(n),number,kind,context]);
const save=(revision=0)=>rpc('calling_identity_save',[owner,'Grace',salt,digest,revision]);
const verify=(n=1,right=true)=>rpc('calling_access_verify',[sid(n),salt,right?digest:'c'.repeat(64),false]);
const guest=n=>rpc('calling_access_verify',[sid(n),null,null,true]);
const permit=grant=>rpc('calling_access_permit',[grant.call_sid,grant.relay_token]);
before(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${owner}'),('${other}');create table portal_accounts(user_id uuid primary key references auth.users(id) on delete cascade,phone text unique,phone_verified boolean);create table member_preferences(user_id uuid primary key,duration_minutes integer);create table callers(id uuid primary key,phone text);create table calls(caller_id uuid);create table call_schedules(id uuid primary key,phone text,active boolean);create table lesson_schedules(id uuid primary key,user_id uuid,phone text,active boolean,duration_minutes integer);create table lesson_jobs(id uuid primary key,schedule_id uuid,call_sid text);`);
 await db.exec(await readFile(new URL('../migrations/20260911022309_caller_identity.sql',import.meta.url),'utf8'));
});
beforeEach(async()=>{await db.exec('truncate calling_identities,calling_access_sessions,calling_guest_passes,portal_accounts,member_preferences,callers,calls,call_schedules,lesson_schedules,lesson_jobs cascade;update calling_security_settings set enabled=true');});
after(()=>db.close());
async function member(){await db.query('insert into portal_accounts values($1,$2,true)',[owner,phone]);await save();}
test('phone enforcement can remain off while the identity is safely stored',async()=>{
 await db.exec('update calling_security_settings set enabled=false');const result=await save();assert.equal(result.phone_ready,false);assert.equal(result.pin_set,true);assert.equal(result.pin_digest,undefined);assert.equal((await begin()).status,'disabled');
});
test('saving requires a current revision and resets revoke active calls',async()=>{
 await member();await begin();const access=await verify();assert.ok(await permit(access));await assert.rejects(save(0),/changed on another screen/);await save(1);assert.equal(await permit(access),null);assert.equal((await rpc('calling_identity_snapshot',[owner])).revision,2);
});
test('first guest must accept, gets ten minutes, and a second call requires signup',async()=>{
 const pending=await begin();assert.equal(pending.status,'pending_guest');assert.equal((await db.query('select * from calling_guest_passes')).rows.length,0);const g=await guest(1);assert.equal(g.status,'guest');assert.equal(g.duration_minutes,10);assert.ok(await permit(g));assert.equal((await begin(2)).status,'signup');
});
test('two pending first calls cannot both consume a guest pass',async()=>{
 await begin(1);await begin(2);assert.equal((await guest(1)).status,'guest');assert.equal((await guest(2)).status,'signup');
});
test('legacy call history requires signup even without a new guest-pass row',async()=>{
 await db.query('insert into callers values($1,$2)',[owner,phone]);await db.query('insert into calls values($1)',[owner]);assert.equal((await begin()).status,'signup');
});
test('a nickname alone or an unverified phone grants no member access',async()=>{
 await save();await db.query('insert into portal_accounts values($1,$2,false)',[owner,phone]);assert.equal((await begin()).status,'pending_guest');await db.exec('update portal_accounts set phone_verified=true');const row=await begin(2);assert.equal(row.status,'pending_pin');assert.equal(row.nickname,undefined);assert.equal((await rpc('calling_access_get',[sid(2)])).pin_digest,undefined);
});
test('registered callers without a PIN receive setup instructions; preferences set duration',async()=>{
 await db.query('insert into portal_accounts values($1,$2,true)',[owner,phone]);assert.equal((await begin()).status,'setup');await save();await db.query('insert into member_preferences values($1,15)',[owner]);await begin(2);const row=await verify(2);assert.equal(row.nickname,'Grace');assert.equal(row.duration_minutes,15);
});
test('three attempts stop one call and five attempts across calls lock the account',async()=>{
 await member();await begin(1);assert.equal((await verify(1,false)).status,'wrong_pin');assert.equal((await verify(1,false)).status,'wrong_pin');assert.equal((await verify(1,false)).status,'locked');assert.equal((await verify(1,true)).status,'locked');await begin(2);assert.equal((await verify(2,false)).status,'wrong_pin');assert.equal((await verify(2,false)).status,'locked');await begin(3);assert.equal((await verify(3,true)).status,'locked');await db.exec("update calling_identities set locked_until=now()-interval '1 second'");assert.equal((await verify(3,true)).status,'member');
});
test('wrong salt, malformed candidates and phone changes cannot authenticate',async()=>{
 await member();await begin();assert.equal((await rpc('calling_access_verify',[sid(1),'d'.repeat(32),digest,false])).status,'wrong_pin');assert.equal((await rpc('calling_access_verify',[sid(1),null,null,false])).status,'wrong_pin');await db.query('update portal_accounts set phone=$1',['+12025550999']);assert.equal((await verify()).status,'blocked');
});
test('expired, mismatched and revoked call grants fail without renewing the deadline',async()=>{
 await member();await begin();const access=await verify();const repeat=await begin();assert.equal(repeat.deadline_at,access.deadline_at);assert.equal(await rpc('calling_access_permit',[sid(2),access.relay_token]),null);assert.equal(await rpc('calling_access_permit',[sid(1),randomUUID()]),null);await assert.rejects(begin(1,'inbound',null,'+12025550999'),/identity mismatch/);await db.exec("update calling_access_sessions set deadline_at=now()-interval '1 second',expires_at=now()-interval '1 second'");assert.equal(await permit(access),null);assert.equal((await begin()).status,'member');assert.equal(await rpc('calling_access_get',[sid(1)]),null);
});
test('changing a verified phone revokes an already active grant',async()=>{
 await member();await begin();const g=await verify();await db.exec('update portal_accounts set phone_verified=false');assert.equal(await permit(g),null);
});
test('outbound and lesson calls require matching schedule ownership and call SID',async()=>{
 await member();const plan=randomUUID(),job=randomUUID();assert.equal((await begin(1,'outbound',plan)).status,'blocked');await db.query('insert into call_schedules values($1,$2,true)',[plan,phone]);assert.equal((await begin(2,'outbound',plan)).status,'pending_pin');await db.query('insert into lesson_schedules values($1,$2,$3,true,5)',[plan,owner,phone]);await db.query('insert into lesson_jobs values($1,$2,$3)',[job,plan,sid(3)]);assert.equal((await begin(3,'lesson',job)).duration_minutes,5);assert.equal((await begin(4,'lesson',job)).status,'blocked');
});
test('browser roles have no direct access to PIN hashes or admission RPCs',async()=>{
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);for(const query of ['select * from calling_identities','select * from calling_access_sessions',`select calling_identity_snapshot('${owner}')`,`select calling_access_get('${sid(1)}')`,'select calling_security_enabled()'])await assert.rejects(db.query(query),/permission denied/);await db.exec('reset role');}
});
test('account deletion removes its PIN and call grants',async()=>{
 await member();await begin();await verify();await db.query('delete from auth.users where id=$1',[owner]);for(const table of ['calling_identities','calling_access_sessions'])assert.equal((await db.query('select * from '+table)).rows.length,0);await db.query('insert into auth.users values($1)',[owner]);
});
