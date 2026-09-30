# 解析設定整理・実Turnstile検証

2026-09-30。内容・導線・文体・設計はユーザーHuman Review ACCEPT。Productionへのmain反映は、iPhone実機とdesktop実ブラウザ200%の最終確認後。

## 解析設定・プライバシー

- 全38 canonicalページを点検。フッター直下へ追加されていた「解析設定」を、同意UIの正式なsettingsContainerSelectorでポリシー欄内へ移動。生成済み共通runtimeは手編集しない。
- 閉じた状態では「解析設定・プライバシー」の静かな入口一つ。展開すると説明、現在の同意状態、解析設定リンクを表示。キーボード開閉とフォーカス復帰も確認。
- 説明を道具へのリンク、メール表示/コピーの利用有無まで更新。本文・入力・PII・メール値・token・clipboard内容を計測に含めない。GPC、選択保存、拒否しても使えること、Turnstileと解析の違い、Googleの案内リンクを記載。
- 320/375/390/430/1440pxで全38ページの横はみ出しなし。フッター外の設定リンク0、欄内の設定リンク1。Node25 PASS。unknown/denied/GPC送信0、mock clipboard fallback/Turnstile再試行PASS、console error0。
- Market Observer正本47585cfを維持して正式exportを再実行し、38ページとCSS/adapterのchecksumを更新。

## Cloudflare設定

- ユーザーの明示承認後、公式Wrangler4.144.0でProductionとPreviewに別Managed widgetを作成。hostnameはそれぞれshimarisu-fudosan.comとwork-notes.shimarisu-site.pages.devだけ。clearanceはno_clearance、client appearanceはinteraction-only。
- 各環境へKAITORI_EMAILとTURNSTILE_SECRETを暗号化Secretとして設定。公式listで名前/型を確認。値はGit・static・ログ・本書へ記録しない。
- 公開Varsはwrangler.tomlの[vars]と[env.preview.vars]に別sitekey/originを明記。Preview deployでPreview Varsの実反映を確認。
- **Production Varsは正本に設定済み、Cloudflare Productionへの反映は最終Gate後のProduction deploy時。** 公式download configで現時点のProduction Vars未反映を確認した。設定のために本番deployを先行しない。Dashboardは未ログインで、本番の画面操作は行っていない。
- APIは引き続きPOSTのみ、Siteverify success/hostname/action検証、同一origin、no-store/noindex。メールをstaticへ戻す変更なし。

## 実Preview確認

https://work-notes.shimarisu-site.pages.dev/work/

- 初回設定deployment: https://687c104e.shimarisu-site.pages.dev
- 解析を拒否 → 表示ボタン → 実Managed Turnstile自動通過 → 実メールreadonly表示を確認。人間向けchallengeの代行やtest sitekeyは使用していない。
- コピー操作後「メールアドレスをコピーしました。」を表示。Clipboard APIの成功経路を確認。
- **OS/実メーラー貼り付けの独立検証は未完了。** 検証用ブラウザのclipboard読取APIが空文字を返したため、実コピー内容との一致をPASS扱いしない。メール値は出力せず、実機貼り付けを人間の最終確認へ残す。
- reload後の新しい実認証でも表示成功。
- 実API: config200（Preview key一致）、GET405、tokenなし403、不正token403、異なるorigin403。全応答no-store/noindex。
- 障害後のUI再試行とClipboard失敗時の選択fallbackはmock browserでPASS。実サービスを壊して障害を発生させる試験は行わない。

## 最終Production Gate

1. iPhone実機: 表示、コピー、普段のメーラーへ貼り付け、必要時の再試行。
2. desktop実ブラウザ200%: 本文・header・CTA・解析設定の表示とキーボード操作。
3. 結果をこの会話へ報告し、最終確認が通ってからmain反映/Production deploy。

Production・関連DAKE backlink公開・Publisher live送信は未実行。Publisherの計画は元指示の順序を維持。
