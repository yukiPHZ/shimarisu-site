const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/yukiz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../public');const output=path.resolve(__dirname,'../test-results');fs.mkdirSync(output,{recursive:true});
const {articles}=require('./work-content.cjs');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json','.webmanifest':'application/manifest+json'};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const evidence={viewports:[],privacy:[],email:[],consoleErrors:[]};
 try {
  async function setup(state='denied',failure=false) {
   const context=await browser.newContext({viewport:{width:390,height:844}});const analytics=[];
   await context.addInitScript(({state,failure})=>{
    if(state!=='unknown')localStorage.setItem('market_observer_analytics_consent',state==='gpc'?'granted':state);
    if(state==='gpc')Object.defineProperty(navigator,'globalPrivacyControl',{value:true});
    window.__clipboard=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{if(failure)throw new Error('denied');window.__clipboard.push(value);}}});
   },{state,failure});
   await context.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(/google-analytics|googletagmanager/.test(u.hostname)){analytics.push(u.hostname);return route.fulfill({status:200,contentType:'text/javascript',body:''});}
    if(u.hostname==='challenges.cloudflare.com')return route.fulfill({status:200,contentType:'text/javascript',body:'window.turnstile={render:(el,opts)=>{window.__turnstileOptions=opts;setTimeout(()=>window.__turnstileFail?opts["error-callback"]():opts.callback("dummy-token"),0);return "widget";},remove:()=>{}};'});
    if(u.pathname==='/api/kaitori-config')return route.fulfill({json:{sitekey:'public-test-key'}});
    if(u.pathname==='/api/kaitori-email')return route.fulfill({json:{email:'dummy@example.test'},headers:{'Cache-Control':'no-store'}});
    if(u.hostname!=='shimarisu-fudosan.com')return route.fulfill({status:200,body:''});
    let file=path.join(root,decodeURIComponent(u.pathname));if(u.pathname.endsWith('/'))file=path.join(file,'index.html');else if(!path.extname(file))file+='.html';
    if(!file.startsWith(root)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
    return route.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'application/octet-stream'});
   });
   const page=await context.newPage();page.on('pageerror',err=>evidence.consoleErrors.push(err.message));page.on('console',m=>{if(m.type()==='error')evidence.consoleErrors.push(m.text());});
   return {context,page,analytics};
  }
  const layout=await setup();
  const routes=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
  for(const width of [320,375,390,430,1440]) {
   await layout.page.setViewportSize({width,height:900});
   for(const route of routes){await layout.page.goto('https://shimarisu-fudosan.com'+route);assert.equal(await layout.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${route}`);assert.equal(await layout.page.locator('.analytics-privacy-actions .market-observer-consent-change').count(),1);assert.equal(await layout.page.locator('footer > .market-observer-consent-change').count(),0);}
   evidence.viewports.push({width,routes:routes.length,overflow:false});
  }
  await layout.page.setViewportSize({width:390,height:844});await layout.page.goto('https://shimarisu-fudosan.com/work/');await layout.page.screenshot({path:path.join(output,'work-mobile.png'),fullPage:true});
  await layout.page.setViewportSize({width:1440,height:1000});await layout.page.goto('https://shimarisu-fudosan.com/work/contract-pdf-workflow/');await layout.page.screenshot({path:path.join(output,'flagship-desktop.png'),fullPage:true});
  await layout.page.evaluate(()=>document.documentElement.style.zoom='2');assert.equal(await layout.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'200% layout zoom');evidence.viewports.push({width:1440,cssZoom:'200%',overflow:false});
  await layout.page.evaluate(()=>document.documentElement.style.zoom='');await layout.page.keyboard.press('Tab');assert.equal(await layout.page.locator('.work-skip').evaluate(el=>el===document.activeElement),true);assert.notEqual(await layout.page.locator('.work-skip').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await layout.page.locator('.analytics-privacy summary').click();await layout.page.locator('.market-observer-consent-change').click();assert.equal(await layout.page.locator('#market-observer-consent-banner').count(),1);await layout.page.keyboard.press('Escape');assert.equal(await layout.page.locator('.market-observer-consent-change').evaluate(el=>el===document.activeElement),true);evidence.privacy.push({settings:'inside policy disclosure on all 38 pages',keyboard:'open, close and focus return PASS'});
  await layout.context.close();
  for(const state of ['unknown','denied','gpc','granted']){
   const {context,page,analytics}=await setup(state);
   await page.goto('https://shimarisu-fudosan.com/work/pdf-too-large/?private_query=canary#private_hash');
   assert.equal(await page.locator('script[src*="challenges.cloudflare.com"]').count(),0,'lazy Turnstile');
   await page.locator('[data-email-reveal]').click();await page.locator('[data-email-result]').waitFor({state:'visible'});
   await page.locator('[data-email-copy]').click();assert.equal(await page.locator('[data-email-status]').textContent(),'メールアドレスをコピーしました。');
   assert.deepEqual(await page.evaluate(()=>window.__clipboard),['dummy@example.test']);
   if(state!=='granted')assert.equal(analytics.length,0,state);
   const data=await page.evaluate(()=>JSON.stringify(window.dataLayer||[]));assert.ok(!/dummy@example|dummy-token|private_query|private_hash|canary/.test(data));
   if(state==='granted'){assert.ok(data.includes('kaitori_email_reveal'));assert.ok(data.includes('kaitori_email_copy'));}
   evidence.privacy.push({state,analyticsRequests:analytics.length,emailWorks:true});await context.close();
  }
  const fallback=await setup('denied',true);await fallback.page.goto('https://shimarisu-fudosan.com/work/');
  await fallback.page.locator('[data-email-reveal]').click();await fallback.page.locator('[data-email-result]').waitFor({state:'visible'});await fallback.page.locator('[data-email-copy]').click();
  assert.equal(await fallback.page.locator('[data-email-status]').textContent(),'選択してコピーしてください。');assert.equal(await fallback.page.locator('[data-email-field]').evaluate(el=>el.readOnly&&el.selectionEnd===el.value.length),true);evidence.email.push('clipboard fallback selects readonly field');await fallback.context.close();
  const retry=await setup();await retry.page.goto('https://shimarisu-fudosan.com/work/');await retry.page.evaluate(()=>window.__turnstileFail=true);await retry.page.locator('[data-email-reveal]').click();await retry.page.getByText('確認できませんでした。通信環境を確かめて、もう一度お試しください。').waitFor();assert.equal(await retry.page.locator('[data-email-reveal]').isEnabled(),true);await retry.page.evaluate(()=>window.__turnstileFail=false);await retry.page.locator('[data-email-reveal]').click();await retry.page.locator('[data-email-result]').waitFor({state:'visible'});evidence.email.push('Turnstile failure then explicit retry succeeds');await retry.context.close();
  assert.deepEqual(evidence.consoleErrors,[]);
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
