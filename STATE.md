# しまりす不動産 State

## Current State

- ProductionはCloudflare Pages + Pages Functions、公開sourceは `public/`。
- 39 HTMLのcanonical、metadata、内部link、footer policyを既存検査で確認できる。
- `common + web + 製品固有` の新正本主義profileを適用済み。
- 新方式導入のための公開UI変更、deploy方式変更、外部設定変更は行っていない。

## Next

- 通常保守では製品固有正本と `peakheadz-standards` v1を参照し、必要な検査だけを実行する。

## Known Issues

- root直下にlegacy HTMLが残るため、Production sourceとの取り違えを継続して避ける。
- 実機表示、Cloudflare Production deploy、Turnstile実通信は今回の正本導入だけでは再検証しない。
