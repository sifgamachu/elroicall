import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {before,beforeEach,after,test} from 'node:test';
import assert from 'node:assert/strict';
const db=new PGlite();const a=randomUUID(),b=randomUUID(),phone='+12025550124',sid='CA'+'b'.repeat(32);
const hash=code=>createHash('sha256').update(code).digest('hex');
before(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${a}'),('${b}');create table portal_accounts(user_id uuid primary key references auth.users(id) on delete cascade,phone text unique,phone_verified boolean);`);
 await db.exec(await readFile(new URL('../migrations/20260908224206_member_continuity.sql',import.meta.url),'utf8'));
});
beforeEach(async()=>{await db.exec('truncate member_memory_settings,member_memory_notes,member_memory_handoffs,portal_accounts cascade');});after(()=>db.close());
const snapshot=async(owner=a)=>(await db.query('select member_memory_snapshot($1) as value',[owner])).rows[0].value;
const change=async(action,revision,note={},owner=a)=>(await db.query('select member_memory_change($1,$2,$3,$4::jsonb) as value',[owner,action,revision,JSON.stringify(note)])).rows[0].value;
const note=()=>({id:randomUUID(),kind:'reflection',title:'A little courage',body:'I would like to explore Joshua 1 and what courage means in daily life.',consent:true});
async function saved(){await change('enable',0);return await change('save',1,note());}
async function issue(id,revision=2,code='123456'){await db.query('insert into portal_accounts(user_id,phone,phone_verified) values($1,$2,true) on conflict(user_id) do nothing',[a,phone]);return (await db.query('select member_memory_issue($1,$2,$3,$4) as value',[a,id,revision,hash(code)])).rows[0].value;}
const redeem=async(code='123456',number=phone,call=sid)=>(await db.query('select member_memory_redeem($1,$2,$3) as value',[hash(code),number,call])).rows[0].value;
const context=async(id,call=sid)=>(await db.query('select member_memory_context($1,$2) as value',[id,call])).rows[0].value;

test('memory is off by default and saving requires both opt-in and explicit note consent',async()=>{
 assert.deepEqual(await snapshot(),{enabled:false,revision:0,notes:[]});await assert.rejects(change('save',0,note()),/Turn on saved/);await change('enable',0);await assert.rejects(change('save',1,{...note(),consent:false}),/Confirm/);
});
test('snapshots contain only the owners selected notes',async()=>{
 const mine=await saved();await change('enable',0,{},b);await change('save',1,{...note(),title:'Another member'},b);assert.equal((await snapshot()).notes.length,1);assert.equal((await snapshot()).notes[0].id,mine.notes[0].id);assert.equal((await snapshot(b)).notes[0].title,'Another member');
});
test('stale edits and clear requests cannot overwrite or erase newer work',async()=>{
 const data=await saved();await change('save',data.revision,{...data.notes[0],body:'Updated by another screen.',consent:true});await assert.rejects(change('save',data.revision,{...data.notes[0],consent:true}),/changed on another screen/);await assert.rejects(change('clear',data.revision),/changed on another screen/);assert.equal((await snapshot()).notes[0].body,'Updated by another screen.');
});
test('another owner cannot overwrite or delete a known note ID',async()=>{
 const mine=await saved();await change('enable',0,{},b);await assert.rejects(change('save',1,{...mine.notes[0],body:'Replacement',consent:true},b),/unavailable/);await assert.rejects(change('delete',1,{id:mine.notes[0].id},b),/not found/);assert.equal((await snapshot()).notes[0].body,mine.notes[0].body);
});
test('handoff requires verified ownership, the correct number and a valid unexpired code',async()=>{
 const data=await saved();await assert.rejects(db.query('select member_memory_issue($1,$2,$3,$4)',[a,data.notes[0].id,data.revision,hash('123456')]),/Verify/);await issue(data.notes[0].id);assert.equal(await redeem('654321'),null);assert.equal(await redeem('123456','+12025550999'),null);assert.ok((await redeem()).note);
});
test('codes bind to one call and cannot be replayed into another call',async()=>{
 const data=await saved();await issue(data.notes[0].id);const result=await redeem();assert.ok(result.handoff_id);assert.equal((await redeem()).handoff_id,result.handoff_id);assert.equal(await redeem('123456',phone,'CA'+'c'.repeat(32)),null);assert.equal(await context(result.handoff_id,'CA'+'c'.repeat(32)),null);
});
test('pause revokes phone context while retaining editable notes; resuming does not restore old codes',async()=>{
 const data=await saved();await issue(data.notes[0].id);const token=await redeem();const paused=await change('pause',data.revision);assert.equal(paused.enabled,false);assert.equal(paused.notes.length,1);assert.equal(await context(token.handoff_id),null);await change('enable',paused.revision);assert.equal(await redeem(),null);
});
test('editing or deleting a note revokes its existing phone handoff',async()=>{
 let data=await saved();await issue(data.notes[0].id);const token=await redeem();data=await change('save',data.revision,{...data.notes[0],body:'A changed thought.',consent:true});assert.equal(await context(token.handoff_id),null);await issue(data.notes[0].id,data.revision,'654321');const second=await redeem('654321');await change('delete',data.revision,{id:data.notes[0].id});assert.equal(await context(second.handoff_id),null);
});
test('phone changes and expired grants immediately remove access',async()=>{
 const data=await saved();await issue(data.notes[0].id);const token=await redeem();await db.query('update portal_accounts set phone=$1 where user_id=$2',['+12025550999',a]);assert.equal(await context(token.handoff_id),null);await db.query('update portal_accounts set phone=$1 where user_id=$2',[phone,a]);await db.exec("update member_memory_handoffs set expires_at=now()-interval '1 second'");assert.equal(await context(token.handoff_id),null);assert.equal(await redeem(),null);
});
test('clear removes all notes and tokens and leaves saved notes off',async()=>{
 const data=await saved();await issue(data.notes[0].id);const result=await change('clear',data.revision);assert.deepEqual(result,{enabled:false,revision:3,notes:[]});assert.equal((await db.query('select * from member_memory_handoffs')).rows.length,0);
});
test('browser roles cannot access private tables or privileged memory RPCs',async()=>{
 await db.exec('set role authenticated');for(const query of ['select * from member_memory_notes','select * from member_memory_handoffs',`select member_memory_snapshot('${a}')`,`select member_memory_change('${a}','enable',0)`])await assert.rejects(db.query(query),/permission denied/);await db.exec('reset role');
});
test('deleting an account cascades all of its saved notes and grants',async()=>{
 const data=await saved();await issue(data.notes[0].id);await db.query('delete from auth.users where id=$1',[a]);for(const table of ['member_memory_notes','member_memory_handoffs','member_memory_settings'])assert.equal((await db.query('select * from '+table)).rows.length,0);await db.query('insert into auth.users values($1)',[a]);
});
