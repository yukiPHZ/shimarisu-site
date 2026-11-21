<!--
AUTO-GENERATED FILE
DO NOT EDIT MANUALLY
Content hash: 937c12bbb6cb34df
-->

# AI Context: しまりす不動産

- Profile: `web`
- Standards version: `1.0.0-rc`

## Purpose

中古戸建を売る人と仲介する人に向けて、買う側がどこを見るのかを、菊田幸彦の実務経験と公的資料から静かに整理する個人情報メディアです。

## Audience

- 中古戸建を売る前に、確認する順序を知りたい人
- 中古戸建の売買を仲介し、調査・契約・決済の実務を整理したい人
- 空き家へ費用を掛ける前に、現況の価値と必要な確認を分けたい人

## Must Keep

- 中古戸建、空き家、実務ノートの静的な情報閲覧
- 記事ごとのcanonical、検索用metadata、一次情報との関係
- 実務ノートの生成元 `scripts/work-content.cjs` と生成処理
- Cloudflare Pages Functionsによる実務用メール表示の保護
- 同意前は解析せず、許可後も決められた識別情報だけを扱うMarket Observer連携

## Important Routes

- 一般記事は強い営業CTAへ直接つながず、まず確認・整理する情報を提供する。
- `/work/` と `/kaitori/` の戸建買取査定は株式会社さくら都市の業務として明示する。
- DAKEは実務上の詰まりを減らす小さな道具として静かにつなぐ。
- 運営者情報はAboutや記事著者欄で示し、全ページfooterへ人物プロフィール導線を増やさない。

## Important Rules

- Production sourceは `public/`。root直下のlegacy HTMLを公開ページの正本として編集しない。
- 法令、公的資料、実務経験、個別物件の判断を混同しない。
- メールアドレス、Turnstile secret、入力内容、認証情報を公開物・ログ・解析へ出さない。
- 既存のPages + Pages Functions構成を、通常の内容修正を理由に別方式へ置き換えない。
- しまりすくんの商品サイトや将来商品を、この情報メディアと混同しない。

## Current State

- ProductionはCloudflare Pages + Pages Functions、公開sourceは `public/`。
- 39 HTMLのcanonical、metadata、内部link、footer policyを既存検査で確認できる。
- `common + web + 製品固有` の新正本主義profileを適用済み。
- 新方式導入のための公開UI変更、deploy方式変更、外部設定変更は行っていない。

## Next

- Phase 6で複数Web製品にも共通化できると判明した事項だけをstandardsへ戻し、dakeappで再実証する。

## Known Issues

- root直下にlegacy HTMLが残るため、Production sourceとの取り違えを継続して避ける。
- 実機表示、Cloudflare Production deploy、Turnstile実通信は今回の正本導入だけでは再検証しない。

## Quality Check Command

```powershell
python ../peakheadz-standards/tools/quality_check.py . --profile web
```

## Source References

- `AGENTS.md`
- `ORIGINAL.md`
- `README.md`
- `STATE.md`
- `../peakheadz-standards/common/AI_WORKFLOW.md`
- `../peakheadz-standards/common/UX_WRITING.md`
- `../peakheadz-standards/common/BRANDING.md`
- `../peakheadz-standards/web/QUALITY.md`
- `../peakheadz-standards/web/UI.md`
- `../peakheadz-standards/web/FOOTER.md`
- `../peakheadz-standards/web/DEPLOY.md`
