const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {articles}=require('./shimarisu-site/scripts/work-content.cjs');
(async()=>{
 const origin='https://work-notes.shimarisu-site.pages.dev';const checks=[];
 for(const p of ['/work/','/work/tools/',...articles.map(a=>`/work/${a.slug}/`)]){
  const r=await fetch(origin+p);const h=await r.text();assert.equal(r.status,200,p);assert.equal(r.headers.get('x-robots-tag'),'noindex');assert.ok(h.includes(`href="https://shimarisu-fudosan.com${p}"`));
  checks.push({path:p,status:r.status,noindex:true});
 }
 for(const [p,opts,status] of [
  ['/api/kaitori-email',{},405],
  ['/api/kaitori-email',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'},403],
  ['/api/kaitori-email',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({token:'invalid-test-token'})},403],
  ['/api/kaitori-config',{},503]
 ]){const r=await fetch(origin+p,opts);assert.equal(r.status,status,p);assert.equal(r.headers.get('cache-control'),'no-store');assert.match(r.headers.get('x-robots-tag'),/noindex/);checks.push({path:p,method:opts.method||'GET',status:r.status,noStore:true});}
 const r=await fetch('https://shimarisu-fudosan.com/');assert.equal(r.status,200);const h=await r.text();checks.push({productionHome:200,workLinkPublished:h.includes('href="/work/"')});
 const report={origin,checks,realTurnstile:'NOT VERIFIED: widget/secrets awaiting approval',production:'unchanged'};
 fs.writeFileSync(path.join(__dirname,'preview-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e.message);process.exit(1);});
