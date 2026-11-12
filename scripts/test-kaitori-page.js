const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../public');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

test('kaitori page is the single indexed appraisal canonical with a direct mail link', () => {
  const html = read('kaitori/index.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/shimarisu-fudosan\.com\/kaitori\/">/);
  assert.match(html, /<meta name="robots" content="index,follow">/);
  assert.match(html, /株式会社さくら都市で<br>戸建の買取査定をしています。/);
  assert.match(html, /mailto:kikuta@sakuratoshi\.co\.jp\?subject=/);
  assert.match(html, />kikuta@sakuratoshi\.co\.jp<\/a>/);
  assert.match(html, /data-market-cta-id="kaitori_email_open"/);
  assert.doesNotMatch(html, /RealEstateAgent|問い合わせフォーム|電話番号/);
});

test('legacy kaitori routes redirect to the new canonical', () => {
  const redirects = read('_redirects');
  assert.match(redirects, /^\/kaitori \/kaitori\/ 301$/m);
  assert.match(redirects, /^\/kaitori\.html \/kaitori\/ 301$/m);
  assert.doesNotMatch(redirects, /^\/kaitori(?:\.html)? \/used-house\/appraisal-check\//m);
});

test('kaitori source accepts only stable lowercase app ids', () => {
  const script = read('js/kaitori-source.js');
  function run(search) {
    const body = { dataset: { marketPage: 'shimarisu_kaitori' } };
    const context = {
      document: { body },
      window: { location: { search } },
      URLSearchParams,
    };
    vm.createContext(context);
    vm.runInContext(script, context);
    return body.dataset.marketSourceApp;
  }
  assert.equal(run('?app=dake_pdf_merge'), 'dake_pdf_merge');
  assert.equal(run('?app=pdf_merge&file=secret.pdf'), 'pdf_merge');
  assert.equal(run('?app=PDF_Merge'), undefined);
  assert.equal(run('?app=../../secret'), undefined);
  assert.equal(run('?app=ab'), undefined);
});

test('kaitori privacy copy limits measurement to web flow aliases', () => {
  const html = read('kaitori/index.html');
  for (const term of ['ファイル名', 'ファイルパス', '処理内容', '使用回数', '操作履歴', '端末情報', '入力内容']) {
    assert.match(html, new RegExp(term));
  }
  const source = read('js/kaitori-source.js');
  assert.doesNotMatch(source, /localStorage|sessionStorage|fetch\(|sendBeacon|clipboard|file/i);
});
