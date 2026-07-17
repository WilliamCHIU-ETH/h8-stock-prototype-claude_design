(() => {
  const runtimeScript = document.currentScript;
  const version = runtimeScript?.dataset.version || "1.1";
  const storageKey = `h8-prototype-${version}-tracked`;
  const allButtons = () => [...document.querySelectorAll("button")];
  const findButton = (text) => allButtons().find((button) => button.textContent.trim().includes(text));
  const sourceButton = document.getElementById("sourceButton") || findButton("資料說明");
  const trackButton = findButton("追蹤後續變化") || findButton("已追蹤");
  const skipButton = findButton("先略過");
  const backButton = document.querySelector('[aria-label="返回"], [aria-label="Go back"]');
  const moreButton = document.querySelector('[aria-label="更多"], [aria-label="More options"]');
  let toastTimer;

  const style = document.createElement("style");
  style.id = "h8-prototype-runtime-style";
  style.textContent = `
    .prototype-runtime-toast {
      position: fixed; z-index: 9999; left: 50%; bottom: 78px;
      max-width: min(86vw, 320px); padding: 10px 14px;
      border: 1px solid rgba(255,255,255,.13); border-radius: 12px;
      color: #f7f7f3; background: rgba(23,26,32,.96);
      box-shadow: 0 18px 48px rgba(0,0,0,.42);
      font: 750 12px/1.4 -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif;
      text-align: center; opacity: 0; pointer-events: none;
      transform: translate(-50%, 8px); transition: opacity 160ms ease, transform 160ms ease;
    }
    .prototype-runtime-toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
    .prototype-runtime-dialog {
      width: min(calc(100% - 28px), 374px); padding: 0;
      border: 1px solid rgba(255,255,255,.12); border-radius: 20px;
      color: #f7f7f3; background: #181b20;
      box-shadow: 0 28px 80px rgba(0,0,0,.58);
      font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif;
    }
    .prototype-runtime-dialog::backdrop { background: rgba(0,0,0,.7); backdrop-filter: blur(3px); }
    .prototype-runtime-head {
      padding: 14px 15px; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .prototype-runtime-head strong { font-size: 15px; }
    .prototype-runtime-close {
      width: 36px; height: 36px; border: 0; border-radius: 10px;
      color: #9da3ad; background: transparent; font-size: 22px; cursor: pointer;
    }
    .prototype-runtime-body { padding: 15px; color: #c2c5cb; font-size: 12px; line-height: 1.65; }
    .prototype-runtime-note {
      margin-top: 12px; padding: 10px; border-radius: 12px;
      color: #ffcf7a; background: rgba(255,178,46,.1);
    }
    .prototype-runtime-actions { padding: 0 15px 15px; display: grid; gap: 8px; }
    .prototype-runtime-actions button {
      min-height: 44px; border: 1px solid rgba(255,255,255,.12); border-radius: 12px;
      color: #f7f7f3; background: #20242b; font-weight: 800; cursor: pointer;
    }
    .prototype-runtime-actions button.primary { border: 0; color: #111; background: #ffb22e; }
    .prototype-tracked { filter: saturate(.78); }
    @media (prefers-reduced-motion: reduce) {
      .prototype-runtime-toast { transition-duration: 1ms; }
    }
  `;
  document.head.appendChild(style);

  const toast = document.createElement("div");
  toast.className = "prototype-runtime-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1700);
  }

  function post(type, payload = {}) {
    if (window.parent !== window) window.parent.postMessage({ type, ...payload }, "*");
  }

  function createInfoDialog() {
    const existing = document.getElementById("sourceDialog");
    if (existing) return existing;

    const note = version === "1.1"
      ? "Version 1.1 的金融圖像為 Stitch 視覺示意素材；本版用於比較視覺與互動，不用來判定金融內容正確性。"
      : "Version 1.2 沿用南亞科 2026/07/14 歷史截圖，僅作 Prototype 示範。";

    const dialog = document.createElement("dialog");
    dialog.id = "sourceDialog";
    dialog.className = "prototype-runtime-dialog";
    dialog.innerHTML = `
      <div class="prototype-runtime-head">
        <strong>資料來源與限制</strong>
        <button class="prototype-runtime-close" type="button" aria-label="關閉">×</button>
      </div>
      <div class="prototype-runtime-body">
        南亞科 2408，歷史資料互動示範。這不是即時報價，也不是投資建議。
        <div class="prototype-runtime-note">${note}</div>
      </div>
    `;
    document.body.appendChild(dialog);
    return dialog;
  }

  function wireDialog(dialog) {
    dialog.classList.add("prototype-runtime-dialog");
    const closeButton = dialog.querySelector(".dialog-close, .prototype-runtime-close, [aria-label='關閉']");
    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  const infoDialog = createInfoDialog();
  wireDialog(infoDialog);

  sourceButton?.addEventListener("click", () => {
    if (typeof infoDialog.showModal === "function") infoDialog.showModal();
    else infoDialog.setAttribute("open", "");
  });

  function setTracked(tracked, notify = false) {
    if (!trackButton) return;
    trackButton.dataset.originalLabel ||= trackButton.textContent.trim();
    trackButton.textContent = tracked ? "✓ 已追蹤" : trackButton.dataset.originalLabel;
    trackButton.setAttribute("aria-pressed", String(tracked));
    trackButton.classList.toggle("prototype-tracked", tracked);
    window.sessionStorage.setItem(storageKey, String(tracked));
    if (notify) {
      showToast(tracked ? "已追蹤後續變化" : "已取消追蹤");
      post("prototype:tracked", { tracked, version });
    }
  }

  const initialTracked = window.sessionStorage.getItem(storageKey) === "true";
  setTracked(initialTracked);
  trackButton?.addEventListener("click", () => setTracked(trackButton.getAttribute("aria-pressed") !== "true", true));

  skipButton?.addEventListener("click", () => {
    showToast("已略過這檔，回到熱門股入口");
    post("prototype:skip", { version });
  });

  backButton?.addEventListener("click", () => {
    if (window.parent !== window) {
      post("prototype:back", { version });
      return;
    }
    window.location.href = `../index.html?version=${version}`;
  });

  const moreDialog = document.createElement("dialog");
  moreDialog.className = "prototype-runtime-dialog";
  moreDialog.innerHTML = `
    <div class="prototype-runtime-head">
      <strong>Prototype 選項</strong>
      <button class="prototype-runtime-close" type="button" aria-label="關閉">×</button>
    </div>
    <div class="prototype-runtime-body">這裡只提供測試所需的最小互動。</div>
    <div class="prototype-runtime-actions">
      <button type="button" data-runtime-action="info">查看資料說明</button>
      <button class="primary" type="button" data-runtime-action="reset">重設本版狀態</button>
    </div>
  `;
  document.body.appendChild(moreDialog);
  wireDialog(moreDialog);

  moreDialog.querySelector('[data-runtime-action="info"]')?.addEventListener("click", () => {
    moreDialog.close();
    infoDialog.showModal();
  });
  moreDialog.querySelector('[data-runtime-action="reset"]')?.addEventListener("click", () => {
    setTracked(false);
    moreDialog.close();
    showToast("Prototype 狀態已重設");
  });
  moreButton?.addEventListener("click", () => moreDialog.showModal());
})();
