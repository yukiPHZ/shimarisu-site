# しまりす不動産: Codex作業入口

Profile: `common + web`

最初に `AI_CONTEXT.md` を読み、判断に必要な時だけ次へ戻ります。

1. `ORIGINAL.md` — 目的、導線、ブランド、変更してはいけない核
2. `README.md` — 実装、生成元、deploy、製品固有の運用
3. `../peakheadz-standards/common/` と `../peakheadz-standards/web/` の関連仕様

## 変更範囲

- Production sourceは `public/`。root直下のlegacy HTMLを公開ページ修正で編集しません。
- 実務ノートは `scripts/work-content.cjs` と `scripts/generate-work.js` の既存生成フローを使います。
- 共通仕様と共通Pythonツールをこのrepositoryへコピーしません。
- `AI_CONTEXT.md` は自動生成物です。直接編集しません。
- Pages、Pages Functions、Turnstile、Market Observer、sitemap、redirectの既存構成を目的外に変更しません。

## 必要な検査

変更内容に応じて既存Node検査を選び、Web profileを実行します。

```powershell
python ../peakheadz-standards/tools/generate_ai_context.py .
python ../peakheadz-standards/tools/quality_check.py . --profile web
node scripts/test-work.js
node scripts/test-market-observer-integration.js
node scripts/test-kaitori-page.js
node scripts/test-kaitori-email.mjs
node scripts/test-footer-policy.js
```

新しい公開HTMLを追加・削除した時だけ、既存手順に従ってsitemapを再生成します。deployは `README.md` のCloudflare Pages手順を変えず、依頼範囲にdeployが含まれる時だけ実行します。

## 完了条件

必要な実装、関係する既存検査、Web quality check、正本更新、AI_CONTEXT再生成・stale checkがPASSしたら停止します。販売、決済、別サイト、Phase 9以降へ自動的に進みません。
