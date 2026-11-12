(() => {
  "use strict";

  const page = document.body;
  if (!page || page.dataset.marketPage !== "shimarisu_kaitori") return;

  const appId = new URLSearchParams(window.location.search).get("app") || "";
  if (/^[a-z0-9_]{3,80}$/.test(appId)) page.dataset.marketSourceApp = appId;
})();
