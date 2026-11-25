const fs=require('node:fs');const path=require('node:path');const base=__dirname;
const {tools}=require('./shimarisu-site/scripts/work-content.cjs');
for(const t of tools.filter(t=>t.id!=='dake_typing')) {
 const url=new URL(t.url); const repo=url.hostname==='dakeapp.com'?'dakeapp-site':url.hostname==='send.dakeapp.com'?'dake-send-site':'dake-tools-site';
 const file=path.join(base,repo,'public',url.pathname,'index.html');
 let h=fs.readFileSync(file,'utf8');
 if(!h.includes('</main>'))throw new Error(file);
 h=h.replace('</main>',`<section class="section"><div class="container wrap"><p>不動産実務での使い方：<a href="https://shimarisu-fudosan.com/work/${t.article}/">${t.scene.replace(/。$/,'')}ときの整理手順</a></p></div></section>\n</main>`);
 fs.writeFileSync(file,h);
}
// Typing pages are generated: change its route source, not only the rendered page.
const f=path.join(base,'dake-typing-site/data/serp-hubs.json');let s=fs.readFileSync(f,'utf8');
const line=s.split('\n').find(l=>l.includes('"route":"/real-estate/"'));
const obj=JSON.parse(line.trim().replace(/,$/,''));
obj.related.push(['不動産実務での使い方','https://shimarisu-fudosan.com/work/real-estate-typing/','入力で止まる箇所を分け、短く練習する手順']);
s=s.replace(line,'    '+JSON.stringify(obj)+',');fs.writeFileSync(f,s);
for(const repo of ['dakeapp-site','dake-tools-site','dake-send-site','dake-typing-site']) {
 const f=path.join(base,repo,'README.md');fs.appendFileSync(f,'\n## しまりす実務ガイド連携（Preview準備）\n\n関連する製品・ツールの本文に、不動産実務での整理手順へのリンクを各1本追加。機能、保存、認証、容量、配布条件は変更しない。しまりす `/work/` のProduction公開確認後に公開する。\n');
}
console.log('Prepared 11 contextual backlinks in four repositories.');
