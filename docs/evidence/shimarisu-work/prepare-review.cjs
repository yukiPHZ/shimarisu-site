const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'shimarisu-site');const {tools,articles}=require(path.join(root,'scripts/work-content.cjs'));
const pages=[['不動産の仕事を、ひとつずつ軽く。','/work/'],['不動産の仕事で、実際に使っている道具','/work/tools/'],...articles.map(a=>[a.title,`/work/${a.slug}/`])];
const report=`# 実務ノート — Human Review候補

確認日: 2026-09-30。Production未公開。ユーザー指定のHuman Review通過前にmainへpushしない。

## 作成ページ（14件）

| title（末尾に「｜しまりす不動産」） | canonical |
| --- | --- |
${pages.map(([title,p])=>`| ${title} | https://shimarisu-fudosan.com${p} |`).join('\n')}

各記事は具体的な場面、先に結論、整理事項、手元の道具での手順、DAKE利用、使用後確認、注意、関連記事、業務用メール案内を持つ。DAKEを使わなくても作業が進む手順を先に置く。

## 代表サービスの確認（11件）

| 正式表示名 | 公開version | 公式URL | 実行環境 |
| --- | --- | --- | --- |
${tools.map(t=>`| ${t.name} | ${t.version?'v'+t.version:'公開番号を記載しない'} | ${t.url} | ${t.platform} |`).join('\n')}

- 全公式URLのHTTP 200を確認。README / ORIGINAL / 配布ページ / Releaseに従い、価格は掲載しない。保存・入力・できないことはtoolsページの各詳細欄へ記載。
- DakePDF圧縮は作業中に正式v1.1.0が出荷された。最新main README/ORIGINAL、GitHub Release（2026-09-30 10:50:10 UTC）、dakeapp.com ProductionでAdaptive Compression公開を確認し反映。Release: https://github.com/yukiPHZ/dake-series/releases/tag/DAKE_PDF_Compress_v1.1.0 。未公開の将来機能は含めない。
- DakeSendは送信に招待またはGuest Passが必要、受信登録不要、7日保管。上限は現行公開ページに合わせて記事へ記載。ファイルをサービス側へ預ける方式と、ブラウザ内だけの道具を区別。
- DAKE Typingは最新main/Productionで公開動作・教材を確認。一方ORIGINALの旧Preview記述が残るため公開versionや全面正式出荷を推測しない。記事は現在公開された一般機能の範囲。
- ブラウザごとの最低versionを正本で確認できないため、推測した対応表は作らない。

## 円環と表示

- home → /work/、/dake → /work/tools/。既存4項目headerを維持。
- /work/ → 困りごとの記事 → 使用ツール/対応する記事 → tools/hub。全記事相互リンクはしない。
- PDF系は命名、抜粋、全頁分割、結合、圧縮、共有とflagshipを必要範囲で接続。日付→連続カレンダー→工程表→日数を接続。
- authorは既存 /about#person を維持。footerへ人物プロフィールを追加しない。一般向け記事の営業CTA方針は変更せず、/work/だけ限定例外をREADMEに明記。
- 白・余白・既存の見出し/本文を踏襲。CTAは記事下の一か所。しまりす不動産が媒介・代理・査定を受任する表示にはしない。

## メール保護 / Cloudflare

- 所属・業務・業務用連絡先は既存の正本Notionをコネクターで確認（最終更新2026-08-25）。値は本書・Git・テストfixtureに記載しない。
- POST /api/kaitori-email。GET等405、tokenなし/不正403、Siteverify success/hostname/action、同一origin完全一致を検査。no-store/noindex。ログ出力、wildcard CORS、初期mailtoはない。
- 表示操作後だけManaged Turnstileを読み込む。成功後readonly欄とコピー。Clipboard失敗は欄を選択し「選択してコピーしてください」。メールの平文/static JS、base64、文字列分割、data属性、JSON-LDへの格納なし。
- Secret名: KAITORI_EMAIL / TURNSTILE_SECRET。公開設定: TURNSTILE_SITE_KEY / KAITORI_ORIGIN。値は禁止。
- Production許可origin: https://shimarisu-fudosan.com 。Previewは https://work-notes.shimarisu-site.pages.dev と専用widgetを使う。
- widget作成/Secrets設定は自動承認レビューが明示承認を要求したため未実行。未設定時は503で停止し、弱い静的公開へ切替えない。実Turnstileの成功経路はNOT VERIFIED。
- Pages project/domain/mainは維持。public/がbuild output。functions/apiの2routeのみFunctions対象。公式WranglerによるFunctions build PASS。

## Market Observer

- 正本commit: 47585cf（market-observer）。project shimarisu_fudosanを維持。
- project_registry / lite_project_registry / tracker_targetsを変更。14 routes、3 content types/variants、11 tool aliases、email reveal/copy、関連導線aliasを追加。
- build_runtime_bundle → export_tracker_package（source commit指定）→ checkの正式経路。生成profile手編集なし。
- 同意前/拒否/GPCは送信0。メール機能は解析同意に依存しない。成功した表示/コピーのみ固定cta_click aliasで観測。
- 既存のauthor_profile・share_intentを維持。メール、token、clipboard、住所、入力、ファイル、記事本文/title、raw URL/query/hashは送らない。既存契約のsanitize済みcanonical locationのみ維持。
- Lite週報の既存scopeへ追加。別dashboard/DBなし。email copyを査定成立と解釈しない。実案件の属性やPIIは人間側の観測。

## 検証結果

- canonical全38、sitemap一致、内部リンク/asset/CSS参照、JSON-LD parse、既存author identity、footer方針、approved aliases: PASS。
- shimarisu Node tests: 25 PASS（Function405/403、Siteverify mock成功、hostname/action不一致、no-store、障害時停止を含む）。fixtureはdummy@example.test。
- Chrome自動確認: home/dake/work14の16routeを320/375/390/430/1440px、横はみ出しなし。desktop flagshipの200% CSS zoom相当を確認。キーボード本文スキップ・focus表示PASS。
- unknown/denied/GPC送信0、同意ありの固定alias、clipboard成功/失敗fallback、Turnstile失敗後再試行をmockで確認。console error 0。実メールをanalyticsへ送らない。
- Market Observer: JS 209 PASS、Python 183 PASS、正式export/check PASS。
- DAKE製品サイト17 PASS、Tools360 PASS、Typing33 PASS・generate/check PASS。DakeSendのsecret scanとtracker生成物check PASS。backlink以外のサービス機能は変更なし。
- robots.txtは維持。sitemap生成はcanonicalを検証し、robotsを上書きしない。
- Search Consoleのsitemap取得・新route discovery: NOT VERIFIED（本作業では認証済みSearch Console実行環境を確認していない）。Previewは検索公開対象ではない。

## DAKE相互リンク（公開待ち）

- dakeapp-site: 結合/Select/One/圧縮/俯瞰名前変更/工程表の6製品本文へ各1本。
- dake-tools-site: 日数/築年数/スクロールカレンダー本文へ各1本。生成対象カレンダーはgeneratorも更新。
- dake-send-site: トップ本文へlarge-files-sendを1本。
- dake-typing-site: 不動産向け /real-estate/ の関連ガイドへ1本。正本data/serp-hubs.jsonから生成。その他生成HTMLの差分は同一assetのcache hash更新で、機能コード変更なし。
- 各repo独立commit。リンク先のしまりすProduction公開後に公開する。DAKE_series既存未コミット作業は変更しない。

## Publisher（順序待ち）

- ユーザー指定どおりWeb ProductionとObserver完了後に作成するため、13週間campaignはまだ作成/予約しない。
- 正式account mappingはshimarisu-fudosan-instagram / shimarisu-fudosan-threads、Buffer adapter、@kikuta.shimarisu_fudosanを確認。
- 既存Q4 campaignとBuffer draftが存在するため、重複させず既存計画と照合してfixed75%/replaceable25%へ組み込む。既存guardは解除しない。live送信NO。

## 必須Human Review

1. /work/、/work/tools/、contract-pdf-workflow。
2. PDF記事、contract-settlement-days、real-estate-typing。
3. 戸建査定CTAの所属/文体/相談範囲。
4. 設定承認後、実Turnstile → 表示 → コピー。
5. iPhone実機とdesktop（実ブラウザ200%拡大含む）。

営業臭さ、SEOサイト化、DAKEカタログ化を感じる場合はProductionへ進めない。Human Review未完了。Production Success/主要URL/実Function確認は未実施。
`;
fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.writeFileSync(path.join(root,'docs/WORK_RELEASE_REVIEW.md'),report);
