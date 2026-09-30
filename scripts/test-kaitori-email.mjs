import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/kaitori-email.js';
import {onRequest as config} from '../functions/api/kaitori-config.js';
const origin='https://shimarisu-fudosan.com';
const env={KAITORI_EMAIL:'dummy@example.test',TURNSTILE_SECRET:'test-only'};
const req=(body,options={})=>new Request(origin+'/api/kaitori-email',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...options.headers},body:JSON.stringify(body),...options});
test('GET and all other methods never reveal email',async()=>{
 for(const method of ['GET','PUT','OPTIONS']) { const r=await onRequest({request:new Request(origin+'/api/kaitori-email',{method}),env});assert.equal(r.status,405);assert.equal(r.headers.get('Allow'),'POST');assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('X-Robots-Tag'),'noindex');assert.ok(!(await r.text()).includes(env.KAITORI_EMAIL)); }
});
test('missing, malformed, oversized token and wrong origin fail closed',async()=>{
 for(const body of [{},{token:''},{token:123},{token:'x'.repeat(2049)},null]) assert.equal((await onRequest({request:req(body),env})).status,403);
 assert.equal((await onRequest({request:req({token:'x'},{headers:{Origin:'https://evil.example','Content-Type':'application/json'}}),env})).status,403);
 assert.equal((await onRequest({request:req({token:'x'.repeat(9000)}),env})).status,403);
});
test('Siteverify success requires exact hostname/action; invalid and replay tokens are rejected',async(t)=>{
 for(const result of [{success:false},{success:true,hostname:'evil.example',action:'kaitori_email'},{success:true,hostname:'shimarisu-fudosan.com',action:'wrong'}]) {
  t.mock.method(globalThis,'fetch',async()=>Response.json(result));
  assert.equal((await onRequest({request:req({token:'test-token'}),env})).status,403);t.mock.restoreAll();
 }
 let calls=0;t.mock.method(globalThis,'fetch',async(url,init)=>{assert.equal(url,'https://challenges.cloudflare.com/turnstile/v0/siteverify');assert.deepEqual(JSON.parse(init.body),{secret:'test-only',response:'test-token'});return Response.json(++calls===1?{success:true,hostname:'shimarisu-fudosan.com',action:'kaitori_email'}:{success:false});});
 const r=await onRequest({request:req({token:'test-token'}),env});assert.equal(r.status,200);assert.deepEqual(await r.json(),{email:'dummy@example.test'});assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(r.headers.get('X-Robots-Tag'),'noindex');assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);
 assert.equal((await onRequest({request:req({token:'test-token'}),env})).status,403);
});
test('outage or missing configuration never exposes email',async(t)=>{
 assert.equal((await onRequest({request:req({token:'test-token'}),env:{}})).status,503);
 t.mock.method(globalThis,'fetch',async()=>{throw new Error('unavailable');});
 assert.equal((await onRequest({request:req({token:'test-token'}),env})).status,503);
 const r=config({request:new Request(origin+'/api/kaitori-config'),env:{...env,TURNSTILE_SITE_KEY:'public-sitekey'}});assert.deepEqual(await r.json(),{sitekey:'public-sitekey'});
});
