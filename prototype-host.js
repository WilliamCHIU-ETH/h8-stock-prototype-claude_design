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
      annotationFoot: "V2 baseline 保留不變；本輪是 Simple IA Test 唯一的 layout source of truth 與行為參照。",
    },
    v3: {
      src: "versions/version-neutral.html",
      mapping: "V3 · Simple IA Test",
      title: "H8 Simple IA Test",
      annotationTitle: "V3 元件與限制 · Review Mode",
      annotationSummary: "V2 layout-preserving fictional scenario：框外說明測試邊界；手機 viewport 以虛構股票 A 呈現可理解的 sample content。",
      annotations: [
        "<b>V2 component parity。</b>沿用相同 topbar、摘要、判讀、導覽入口、卡片順序、雙欄區、比較卡與 footer；不增加頁面級元件。",
        "<b>Summary／evidence split。</b>首頁壓縮為多方轉強與三個訊號；滑動頁才展開籌碼、價格與量能的 sample evidence。",
        "<b>Fictional sample data。</b>股票 A、52.4、外資連買 3 日與量能 1.1 倍均為示意資料，不對應真實標的或投資建議。",
        "<b>Cards／reels。</b>既有入口與卡片可進入四段垂直 scroll snap；支援左滑、close、back、Escape 與鍵盤。",
        "<b>Actions／persistence。</b>追蹤可切換並保留於同一瀏覽 session；略過與重設都有成功回饋。",
        "<b>Known limit。</b>第四段與追蹤／略過行為維持凍結；目前灰階加 amber 色票不是最終決策，也不驗證金融內容或正式產品方向。",
      ],
      annotationFoot: "Simple IA Test 是 V2 layout-preserving 的獨立實驗候選；不覆蓋 V1／V2，也不代表已驗證決策。",
    },
    v4: {
      src: "versions/version-neutral-light.html",
      mapping: "V4 · Lite Demo",
      title: "H8 亮白語意 Demo",
      annotationTitle: "V4 元件與限制 · Review Mode",
      annotationSummary: "保留 V3 作為現況；V4 只驗證亮白視覺系統與重新整理後的首頁語意。",
      annotations: [
        "<b>Four-layer semantics。</b>首頁依序回答觀察狀態、綜合判讀、三段判讀路徑與可展開的細節入口。",
        "<b>Summary／detail separation。</b>首頁說明籌碼、價格與量能如何串接；Reel 才展開每個面向的 sample story。",
        "<b>Light visual system。</b>亮白背景、淺灰層次、黑色文字與單一藍色強調；紅綠與精確行情不作為視覺主體。",
        "<b>Interaction parity。</b>沿用 V3 的卡片入口、四段 scroll snap、指定頁開啟、Escape、關閉與返回行為。",
        "<b>Reversible candidate。</b>V4 為獨立 HTML 候選，不覆蓋 V3；可單獨保留或刪除。",
        "<b>Known limit。</b>內容仍是假設性的 sample story，第四段決策行為維持凍結，尚未進行真人驗證。",
      ],
      annotationFoot: "Lite Demo 只比較內容層級與視覺語言；不代表亮白版已成為正式產品方向。",
    },
    v5: {
      src: "versions/version-neutral-light-v5.html",
      mapping: "V5 · Contextual Card Flow Candidate",
      title: "H8 Contextual Card Flow Candidate",
      annotationTitle: "V5 流程候選 · Review Mode",
      annotationSummary: "從股票 A 的個股首頁出發，測試卡片情境入口、Card Rail、垂直閱讀與頁內決策；這不是 App 首頁或正式產品方向。",
      annotations: [
        "<b>Individual stock home／個股首頁。</b>流程起點是股票 A 的個股頁；返回總覽只代表回到這檔股票的個股首頁。",
        "<b>Contextual card entry。</b>移除上方 guided CTA；A／B／C 卡片分別 deep-link 到對應 Reel。",
        "<b>Path plus Card Rail。</b>精簡路徑先說明三個面向如何串接；同一條水平 rail 顯示一張完整卡與下一張 peek，C 卡直接標出待確認風險。",
        "<b>Gesture and keyboard parity。</b>Reel 1–3 使用垂直前後且不顯示上／下一步按鈕；支援方向鍵、Page Up/Down、Home、End 與 Escape。",
        "<b>Decision in context。</b>第四頁左滑略過、右滑加入自選股；保留可見按鈕、完成回饋與 Undo，再選擇返回個股首頁或下一支股票。",
        "<b>Known risks。</b>仍需真人驗證 Card Rail 的斜向手勢、B／C deep-link 的進度理解，以及第四頁條件式手勢是否誤觸。",
        "<b>Validation boundary。</b>保留 V4 視覺與 sample story；V5 是可測 wireframe，尚未經真人驗證。",
      ],
      annotationFoot: "V5 只驗證 UX Flow 候選；自選狀態限當次 tab，下一支股票目前只送出 placeholder event。",
    },
  };
  const DEFAULT_VERSION = "v5";

  // 相容舊網址參數（1.2→v1、1.3→v2）
  const LEGACY = { "1.2": "v1", "1.3": "v2", "1.1": "v1", neutral: "v3", light: "v4", guided: "v5", contextual: "v5" };

  const frame = document.getElementById("prototypeFrame");
  const mapping = document.getElementById("versionMapping");
  const directLink = document.getElementById("directLink");
  const annotationTitle = document.getElementById("annotationTitle");
  const annotationSummary = document.getElementById("annotationSummary");
  const annotationList = document.getElementById("annotationList");
  const annotationFoot = document.getElementById("annotationFoot");
  const versionSwitch = document.querySelector(".version-switch");
  const buttons = [...document.querySelectorAll("[data-version]")];
  const toast = document.getElementById("hostToast");
  const mobileVersionQuery = window.matchMedia("(max-width: 640px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
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

  function revealActiveVersion(activeButton, animate) {
    if (!activeButton || !mobileVersionQuery.matches) return;

    window.requestAnimationFrame(() => {
      versionSwitch.scrollTo({
        left: activeButton.offsetLeft - (versionSwitch.clientWidth - activeButton.offsetWidth) / 2,
        behavior: animate && !reducedMotionQuery.matches ? "smooth" : "auto",
      });
    });
  }

  function activate(version, updateUrl = true) {
    const normalized = normalizeVersion(version);
    const config = versions[normalized];
    let activeButton;

    buttons.forEach((button) => {
      const isActive = button.dataset.version === normalized;
      button.setAttribute("aria-pressed", String(isActive));
      if (isActive) activeButton = button;
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

    revealActiveVersion(activeButton, updateUrl);
    showToast(`已切換到 ${config.mapping}`);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => activate(button.dataset.version));
  });

  mobileVersionQuery.addEventListener("change", (event) => {
    if (!event.matches) return;
    revealActiveVersion(buttons.find((button) => button.getAttribute("aria-pressed") === "true"), false);
  });

  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    if (event.data.type === "prototype:back") {
      showToast("已回到版本切換器");
      document.querySelector('[data-version][aria-pressed="true"]')?.focus();
    }
    if (event.data.type === "prototype:skip") {
      const message = event.data.version === "v5"
        ? "已略過這次查看"
        : event.data.version === "neutral"
          ? "已先略過，可稍後再查看"
          : "已略過這檔，回到熱門股入口";
      showToast(message);
    }
    if (event.data.type === "prototype:tracked") {
      showToast(event.data.tracked ? "已加入自選股" : "已取消追蹤");
    }
    if (event.data.type === "prototype:decision-undo") {
      showToast("已復原剛才的選擇");
    }
    if (event.data.type === "prototype:next-stock") {
      showToast("已觸發下一支股票出口；V5 尚未新增第二檔 sample");
    }
  });

  const initial = normalizeVersion(new URL(window.location.href).searchParams.get("version"));
  activate(initial, false);
})();
