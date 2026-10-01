import test from 'node:test';
import assert from 'node:assert/strict';
import {withAppCors} from '../functions/_shared/app-cors.ts';
import {createPortalService} from '../functions/portal/service.ts';
import {createCallAccessService} from '../functions/call-access/service.ts';
import {createContinuityService} from '../functions/continuity/service.ts';
import {createSchedulingService} from '../functions/scheduled-calls/service.ts';

const native=['capacitor://localhost','http://localhost','https://localhost'];
const env={SITE_ORIGIN:'https://elroicall.com'};
const request=(origin,method='GET')=>new Request('https://example.test/profile',{method,headers:{Origin:origin}});
test('app CORS admits only the configured website and exact native origins',async()=>{
 const handle=withAppCors(async()=>new Response('ok'));
 for(const origin of [...native,'https://elroicall.com','https://www.elroicall.com']) {
  assert.equal((await handle(request(origin))).headers.get('Access-Control-Allow-Origin'),origin);
 }
 for(const origin of ['null','https://attacker.test','https://localhost.attacker.test','capacitor://attacker.test','http://localhost:4000']) {
  assert.equal((await handle(request(origin))).headers.get('Access-Control-Allow-Origin'),null);
 }
});
test('app CORS preserves status, body, cache policy and existing Vary fields',async()=>{
 const handle=withAppCors(async()=>new Response('denied',{status:401,headers:{Vary:'Accept-Encoding','Cache-Control':'no-store'}}));
 const r=await handle(request(native[0]));
 assert.equal(r.status,401);assert.equal(await r.text(),'denied');
 assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('Vary'),'Accept-Encoding, Origin');
 assert.match(r.headers.get('Access-Control-Allow-Headers'),/authorization/);
});
for(const [name,create] of [['portal',createPortalService],['calling profile',createCallAccessService],['saved notes',createContinuityService],['schedules',createSchedulingService]]) {
 test(`${name} admits native preflight while refusing unauthenticated account reads`,async()=>{
  let fetched=0;const handle=create(env,async()=>{fetched++;throw Error('Unexpected provider request');});
  for(const origin of native) {
   const preflight=await handle(request(origin,'OPTIONS'));
   assert.equal(preflight.status,200);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);
   const guest=await handle(request(origin));
   assert.equal(guest.status,401);assert.equal(guest.headers.get('Access-Control-Allow-Origin'),origin);
  }
  assert.equal(fetched,0);
 });
}
