# Shimarisu Site

## サイト役割

`shimarisu-fudosan.com` のしまりす不動産は、中古戸建を売る人と、それを仲介する人に向けて、中古戸建を買う側がどこを見るのかを菊田幸彦の実務経験と公的資料をもとに整理する個人情報メディアです。

土地単独の売買・土地SEOは主対象にしません。道路、境界、測量、私道等は「中古戸建の売買・査定に影響する条件」として扱います。

空き家については、管理・解体・残置物撤去・リフォームの受注を目的にせず、費用を掛ける前に現況のまま中古戸建として価値を確認する順序を扱います。

しまりす不動産自体は宅地建物取引業者ではなく、サイト上で不動産取引の代理・媒介・買取査定等を受任しません。

DAKEは、不動産営業・事務・宅建士等の「実務上の詰まり」を減らす小さな道具として接続します。

## 上位思想

- 困ったときにはいる。でも追いかけてこない。
- 問題を解く。その側に菊田幸彦がいる。

## 技術構成

- 静的 HTML / CSS
- Cloudflare Pages 公開対象: `public/`
- 中古戸建カテゴリ: `public/used-house/`
- 空き家になった中古戸建: `public/vacant-house/`
- 主要ページ: `public/index.html`, `public/about.html`, `public/dake.html`, `public/contact.html`
- CSS: `public/css/style.css`
- 画像: `public/images/`
- Sitemap生成: `node scripts/generate-sitemap.js`
- Cloudflare Pages Build output directory: `public`
- Cloudflare 設定: `wrangler.toml`

## Cloudflare Pages

- Project name: `shimarisu-site`
- Custom domain: `shimarisu-fudosan.com`
- Build command: none / 空欄
- Build output directory: `public`
- Production branch: `main`

## Source of truth

Production source is `public/`. Root-level HTML is legacy and must not be edited as part of production page work.

## 編集ルール

- 法令・制度は国、法務省、国土交通省、自治体等の一次資料を優先する。
- 一般的な取引実務、菊田幸彦の実務経験、個別物件の判断を明確に分ける。
- 実務経験を法令や全国一律の運用として書かない。
- 不安を煽らず、「まず見る、分からない点を把握する、必要なら調べる、取引までに整える」の順で説明する。
- 記事から査定受付、LINE、Notion等の営業CTAへ直接誘導しない。
- 新しい公開HTMLを追加したらsitemapを再生成し、canonicalとJSON-LDを確認する。
- root直下のlegacy HTMLは触らない。
- `git add .` は使わず、目的ファイルだけstageする。

## 一次情報の運用

- 法令そのものは、e-Gov、国土交通省、法務省等の国の一次資料を優先する。
- 地域の条例、行政運用、台帳、許可・造成履歴等は、佐倉市、千葉市、守谷市、取手市、龍ケ崎市、千葉県、茨城県の公式資料を重点的に確認する。
- 自治体資料は各自治体固有の制度・運用として扱い、他地域へ無断で一般化しない。
- 将来の記事候補として「茨城県南の市街化調整区域に関する10年特例」を扱う場合は、10年の対象や各自治体の条例・審査基準の違いを分けて確認する。

## deploy手順

1. 必須ルールとこのREADMEを読む。
2. `git status` で既存変更を確認する。
3. `node scripts/generate-sitemap.js` を実行する。
4. ローカルHTTPで内部リンク、PC、390px、consoleを確認する。
5. 目的ファイルだけstageし、`git diff --cached` を確認する。
6. `main` へcommitし、`git push origin main` を実行する。
7. Cloudflare PagesのProduction deployと主要URLを確認する。

## favicon / app icon

- favicon assets: `/assets/favicon/`
- SVG, ICO, apple-touch-icon, 192px / 512px PNG, and `site.webmanifest` を配置する。
- HTML head には favicon / apple-touch-icon / manifest / theme-color を設定する。

## sitemap / robots

- 検索に出したくないページは `sitemap.xml` に入れない。
- `robots.txt` のSitemap URLは本番ドメインを指す。
- 生成コマンドは `node scripts/generate-sitemap.js`。npm build化は不要。

## DAKE_WEB_META

```json
{
  "site_key": "shimarisu-site",
  "display_name": "SHIMARISU Fudosan",
  "repo_name": "shimarisu-site",
  "domain": "shimarisu-fudosan.com",
  "cloudflare_project": "shimarisu-site",
  "site_type": "static",
  "has_functions": false,
  "has_openai_api": false,
  "health_url": "",
  "production_url": "https://shimarisu-fudosan.com",
  "status": "active",
  "category": "SHIMARISU",
  "show_on_dashboard": true
}
```
