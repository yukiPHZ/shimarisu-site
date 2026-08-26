(function attachShimarisuMarketObserver(root) {
  "use strict";

  const config = root.ShimarisuMarketObserverConfig || {};
  const pageRoot = root.document && root.document.body;
  const runtimePackage = root.MarketObserverRuntimePackage || {};
  const profile = runtimePackage.profiles && runtimePackage.profiles[config.projectId];
  const consentStatusText = {
    granted: "アクセス解析：許可済み",
    denied: "アクセス解析：利用しない",
    unknown: "アクセス解析：未選択",
    unavailable: "アクセス解析：利用しない",
    gpc: "ブラウザのプライバシー設定により解析を無効にしています。",
  };

  function actionToken(prefix) {
    if (root.crypto && typeof root.crypto.randomUUID === "function") return root.crypto.randomUUID();
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function consentState() {
    const consent = root.MarketObserverConsent;
    return consent && typeof consent.read === "function" ? consent.read().state : "unknown";
  }

  function updateConsentStatus(consent) {
    const status = root.document && root.document.querySelector("#market-observer-consent-status");
    if (!status || typeof consent.read !== "function") return;
    const current = consent.read();
    status.textContent = current.gpc
      ? consentStatusText.gpc
      : (consentStatusText[current.state] || consentStatusText.unknown);
  }

  function mountConsent() {
    const consent = root.MarketObserverConsent;
    if (!consent || typeof consent.mount !== "function") return;
    consent.mount({
      locale: "ja",
      detailsSelector: ".analytics-privacy",
      messages: {
        heading: "匿名の利用状況の計測について",
        body: [
          "しまりす不動産では、サイトを改善するため、許可された場合だけGoogle Analyticsで匿名の利用状況を計測します。",
          "住所、URLのqueryやhash、本文、記事タイトル、共有内容、入力内容、個人情報は送信しません。",
          "許可しなくても、すべてのページをそのまま閲覧できます。",
        ],
      },
    });
    updateConsentStatus(consent);
  }

  function pageContext() {
    return {
      route_id: pageRoot.dataset.marketPage,
      content_type: pageRoot.dataset.marketContentType,
    };
  }

  function bindTrackedActions(tracker, page) {
    root.document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-market-cta-id]") : null;
      if (!target) return;
      tracker.track("cta_click", {
        ...page,
        cta_id: target.dataset.marketCtaId,
        cta_group: target.dataset.marketCtaGroup,
      }, { actionToken: actionToken("cta") });
    }, true);

    root.document.addEventListener("shimarisu:article-share-success", (event) => {
      const shareTarget = event.detail && event.detail.shareTarget;
      if (shareTarget !== "os_share" && shareTarget !== "clipboard") return;
      tracker.track("share_intent", {
        share_target: shareTarget,
        content_variant: "used_house_article",
      }, { actionToken: actionToken("share") });
    });
  }

  function start() {
    if (!pageRoot || !pageRoot.dataset.marketPage) return;
    mountConsent();
    if (consentState() !== "granted") return;
    const tracker = root.MarketObserver;
    if (!tracker || !profile || !runtimePackage.runtimeSchema) return;
    const page = pageContext();
    const result = tracker.init({
      measurementId: config.measurementId,
      runtimeSchema: runtimePackage.runtimeSchema,
      profile,
      runtimeSchemaHash: runtimePackage.runtimeSchemaHash,
      profileHash: runtimePackage.profileHashes && runtimePackage.profileHashes[config.projectId],
      pageContext: page,
    });
    if (!result.ok) return;
    tracker.trackPageView(page);
    bindTrackedActions(tracker, page);
  }

  root.ShimarisuMarketObserver = { start };
  start();
})(typeof window !== "undefined" ? window : globalThis);
