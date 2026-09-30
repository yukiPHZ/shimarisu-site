const fs = require('node:fs');
const path = require('node:path');
const {tools,articles} = require('./work-content.cjs');
const root = path.resolve(__dirname,'../public');
const origin = 'https://shimarisu-fudosan.com';
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const baseline = fs.readFileSync(path.join(root,'used-house/boundary-marker/index.html'),'utf8');
const header = baseline.match(/<header><div class="wrap header-inner">[\s\S]*?<\/header>/)[0];
const footer = baseline.match(/<footer>[\s\S]*?<\/footer>/)[0];
const author = JSON.parse(baseline.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'][0].author;
const link = (url,label,id='work_related') => `<a href="${url}" data-market-cta-id="${id}" data-market-cta-group="work">${esc(label)}</a>`;
const ul = items => `<ul class="article-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const ol = items => `<ol class="work-steps">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`;
const section = (h,body) => `<section class="article-section"><h2>${esc(h)}</h2>${body}</section>`;
const toolLink = t => link(t.url,`${t.name}の詳細を見る`,`tool_${t.id}`);
const related = slugs => `<div class="related-list">${slugs.map(slug=>{const a=articles.find(a=>a.slug===slug); return link(`/work/${slug}/`,a.title);}).join('')}</div>`;
const cta = `<aside class="work-contact" aria-labelledby="kaitori-heading" data-kaitori-contact>
 <p class="section-kicker">不動産業者の方へ</p><h2 id="kaitori-heading">戸建の買取査定案件があれば、菊田にメールください。</h2>
 <p>株式会社さくら都市で戸建買取査定を担当しています。所在地と、分かる範囲の資料からで構いません。</p>
 <p class="work-small">株式会社さくら都市での業務としてのご相談です。しまりす不動産が不動産取引・査定を受任するものではありません。</p>
 <button type="button" data-email-reveal aria-controls="kaitori-result">メールアドレスを表示</button>
 <div data-turnstile-container></div><p data-email-status role="status" aria-live="polite"></p>
 <div id="kaitori-result" data-email-result hidden><label for="kaitori-address">業務用メールアドレス</label><input id="kaitori-address" type="text" readonly autocomplete="off" spellcheck="false" data-email-field><button type="button" data-email-copy>コピー</button></div>
 <p class="work-small">表示時にCloudflare Turnstileで自動アクセスを確認します。アクセス解析への同意は不要です。表示したアドレスは、ご自身のメーラーに貼り付けて使えます。</p>
 <noscript><p>メールアドレスの表示にはJavaScriptが必要です。<a href="/contact">お問い合わせ案内</a>もご覧いただけます。</p></noscript>
</aside>`;
function render({slug='',title,description,type,route,lead,body}) {
 const url=origin+`/work/${slug?slug+'/':''}`;
 const crumbs=[{name:'ホーム',item:origin+'/'},{name:'実務ノート',item:origin+'/work/'}];
 if(slug) crumbs.push({name:title,item:url});
 const schema={'@context':'https://schema.org','@graph':[
  {'@type':type==='work_article'?'Article':'CollectionPage','@id':url+(type==='work_article'?'#article':'#page'),headline:title,name:title,description,mainEntityOfPage:url,author,inLanguage:'ja'},
  {'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))}
 ]};
 const html=`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}｜しまりす不動産</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}">
<meta name="robots" content="index,follow"><meta property="og:type" content="${type==='work_article'?'article':'website'}"><meta property="og:site_name" content="しまりす不動産"><meta property="og:locale" content="ja_JP"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${origin}/images/hero-landscape.png"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/work.css"><link rel="icon" href="/assets/favicon/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#f8f6ef">
<script type="application/ld+json">${JSON.stringify(schema,null,2)}</script>
<script src="/js/article-share.js" defer></script><script src="/assets/market-observer/generated/runtime-package.js" defer></script><script src="/assets/market-observer/market-observer.js" defer></script><script src="/assets/market-observer/consent-banner.js" defer></script><script src="/js/shimarisu-market-observer.config.js" defer></script><script src="/js/shimarisu-observation.js?v=20260826-consent-ui" defer></script><script src="/js/kaitori-email.js" defer></script>
</head><body data-market-page="${route}" data-market-content-type="${type}">
<a class="work-skip" href="#main">本文へ</a>${header}
<main id="main" class="page-main"><article class="page-wrap work-page">
<nav class="breadcrumbs" aria-label="パンくず">${crumbs.map((c,i)=>i===crumbs.length-1?`<span>${esc(c.name)}</span>`:`<a href="${new URL(c.item).pathname}">${esc(c.name)}</a><span aria-hidden="true">/</span>`).join('')}</nav>
<header class="article-hero"><div class="label">不動産会社のための実務ノート</div><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></header>
${body}
<aside class="author-note author-note--portrait"><img class="author-photo" src="/images/kikuta.jpg" alt="菊田幸彦" width="64" height="64"><div><h2>執筆・確認：<a href="/about" data-market-cta-id="author_profile" data-market-cta-group="article_author">菊田幸彦</a></h2><p>不動産の実務で使っている手順と、自分で使い続けている小さな道具を紹介しています。</p></div></aside>
<section class="article-share" data-article-share aria-label="記事の共有"><span>この記事を共有</span><button type="button">共有</button><span class="article-share-status" data-share-status role="status" aria-live="polite"></span></section>
${cta}<p class="work-back">${link('/work/','実務ノートへ戻る','work_hub')} · ${link('/work/tools/','実際に使っている道具','work_tools')}</p>
</article></main>${footer}</body></html>\n`;
 const file=path.join(root,'work',slug,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);
}
for (const a of articles) {
 const t=tools.find(t=>t.id===a.tool);
 const toolBody=ol(a.use)+(t?`<p>${toolLink(t)}</p><p class="work-small">${esc(t.platform)}。${esc(t.storage)}</p>`:`<ul class="article-list">${['pdf_overview_rename','pdf_split_select','pdf_merge','pdf_compress','dake_send'].map(id=>`<li>${toolLink(tools.find(t=>t.id===id))}</li>`).join('')}</ul>`);
 render({...a,type:'work_article',lead:a.scene,body:`<section class="article-summary" aria-label="先に結論"><p>${esc(a.answer)}</p></section>`+section('先に整理すること',ul(a.organize))+section('手元の道具でも進められる手順',ol(a.manual))+section(t?`${t.name}を使う場合`:'必要なところだけ、道具を使う',toolBody)+section('使った後に確認すること',ul(a.check))+section('注意しておきたいこと',`<p>${esc(a.caution)}</p>`)+section('この作業に近い次の記事',related(a.related))});
}
const groups=['書類・PDF','資料を渡す','日付・工程','物件資料の確認','毎日のパソコン仕事'];
render({title:'不動産の仕事を、ひとつずつ軽く。',description:'不動産会社の営業・事務、宅建士、小さな会社の社長へ。書類、PDF、日付、工程、パソコン入力の困りごとを、手順と小さな道具で整理する実務ノートです。',type:'work_hub',route:'shimarisu_work_home',lead:'営業・事務の方と、小さな不動産会社の社長へ。書類、PDF、日付、工程、毎日のパソコン仕事。現場で止まりやすい作業を、手順と小さな道具で整理します。',body:`<section class="article-summary"><p>いま止まっている作業から、一つずつ。記事の手順だけでも進められます。繰り返す作業には、私が実務で使っている道具も添えました。</p></section>`+section('書類が一度に届いて、手が止まったら',related(['contract-pdf-workflow']))+groups.map(g=>section(g,related(articles.filter(a=>a.category===g).map(a=>a.slug)))).join('')+section('実際に使っている道具',`<p>菊田幸彦が不動産の仕事で使っている、六つのWindowsアプリと五つのWebサービス。</p><p>${link('/work/tools/','仕事の場面から道具を見る','work_tools')}</p>`)});
const cards=items=>items.map(t=>`<section class="work-tool" id="${t.id}"><p class="section-kicker">こんなとき：${esc(t.scene)}</p><h3>${esc(t.name)}</h3><p>${esc(t.does)}</p><p class="work-small">${esc(t.note)}</p><details><summary>利用環境・保存・できないこと</summary><p>${esc(t.platform)}${t.version?` / 公開版 v${t.version}`:''}</p><p>${esc(t.storage)}</p><p>${esc(t.cannot)}</p></details><p>${toolLink(t)}</p><p>${link(`/work/${t.article}/`,'不動産実務での手順を読む')}</p></section>`).join('');
render({slug:'tools',title:'不動産の仕事で、実際に使っている道具',description:'菊田幸彦が不動産実務で実際に使っているDAKEとWebツール11件。PDF、資料共有、工程表、日付、築年数、入力練習を、困る場面から紹介します。',type:'work_tools',route:'shimarisu_work_tools',lead:'作っただけで終わった道具ではありません。不動産の仕事で、いまも自分で使っているものを置いています。',body:`<section class="article-summary"><p>何でも一つで済ませるためではなく、いま止まっている一つの作業を進めるために。先に記事の手順を読み、必要な道具だけ選んでください。</p></section>`+section('Windowsで使うDAKE',cards(tools.slice(0,6)))+section('ブラウザで使う道具',cards(tools.slice(6)))+section('使う前に',`<p>公開仕様の確認日：2026年9月30日。配布条件や最新の対応環境は各公式ページでご確認ください。Web版に公開version番号がない場合は番号を付けていません。ブラウザの個別versionへの対応は各サイトの案内によります。</p><p>PDFの元資料は保管し、加工した資料は送付用として扱います。DakeSendはファイルをサーバーに預けるサービスです。ブラウザ内で計算する日付等の道具とは保存方針が異なります。</p>`)});
console.log('Generated 14 work pages.');
