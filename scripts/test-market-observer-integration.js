const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const publicRoot = path.join(root, "public");
const htmlFiles = [
  "index.html", "about.html", "concept/index.html", "contact.html", "dake.html", "used-house/index.html",
  "used-house/appraisal-check/index.html", "used-house/boundary-marker/index.html",
  "used-house/building-confirmation-inspection/index.html", "used-house/development-history/index.html",
  "used-house/encroachment/index.html", "used-house/extension-unregistered/index.html",
  "used-house/private-road/index.html", "used-house/retaining-wall-cliff/index.html",
  "used-house/road-access/index.html", "used-house/underground-garage/index.html",
  "used-house/urbanization-control-area/index.html",
];

const read = (relativePath) => fs.readFileSync(path.join(publicRoot, relativePath), "utf8");

test("all canonical pages install consent-safe Market Observer runtime", () => {
  assert.equal(htmlFiles.length, 17);
  for (const file of htmlFiles) {
    const html = read(file);
    assert.match(html, /<body data-market-page="[a-z0-9_]+" data-market-content-type="[a-z0-9_]+">/, file);
    assert.match(html, /class="analytics-privacy"/, file);
    assert.match(html, /id="market-observer-consent-allow"/, file);
    assert.match(html, /id="market-observer-consent-deny"/, file);
    assert.match(html, /\/assets\/market-observer\/generated\/runtime-package\.js/, file);
    assert.match(html, /\/assets\/market-observer\/market-observer\.js/, file);
    assert.match(html, /\/assets\/market-observer\/consent-banner\.js/, file);
    assert.match(html, /\/js\/shimarisu-market-observer\.config\.js/, file);
    assert.match(html, /\/js\/shimarisu-observation\.js/, file);
  }
});

test("all local links and assets resolve inside public", () => {
  const missing = [];
  for (const file of htmlFiles) {
    const html = read(file);
    const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (!reference.startsWith("/") || reference.startsWith("//")) continue;
      const clean = reference.split(/[?#]/, 1)[0];
      let target;
      if (clean === "/") target = path.join(publicRoot, "index.html");
      else if (clean.endsWith("/")) target = path.join(publicRoot, clean.slice(1), "index.html");
      else {
        const direct = path.join(publicRoot, clean.slice(1));
        target = fs.existsSync(direct) ? direct : `${direct}.html`;
      }
      if (!fs.existsSync(target)) missing.push(`${file}: ${reference}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("canonical routes and sitemap stay aligned at 17 URLs", () => {
  const canonicalUrls = htmlFiles.map((file) => {
    const match = read(file).match(/<link rel="canonical" href="([^"]+)"/);
    assert.ok(match, file);
    return match[1];
  }).sort();
  const sitemapUrls = [...fs.readFileSync(path.join(publicRoot, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .sort();
  assert.equal(new Set(canonicalUrls).size, 17);
  assert.deepEqual(canonicalUrls, sitemapUrls);
});

test("only approved CTA aliases are installed", () => {
  const combined = htmlFiles.map(read).join("\n");
  const ids = [...combined.matchAll(/data-market-cta-id="([a-z0-9_]+)"/g)].map((match) => match[1]);
  assert.deepEqual(new Set(ids), new Set(["author_profile", "personal_site", "kaitori_contact", "kaitori_footer"]));
  assert.equal(ids.filter((id) => id === "author_profile").length, 11);
  assert.equal(ids.filter((id) => id === "personal_site").length, 1);
  assert.equal(ids.filter((id) => id === "kaitori_contact").length, 1);
  assert.equal(ids.filter((id) => id === "kaitori_footer").length, 17);
});

test("share integration emits only fixed success aliases", () => {
  const share = read("js/article-share.js");
  assert.match(share, /notifyShareSuccess\("os_share"\)/);
  assert.match(share, /notifyShareSuccess\("clipboard"\)/);
  assert.match(share, /error\?\.name !== "AbortError"/);
  assert.doesNotMatch(share, /MarketObserver/);
});

test("adapter does not collect raw location or visible content", () => {
  const adapter = read("js/shimarisu-observation.js");
  for (const forbidden of ["location.href", "location.search", "location.hash", "document.title", "textContent", "innerText", "navigator.clipboard"]) {
    assert.equal(adapter.includes(forbidden), false, forbidden);
  }
  assert.match(adapter, /trackPageView\(page\)/);
  assert.match(adapter, /consentState\(\) !== "granted"/);
});

function loadShare(options = {}) {
  const dispatched = [];
  const clipboardWrites = [];
  const status = { textContent: "" };
  const button = {
    listener: null,
    addEventListener(_type, listener) { this.listener = listener; },
  };
  const area = {
    querySelector(selector) {
      if (selector === "button") return button;
      if (selector === "[data-share-status]") return status;
      return null;
    },
  };
  const document = {
    title: "記事タイトル",
    body: { appendChild() {} },
    querySelectorAll() { return [area]; },
    querySelector(selector) {
      return selector === 'link[rel="canonical"]' ? { href: "https://shimarisu-fudosan.com/used-house/road-access/" } : null;
    },
    dispatchEvent(event) { dispatched.push(event); },
    createElement() { throw new Error("legacy clipboard path was not expected"); },
  };
  const navigator = {};
  if (options.share) navigator.share = options.share;
  if (options.clipboard !== false) {
    navigator.clipboard = {
      async writeText(value) { clipboardWrites.push(value); },
    };
  }
  class CustomEvent {
    constructor(type, init) { this.type = type; this.detail = init.detail; }
  }
  const context = { document, navigator, CustomEvent, console };
  vm.createContext(context);
  vm.runInContext(read("js/article-share.js"), context);
  return { button, status, dispatched, clipboardWrites };
}

test("Web Share success emits os_share without analytics dependency", async () => {
  const harness = loadShare({ share: async () => {} });
  await harness.button.listener();
  assert.equal(harness.dispatched.length, 1);
  assert.equal(harness.dispatched[0].detail.shareTarget, "os_share");
  assert.equal(harness.status.textContent, "");
});

test("share cancellation and failure do not emit share_intent", async () => {
  const cancelled = loadShare({ share: async () => { throw { name: "AbortError" }; } });
  await cancelled.button.listener();
  assert.equal(cancelled.dispatched.length, 0);
  assert.equal(cancelled.status.textContent, "");

  const failed = loadShare({ share: async () => { throw new Error("blocked"); } });
  await failed.button.listener();
  assert.equal(failed.dispatched.length, 0);
  assert.equal(failed.status.textContent, "共有できませんでした。");
});

test("clipboard fallback copies canonical URL and emits fixed alias", async () => {
  const harness = loadShare();
  await harness.button.listener();
  assert.deepEqual(harness.clipboardWrites, ["https://shimarisu-fudosan.com/used-house/road-access/"]);
  assert.equal(harness.dispatched.length, 1);
  assert.equal(harness.dispatched[0].detail.shareTarget, "clipboard");
  assert.equal(harness.status.textContent, "リンクをコピーしました。");
});

function loadAdapter(consentState) {
  const listeners = new Map();
  const calls = { init: [], pageView: [], track: [], mount: 0 };
  class Element {
    constructor(dataset = {}) { this.dataset = dataset; }
    closest(selector) { return selector === "[data-market-cta-id]" && this.dataset.marketCtaId ? this : null; }
  }
  const document = {
    body: { dataset: { marketPage: "used_house_road_access", marketContentType: "used_house_article" } },
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(listener);
    },
  };
  const tracker = {
    init(options) { calls.init.push(options); return { ok: true }; },
    trackPageView(page) { calls.pageView.push(page); },
    track(name, parameters) { calls.track.push({ name, parameters }); return { ok: true }; },
  };
  const window = {
    document,
    Element,
    crypto: { randomUUID: () => "fixed-action-token" },
    ShimarisuMarketObserverConfig: { projectId: "shimarisu_fudosan", measurementId: "G-K0J47CCCPJ" },
    MarketObserverRuntimePackage: {
      runtimeSchema: {},
      runtimeSchemaHash: "schema-hash",
      profiles: { shimarisu_fudosan: { project_id: "shimarisu_fudosan" } },
      profileHashes: { shimarisu_fudosan: "profile-hash" },
    },
    MarketObserverConsent: {
      read: () => ({ state: consentState }),
      mount: () => { calls.mount += 1; },
    },
    MarketObserver: tracker,
  };
  const context = { window, globalThis: window, Element, console, Date, Math };
  vm.createContext(context);
  vm.runInContext(read("js/shimarisu-observation.js"), context);
  return { window, Element, listeners, calls };
}

test("unknown, denied, and GPC-equivalent states do not initialize analytics", () => {
  for (const state of ["unknown", "denied"]) {
    const harness = loadAdapter(state);
    assert.equal(harness.calls.mount, 1);
    assert.equal(harness.calls.init.length, 0);
    assert.equal(harness.calls.pageView.length, 0);
  }
});

test("granted sends one page_view and only approved CTA/share actions", () => {
  const harness = loadAdapter("granted");
  assert.equal(harness.calls.init.length, 1);
  assert.equal(harness.calls.pageView.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(harness.calls.pageView[0])), {
    route_id: "used_house_road_access",
    content_type: "used_house_article",
  });

  for (const listener of harness.listeners.get("click") || []) {
    listener({ target: new harness.Element() });
    listener({ target: new harness.Element({ marketCtaId: "author_profile", marketCtaGroup: "article_author" }) });
  }
  for (const listener of harness.listeners.get("shimarisu:article-share-success") || []) {
    listener({ detail: { shareTarget: "os_share" } });
    listener({ detail: { shareTarget: "raw_target" } });
  }
  assert.deepEqual(harness.calls.track.map((call) => call.name), ["cta_click", "share_intent"]);
  assert.deepEqual(JSON.parse(JSON.stringify(harness.calls.track[0].parameters)), {
    route_id: "used_house_road_access",
    content_type: "used_house_article",
    cta_id: "author_profile",
    cta_group: "article_author",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(harness.calls.track[1].parameters)), {
    share_target: "os_share",
    content_variant: "used_house_article",
  });
});
