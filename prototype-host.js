(() => {
  const versions = {
    v1: {
      src: "versions/version-1.2.html",
      mapping: "V1 · 一眼先懂（Stitch v0.2）",
      title: "H8 設計 V1",
      annotationTitle: "V1 元件與限制 · Review Mode",
      annotationSummary: "框外說明只供桌機 review；手機 viewport 維持原始 V1 測試內容。",
      annotations: [
        "<b>Summary／一句話判讀。</b>先呈現結論，再用卡片補充圖像與原因。",
        "<b>Visual cards／圖解導覽。</b>卡片可點擊並進入上下滑導覽；左滑、關閉或 Escape 可返回。",
        "<b>Historical image crops。</b>圖像來自既有歷史素材，因此內容、公司與數值會限制受測者聯想。",
        "<b>Footer actions。</b>追蹤狀態保留於本次瀏覽，略過提供完成回饋。",
      ],
      annotationFoot: "V1 baseline 保留不變；含真實歷史內容，只作既有候選回歸比較。",
    },
    v2: {
      src: "versions/version-1.3.html",
      mapping: "V2 · 乾淨版（Redesign v0.3）",
      title: "H8 設計 V2",
      annotationTitle: "V2 元件與限制 · Review Mode",
      annotationSummary: "框外說明只供桌機 review；手機 viewport 維持原始 V2 測試內容。",
      annotations: [
        "<b>Primary entry／導覽入口。</b>獨立入口讓受測者直接開始三段式上下滑導覽。",
        "<b>Section cards。</b>主圖、盤中、狀態與資金卡都可從對應段落開啟導覽。",
        "<b>Navigation behavior。</b>支援 scroll snap、左滑返回、關閉與 Escape。",
        "<b>Content dependency。</b>版面較簡潔，但仍依賴真實公司、價格、日期、圖表與判讀文案。",
      ],
      annotationFoot: "V2 baseline 保留不變；互動較完整，因此作為 Neutral Test 的行為參照。",
    },
    v3: {
      src: "versions/version-neutral.html",
      mapping: "V3 · Neutral Test",
      title: "H8 Neutral Test",
      annotationTitle: "V3 元件與限制 · Review Mode",
      annotationSummary: "框外說明元件用途、互動與限制；手機 viewport 只顯示可供受測者操作的中立內容。",
      annotations: [
        "<b>Main tabs。</b>即時、K 線、籌碼切換保留主要資訊分頁 affordance，不帶真實市場結果。",
        "<b>Abstract chart。</b>期間、tap／drag focus、中立 tooltip 與展開狀態都有可見回饋；幾何圖形沒有價格軸或 K 棒語意。",
        "<b>Detail cards／reels。</b>點卡片進入四段垂直 scroll snap；支援左滑、close、back、Escape 與鍵盤。",
        "<b>Actions／persistence。</b>追蹤可切換並保留於同一瀏覽 session；略過與重設都有成功回饋。",
        "<b>Known limit。</b>本候選只測互動與資訊架構，不連接資料，不驗證金融判讀或正式產品方向。",
      ],
      annotationFoot: "Neutral Test 是獨立實驗候選；不覆蓋 V1／V2，也不代表已驗證決策。",
    },
  };
  const DEFAULT_VERSION = "v1";

  // 相容舊網址參數（1.2→v1、1.3→v2）
  const LEGACY = { "1.2": "v1", "1.3": "v2", "1.1": "v1", neutral: "v3" };

  const frame = document.getElementById("prototypeFrame");
  const mapping = document.getElementById("versionMapping");
  const directLink = document.getElementById("directLink");
  const annotationTitle = document.getElementById("annotationTitle");
  const annotationSummary = document.getElementById("annotationSummary");
  const annotationList = document.getElementById("annotationList");
  const annotationFoot = document.getElementById("annotationFoot");
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
    annotationTitle.textContent = config.annotationTitle;
    annotationSummary.textContent = config.annotationSummary;
    annotationList.innerHTML = config.annotations.map((annotation) => `<li>${annotation}</li>`).join("");
    annotationFoot.textContent = config.annotationFoot;

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
    if (event.data.type === "prototype:skip") {
      showToast(event.data.version === "neutral" ? "已先略過，可稍後再查看" : "已略過這檔，回到熱門股入口");
    }
    if (event.data.type === "prototype:tracked") {
      showToast(event.data.tracked ? "已追蹤後續變化" : "已取消追蹤");
    }
  });

  const initial = normalizeVersion(new URL(window.location.href).searchParams.get("version"));
  activate(initial, false);
})();
