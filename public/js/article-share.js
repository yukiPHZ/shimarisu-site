(() => {
  const shareAreas = document.querySelectorAll("[data-article-share]");

  const copyCanonicalUrl = async (url) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
      throw new Error("Clipboard copy failed");
    }
  };

  shareAreas.forEach((area) => {
    const button = area.querySelector("button");
    const status = area.querySelector("[data-share-status]");
    const canonical = document.querySelector('link[rel="canonical"]')?.href;

    if (!button || !status || !canonical) {
      return;
    }

    button.addEventListener("click", async () => {
      status.textContent = "";

      try {
        if (navigator.share) {
          await navigator.share({
            title: document.title,
            text: document.title,
            url: canonical,
          });
          return;
        }

        await copyCanonicalUrl(canonical);
        status.textContent = "リンクをコピーしました。";
      } catch (error) {
        if (error?.name !== "AbortError") {
          status.textContent = "共有できませんでした。";
        }
      }
    });
  });
})();
