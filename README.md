# Shimarisu Site

## サイト役割

`shimarisu-fudosan.com` のしまりす不動産サイト。戸建買取査定の相談、不動産実務、DAKE シリーズへの導線をまとめる。

## 世界観

大きな不動産会社の広告ではなく、菊田が直接相談を受ける小さな実務窓口。やわらかく、相談しやすく、現場の止まりを減らす。

## 技術構成

- 静的 HTML / CSS
- Cloudflare Pages 公開対象: `public/`
- 主要ページ: `public/index.html`, `public/about.html`, `public/kaitori.html`, `public/dake.html`, `public/contact.html`
- CSS: `public/css/style.css`
- 画像: `public/images/`
- Cloudflare Pages Build output directory: `public`
- Cloudflare 設定: `wrangler.toml`
- Cloudflare Pages で静的公開

## Cloudflare Pages移行メモ

- Cloudflare Pages project name: `shimarisu-site`
- Build command: none / 空欄
- Build output directory: `public`
- Production branch: `main`
- 2026-05-13時点のdeploy Failure / 522は、Cloudflare側が `public` を見ている一方でrepo側に `public/` がなかったことが主因候補。
- 今回は作業前からの未コミット変更を混ぜないため、root直下の既存ファイルは削除せず、HEAD時点の静的公開ファイルを `public/` に複製している。
- root直下の整理・削除は、既存未コミット変更を確定または退避してから別フェーズで行う。

## 触ってよい範囲

- 相談導線、プロフィール、対応内容、DAKE 紹介の文言
- `css/style.css` の表示調整
- 画像の差し替え
- README の運用ルール更新

## 触らない範囲

- 本番ドメイン `shimarisu-fudosan.com`
- 免許・所属・連絡先など正確性が必要な情報の推測変更
- 既存の未コミット変更の上書き
- GitHub remote / Cloudflare Project 設定

## deploy手順

1. 変更前にこの README を読む。
2. `git status` で既存変更を確認する。
3. 既存変更がある場合は内容を確認し、上書きしない。
4. 既存変更を混ぜないよう、対象ファイルだけ `git add` する。
5. `git push origin main`
6. Cloudflare Pages のデプロイ完了を確認する。

## 次にやること

- 連絡手段、対応エリア、査定依頼導線の正確性を確認する。
- DAKE ページのリンクと説明を `dakeapp.com` と合わせる。

## favicon / app icon

- favicon assets: `/assets/favicon/`
- SVG, ICO, apple-touch-icon, 192px / 512px PNG, and `site.webmanifest` を配置する。
- HTML head には favicon / apple-touch-icon / manifest / theme-color を設定する。
- 仮アイコンは後から差し替え可能。小サイズでの識別性と静かな空気感を優先する。
