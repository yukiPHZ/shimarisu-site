# Shimarisu Site

## サイト役割

`shimarisu-fudosan.com` のしまりす不動産サイト。戸建買取査定の相談、不動産実務、DAKE シリーズへの導線をまとめる。

## 世界観

大きな不動産会社の広告ではなく、菊田が直接相談を受ける小さな実務窓口。やわらかく、相談しやすく、現場の止まりを減らす。

## 技術構成

- 静的 HTML / CSS
- 主要ページ: `index.html`, `about.html`, `kaitori.html`, `dake.html`, `contact.html`
- CSS: `css/style.css`
- 画像: `images/`
- Cloudflare Pages で静的公開

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
4. `git add . && git commit -m "Update shimarisu site"`
5. `git push origin main`
6. Cloudflare Pages のデプロイ完了を確認する。

## 次にやること

- 連絡手段、対応エリア、査定依頼導線の正確性を確認する。
- DAKE ページのリンクと説明を `dakeapp.com` と合わせる。
