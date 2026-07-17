(() => {
  const versions = {
    v1: {
      src: "versions/version-1.2.html",
      mapping: "V1 · 一眼先懂（Stitch v0.2）",
      title: "H8 設計 V1",
    },
    v2: {
      src: "versions/version-1.3.html",
      mapping: "V2 · 乾淨版（Redesign v0.3）",
      title: "H8 設計 V2",
    },
  };
  const DEFAULT_VERSION = "v1";

  // 相容舊網址參數（1.2→v1、1.3→v2）
  const LEGACY = { "1.2": "v1", "1.3": "v2", "1.1": "v1" };

  const frame = document.getElementById("prototypeFrame");
  const mapping = document.getElementById("versionMapping");
  const directLink = document.getElementById("directLink");
  const buttons = [...document.querySelectorAll("[data-version]")];
  const toast = document.getElementById("hostToast");
  let toastTimer;

  function normalizeVersion(value) {
    if (value && LEGACY[value]) value = LEGACY[value];
    return Object.hasOwn(versions, value) ? value : DEFAULT_VERSION;
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function activate(version, updateUrl = true) {
    const normalized = normalizeVersion(version);
    const config = versions[normalized];

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.version === normalized));
    });

    if (!frame.src.endsWith(config.src)) frame.src = config.src;
    frame.title = config.title;
    mapping.textContent = config.mapping;
    directLink.href = config.src;

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("version", normalized);
      window.history.replaceState({ version: normalized }, "", url);
    }

    showToast(`已切換到 ${config.mapping}`);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => activate(button.dataset.version));
  });

  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    if (event.data.type === "prototype:back") {
      showToast("已回到版本切換器");
      document.querySelector('[data-version][aria-pressed="true"]')?.focus();
    }
    if (event.data.type === "prototype:skip") showToast("已略過這檔，回到熱門股入口");
    if (event.data.type === "prototype:tracked") {
      showToast(event.data.tracked ? "已追蹤後續變化" : "已取消追蹤");
    }
  });

  const initial = normalizeVersion(new URL(window.location.href).searchParams.get("version"));
  activate(initial, false);
})();
