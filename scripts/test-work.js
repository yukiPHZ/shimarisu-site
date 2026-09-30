const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {articles,tools}=require('./work-content.cjs');const root=path.resolve(__dirname,'../public');
test('canonical HTML, sitemap, local links and styles resolve',()=>{
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const files=walk(root);const canonical=[];
 for(const file of files.filter(f=>f.endsWith('.html'))){
  const h=fs.readFileSync(file,'utf8');const c=h.match(/rel="canonical" href="([^"]+)"/);
  if(!c)continue;canonical.push(c[1]);
  for(const match of h.matchAll(/(?:href|src)="([^"]+)"/g)){
   const value=match[1];if(/^(?:https?:|mailto:|data:|tel:|#)/.test(value))continue;
   const pathname=new URL(value,c[1]).pathname;const target=path.join(root,decodeURIComponent(pathname));
   assert.ok([target,target+'.html',path.join(target,'index.html')].some(f=>fs.existsSync(f)&&fs.statSync(f).isFile()),`${path.relative(root,file)}: ${value}`);
  }
  for(const match of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
 }
 const sitemap=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.deepEqual(canonical.sort(),sitemap.sort());assert.equal(canonical.length,38);
});
test('14 work pages have unique canonical, metadata, schema and authored practical content',()=>{
 const pages=['','tools',...articles.map(a=>a.slug)];const canonical=new Set();
 for(const slug of pages){const h=fs.readFileSync(path.join(root,'work',slug,'index.html'),'utf8');const url=h.match(/rel="canonical" href="([^"]+)"/)[1];assert.ok(!canonical.has(url));canonical.add(url);
  assert.match(h,/<meta name="description" content="[^"]+"/);assert.match(h,/<meta property="og:image"/);
  const graph=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];assert.ok(graph.some(x=>x['@type']==='BreadcrumbList'));assert.equal(graph[0].author['@id'],'https://shimarisu-fudosan.com/about#person');
  assert.equal((h.match(/data-kaitori-contact/g)||[]).length,1);assert.doesNotMatch(h,/mailto:|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
 }
 for(const a of articles){assert.ok(a.manual.length>=3);assert.ok(a.check.length>=3);assert.ok(a.related.length>=2);}
 assert.equal(tools.length,11);
});
test('static email UI contains no address, secret, token logging or deprecated clipboard',()=>{
 const script=fs.readFileSync(path.join(root,'js/kaitori-email.js'),'utf8');
 assert.doesNotMatch(script,/mailto:|execCommand|console\.|localStorage|sessionStorage|atob\(|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
 assert.match(script,/navigator\.clipboard\.writeText\(field\.value\)/);
 const api=fs.readFileSync(path.join(__dirname,'../functions/api/kaitori-email.js'),'utf8');assert.doesNotMatch(api,/console\.|Access-Control-Allow-Origin/);
});
test('profile permits exactly canonical work paths and fixed event aliases',()=>{
 const p=JSON.parse(fs.readFileSync(path.join(root,'assets/market-observer/generated/shimarisu_fudosan.profile.json'),'utf8'));
 for(const route of ['shimarisu_work_home','shimarisu_work_tools',...articles.map(a=>a.route)])assert.ok(p.aliases.route_ids.includes(route),route);
 for(const alias of [...tools.map(t=>'tool_'+t.id),'kaitori_email_reveal','kaitori_email_copy'])assert.ok(p.aliases.cta_ids.includes(alias),alias);
 assert.equal(p.production_path_policy.mode,'exact');assert.equal(p.production_path_policy.values.filter(p=>p.startsWith('/work/')).length,14);
});
