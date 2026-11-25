const fs=require('node:fs');const path=require('node:path');
const base=__dirname;const site=path.join(base,'shimarisu-site');const mo=path.join(base,'market-observer');
const {tools,articles}=require(path.join(site,'scripts/work-content.cjs'));
const paths=['/work/','/work/tools/',...articles.map(a=>`/work/${a.slug}/`)];
const routes=['shimarisu_work_home','shimarisu_work_tools',...articles.map(a=>a.route)];
const aliases=[...tools.map(t=>`tool_${t.id}`),'kaitori_email_reveal','kaitori_email_copy','work_related','work_hub','work_tools'];
const edit=(f,fn)=>fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')));
edit(path.join(mo,'00_core/project_registry.yaml'),s=>{
 const start=s.indexOf('  - project_id: "shimarisu_fudosan"'); const end=s.indexOf('\n  - project_id:',start+5);
 let p=s.slice(start,end<0?undefined:end);
 p=p.replace('    preview_host_patterns:',paths.map(p=>`        - "${p}"`).join('\n')+'\n    preview_host_patterns:');
 p=p.replace('      content_types:',routes.map(r=>`        - "${r}"`).join('\n')+'\n      content_types:');
 p=p.replace('      content_variants:', ['work_hub','work_tools','work_article'].map(r=>`        - "${r}"`).join('\n')+'\n      content_variants:');
 p=p.replace('      cta_ids:',['work_hub','work_tools','work_article'].map(r=>`        - "${r}"`).join('\n')+'\n      cta_ids:');
 p=p.replace('      cta_groups:',aliases.map(r=>`        - "${r}"`).join('\n')+'\n      cta_groups:');
 p=p.replace('      share_targets:','        - "work"\n      share_targets:');
 return s.slice(0,start)+p+(end<0?'':s.slice(end));
});
edit(path.join(mo,'00_core/lite_project_registry.yaml'),s=>s.replace('    ga4_source: shimarisu_ga4',paths.map(p=>`      - "${p}"`).join('\n')+'\n    ga4_source: shimarisu_ga4'));
edit(path.join(mo,'00_core/tracker_targets.yaml'),s=>{
 const pos=s.indexOf('  shimarisu_site:');const next=s.indexOf('\n  ',pos+3); // insert in existing site_files, preserving other targets
 const target=s.slice(pos); const insert=target.indexOf('      - public/_headers');
 const files=['public/css/work.css','public/js/kaitori-email.js',...paths.map(p=>'public'+p+'index.html')];
 return s.slice(0,pos+insert)+files.map(f=>'      - '+f).join('\n')+'\n'+s.slice(pos+insert);
});
edit(path.join(site,'public/_headers'),s=>s+'\n'+paths.map(p=>`${p}\n  Cache-Control: no-transform`).join('\n')+'\n');
edit(path.join(site,'public/index.html'),s=>s.replace('</main>',`<section class="section"><div class="wrap"><h2 class="section-title">不動産会社のための実務ノート</h2><p>書類、PDF、日付、工程、毎日のパソコン仕事。いま止まっている作業から、一つずつ。</p><p><a href="/work/" data-market-cta-id="work_hub" data-market-cta-group="work">実務ノートを読む</a></p></div></section>\n</main>`));
edit(path.join(site,'public/dake.html'),s=>s.replace('</main>',`<section class="section"><div class="wrap"><h2 class="section-title">不動産の仕事で使う</h2><p><a href="/work/tools/" data-market-cta-id="work_tools" data-market-cta-group="work">実際の不動産仕事で使っている道具を見る</a></p><p><a href="/work/" data-market-cta-id="work_hub" data-market-cta-group="work">困りごとから実務ノートを読む</a></p></div></section>\n</main>`));
edit(path.join(site,'scripts/test-market-observer-integration.js'),s=>s.replace('const read =',`htmlFiles.push('work/index.html','work/tools/index.html',...require('./work-content.cjs').articles.map(a=>'work/'+a.slug+'/index.html'));\n\nconst read =`).replaceAll('24 URLs','38 URLs').replaceAll('size, 24','size, 38').replaceAll('length, 24','length, 38').replaceAll('length, 17','length, 31').replace('assert.deepEqual(new Set(ids), new Set(["author_profile", "personal_site", "kaitori_contact", "kaitori_footer"]));',`assert.deepEqual(new Set(ids), new Set(['author_profile','personal_site','kaitori_contact','kaitori_footer',...require('./work-content.cjs').tools.map(t=>'tool_'+t.id),'work_related','work_hub','work_tools']));`));
edit(path.join(mo,'tests_py/test_shimarisu_registry.py'),s=>s.replaceAll('), 24', '), 38').replace('self.project["aliases"]["cta_ids"],','self.project["aliases"]["cta_ids"][:4],'));
console.log('Updated canonical contracts, site entries and coverage.');
