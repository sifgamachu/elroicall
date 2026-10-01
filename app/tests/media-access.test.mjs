import test from 'node:test';
import assert from 'node:assert/strict';
import { createMediaAccess, membershipActive } from '../../supabase/functions/media-access/service.ts';
import { appLinkPath } from '../src/lib/native.ts';
import { canPlayMedia, safeStoragePath } from '../src/lib/media-model.ts';

const id='11111111-1111-4111-8111-111111111111';
const path=`videos/${id}.mp4`;
const item={id,status:'published',provider:'storage',access:'member',storage_path:path};
function setup(overrides={}) {
 let signed=0;
 const handler=createMediaAccess({loadMedia:async()=>item,identify:async()=>id,verifyMembership:async()=>true,signVideo:async()=>{signed++;return 'https://example.test/signed';},...overrides});
 return {call:(headers={},method='GET')=>handler(new Request(`https://example.test/functions/v1/media-access/play/${id}`,{headers,method})),signed:()=>signed};
}
test('member playback does not sign a film without a valid account',async()=>{
 const guest=setup();assert.equal((await guest.call()).status,401);assert.equal(guest.signed(),0);
 const invalid=setup({identify:async()=>null});assert.equal((await invalid.call({Authorization:'Bearer invalid'})).status,401);assert.equal(invalid.signed(),0);
});
test('expired or unavailable subscriptions fail closed',async()=>{
 const denied=setup({verifyMembership:async()=>false});assert.equal((await denied.call({Authorization:'Bearer token'})).status,403);assert.equal(denied.signed(),0);
 const offline=setup({verifyMembership:async()=>{throw Error('secret missing');}});const response=await offline.call({Authorization:'Bearer token'});assert.equal(response.status,503);assert.equal(offline.signed(),0);assert.equal((await response.text()).includes('secret'),false);
});
test('valid store entitlement permits a private link with no caching',async()=>{
 const permitted=setup();const response=await permitted.call({Authorization:'Bearer token',Origin:'https://elroicall.com'});assert.equal(response.status,200);assert.equal(permitted.signed(),1);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('access-control-allow-origin'),'https://elroicall.com');
});
test('drafts, upcoming films, unknown access, and unsafe file paths cannot play',async()=>{
 for (const patch of [{status:'draft'},{status:'coming_soon'},{storage_path:'../private.mp4'},{access:'unexpected'}]) {
  const checked=setup({loadMedia:async()=>({...item,...patch})});assert.notEqual((await checked.call({Authorization:'Bearer token'})).status,200);assert.equal(checked.signed(),0);
 }
});
test('free films can play without a membership or client account',async()=>{
 const free=setup({loadMedia:async()=>({...item,access:'free'}),verifyMembership:async()=>{throw Error('must not check');}});assert.equal((await free.call()).status,200);
});
test('only approved app origins and GET requests reach playback',async()=>{
 const checked=setup();assert.equal((await checked.call({Origin:'https://evil.test'})).status,403);assert.equal((await checked.call({},'POST')).status,405);assert.equal(checked.signed(),0);
 assert.equal((await checked.call({Origin:'https://localhost'},'OPTIONS')).status,204);
});
test('store entitlement expiry is verified precisely, including lifetime purchases',()=>{
 assert.equal(membershipActive({subscriber:{entitlements:{elroi_plus:{expires_date:'2026-10-02T00:00:00Z'}}}},Date.parse('2026-10-01T00:00:00Z')),true);
 for(const payload of [null,{}, {subscriber:{entitlements:{elroi_plus:{}}}}, {subscriber:{entitlements:{elroi_plus:{expires_date:'invalid'}}}}, {subscriber:{entitlements:{elroi_plus:{expires_date:'2026-09-01T00:00:00Z'}}}}])assert.equal(membershipActive(payload,Date.parse('2026-10-01T00:00:00Z')),false);
 assert.equal(membershipActive({subscriber:{entitlements:{elroi_plus:{expires_date:null}}}}),true);
 assert.equal(membershipActive({subscriber:{entitlements:{elroi_plus:{expires_date:'2026-09-30T00:00:00Z',grace_period_expires_date:'2026-10-03T00:00:00Z'}}}},Date.parse('2026-10-01T00:00:00Z')),true);
});
test('deep links accept only public Elroi Calls routes, never outside credentials or origins',()=>{
 assert.equal(appLinkPath('https://elroicall.com/app/cinema/?book=Genesis'),'/app/cinema/?book=Genesis');
 assert.equal(appLinkPath('https://elroicall.com/auth/confirm#token_hash=abc'),'/auth/confirm#token_hash=abc');
 for(const url of ['javascript:alert(1)','https://evil.test/app/','https://elroicall.com.evil.test/app/','https://user:pass@elroicall.com/app/','https://elroicall.com:123/app/','https://elroicall.com/account-evil','http://elroicall.com/app/'])assert.equal(appLinkPath(url),null);
});
test('coming-soon catalog cards cannot become misleading play buttons',()=>{
 assert.equal(canPlayMedia({...item,youtube_id:null,status:'coming_soon'}),false);
 assert.equal(safeStoragePath(path),true);assert.equal(safeStoragePath('videos/../../private.mp4'),false);
});
