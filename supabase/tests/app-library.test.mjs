import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { before,after,test } from 'node:test';
const db=new PGlite();
const owner='11111111-1111-4111-8111-111111111111';
const other='22222222-2222-4222-8222-222222222222';
before(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${owner}'),('${other}');
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid(),auth.jwt() to anon,authenticated;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,delete on storage.objects to authenticated;`);
 await db.exec(await readFile(new URL('../migrations/20261001172608_elroi_app_media_study.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../migrations/20261001174111_elroi_catalog_policy_optimization.sql',import.meta.url),'utf8'));
});
after(()=>db.close());
async function asUser(user=owner,claims='{}') {await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)",[user,claims]);await db.exec('set role authenticated');}
async function addMedia(status='draft',access='free',provider='youtube') {
 await db.exec('reset role');const id=randomUUID();
 await db.query(`insert into public.elroi_media(id,slug,title,synopsis,section,book,passage,artwork,provider,youtube_id,storage_path,status,access,reflection_question) values($1,$2,'Test film','Summary','cinema','Genesis','Genesis 1','creation',$3,$4,$5,$6,$7,'What do you notice?')`,[id,`test-${id}`,provider,provider==='youtube'?'7bT1Tzisz-A':null,provider==='storage'?`videos/${id}.mp4`:null,status,access]);return id;
}
test('public catalog exposes releases and upcoming stories, but hides drafts',async()=>{
 const draft=await addMedia('draft');const released=await addMedia('published');const upcoming=await addMedia('coming_soon');await db.exec('set role anon');const {rows}=await db.query('select id from elroi_media where id=any($1::uuid[])',[[draft,released,upcoming]]);assert.deepEqual(rows.map(row=>row.id).sort(),[released,upcoming].sort());
});
test('members cannot edit catalog, even if they set editable user metadata',async()=>{
 const id=await addMedia();await asUser(owner,JSON.stringify({user_metadata:{elroi_editor:true}}));assert.equal((await db.query("update elroi_media set title='Hijacked' where id=$1 returning id",[id])).rows.length,0);await db.exec('reset role');assert.equal((await db.query('select title from elroi_media where id=$1',[id])).rows[0].title,'Test film');
});
test('publisher app metadata enables studio editing',async()=>{
 const id=await addMedia();await asUser(owner,JSON.stringify({app_metadata:{elroi_editor:true}}));assert.equal((await db.query("update elroi_media set title='Released title' where id=$1 returning id",[id])).rows.length,1);
});
test('private bucket cannot be read or written by ordinary members',async()=>{
 await asUser();assert.equal((await db.query("select * from storage.objects where bucket_id='elroi-media'")).rows.length,0);await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('elroi-media',$1)",[`videos/${randomUUID()}.mp4`]),/row-level security/);
});
test('paid YouTube entries and published films with missing assets are rejected',async()=>{
 await db.exec('reset role');await assert.rejects(addMedia('published','member','youtube'),/elroi_paid_media_private/);
 const id=await addMedia('draft','member','storage');await assert.rejects(db.query("update elroi_media set status='published',storage_path=null where id=$1",[id]),/elroi_published_source/);
});
test('reflection saves preserve completion, and completion writes preserve reflections',async()=>{
 await asUser();await db.query("select save_elroi_study_progress(1::smallint,true,'First reflection')");await db.query("select save_elroi_study_progress(1::smallint,null,'Revised reflection')");let row=(await db.query('select * from elroi_study_progress where day=1')).rows[0];assert.equal(row.completed,true);assert.equal(row.reflection,'Revised reflection');await db.query('select save_elroi_study_progress(1::smallint,false,null)');row=(await db.query('select * from elroi_study_progress where day=1')).rows[0];assert.equal(row.completed,false);assert.equal(row.reflection,'Revised reflection');
});
test('account progress cannot be read or reassigned by another account',async()=>{
 await asUser(owner);await db.query("select save_elroi_study_progress(2::smallint,true,'Private thought')");await asUser(other);assert.equal((await db.query('select * from elroi_study_progress where user_id=$1',[owner])).rows.length,0);await assert.rejects(db.query("insert into elroi_study_progress(user_id,day) values($1,3)",[owner]),/row-level security/);await asUser(owner);await assert.rejects(db.query('update elroi_study_progress set user_id=$1 where day=2',[other]),/row-level security/);
});
