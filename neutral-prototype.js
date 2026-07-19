(() => {
  if (window.__neutralPrototypeInit) return;
  window.__neutralPrototypeInit = true;

  const STORAGE_KEY = "h8-prototype-neutral-tracked";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const app = document.getElementById("appRoot");
  const sourceDialog = document.getElementById("sourceDialog");
  const sourceButton = document.getElementById("sourceButton");
  const trackButton = document.getElementById("trackButton");
  const skipButton = document.getElementById("skipButton");
  const backButton = document.getElementById("backButton");
  const moreButton = document.getElementById("moreButton");
  let toastTimer;
  let guideOpener = null;

  const style = document.createElement("style");
  style.id = "neutral-runtime-style";
  style.textContent = `
    .neutral-toast {
      position: fixed; z-index: 2147483001; left: 50%; bottom: 78px;
      max-width: min(86vw, 320px); padding: 10px 14px;
      border: 1px solid rgba(255,255,255,.13); border-radius: 12px;
      color: #f7f7f3; background: rgba(23,26,32,.96);
      box-shadow: 0 18px 48px rgba(0,0,0,.42);
      font: 750 12px/1.4 -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif;
      text-align: center; opacity: 0; pointer-events: none;
      transform: translate(-50%, 8px); transition: opacity 160ms ease, transform 160ms ease;
    }
    .neutral-toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
    .neutral-dialog {
      width: min(calc(100% - 28px), 374px); padding: 0;
      border: 1px solid rgba(255,255,255,.12); border-radius: 20px;
      color: #f7f7f3; background: #181b20;
      box-shadow: 0 28px 80px rgba(0,0,0,.58);
      font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", sans-serif;
    }
    .neutral-dialog::backdrop { background: rgba(0,0,0,.7); backdrop-filter: blur(3px); }
    .neutral-dialog-head {
      padding: 14px 15px; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,.1);
    }
    .neutral-dialog-head strong { font-size: 15px; }
    .neutral-dialog-close {
      width: 36px; height: 36px; border: 0; border-radius: 10px;
      color: #9da3ad; background: transparent; font-size: 22px; cursor: pointer;
    }
    .neutral-dialog-body { padding: 15px; color: #c2c5cb; font-size: 12px; line-height: 1.65; }
    .neutral-dialog-actions { padding: 0 15px 15px; display: grid; gap: 8px; }
    .neutral-dialog-actions button {
      min-height: 44px; border: 1px solid rgba(255,255,255,.12); border-radius: 12px;
      color: #f7f7f3; background: #20242b; font-weight: 800; cursor: pointer;
    }
    .neutral-dialog-actions button.is-primary { border: 0; color: #111; background: #ffb22e; }
    body[data-page-theme="light"] .neutral-toast {
      border-color: #dde1e7; color: #17191d; background: rgba(255,255,255,.97);
      box-shadow: 0 18px 48px rgba(23,25,29,.16);
    }
    body[data-page-theme="light"] .neutral-dialog {
      border-color: #dde1e7; color: #17191d; background: #fff;
      box-shadow: 0 28px 80px rgba(23,25,29,.2);
    }
    body[data-page-theme="light"] .neutral-dialog::backdrop { background: rgba(23,25,29,.3); }
    body[data-page-theme="light"] .neutral-dialog-head { border-bottom-color: #dde1e7; }
    body[data-page-theme="light"] .neutral-dialog-close,
    body[data-page-theme="light"] .neutral-dialog-body { color: #686c74; }
    body[data-page-theme="light"] .neutral-dialog-actions button {
      border-color: #dde1e7; color: #17191d; background: #f6f7f9;
    }
    body[data-page-theme="light"] .neutral-dialog-actions button.is-primary { color: #fff; background: #315bd6; }
    .reels-overlay {
      position: fixed; inset: 0; z-index: 2147483000;
      transform: translateY(100%); transition: transform 440ms cubic-bezier(.23,1,.32,1);
      color: #17191d; background: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif;
    }
    .reels-overlay.is-open { transform: translateY(0); }
    .reels-scroll {
      position: absolute; inset: 0; overflow-y: auto; scroll-snap-type: y mandatory;
      -ms-overflow-style: none; scrollbar-width: none; -webkit-overflow-scrolling: touch;
    }
    .reels-scroll::-webkit-scrollbar { display: none; }
    .reel { height: 100dvh; scroll-snap-align: start; position: relative; overflow: hidden; background: #fff; }
    .reel-body {
      position: absolute; left: 20px; right: 20px; top: 50%;
      transform: translateY(-50%); text-align: center;
    }
    .reel-kicker {
      display: inline-flex; align-items: center; gap: 8px;
      color: #315bd6; font-size: 12px; font-weight: 850; letter-spacing: .08em;
    }
    .reel-kicker::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .reel-media {
      position: relative; height: 260px; margin-top: 18px; overflow: hidden;
      border: 1px solid #dde1e7; border-radius: 24px; background: #fafbfc;
    }
    .reel-media svg { display: block; width: 100%; height: 100%; }
    .reel-media text { font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif; }
    .reel-head {
      display: block; margin-top: 20px; color: #17191d;
      font-size: 28px; font-weight: 900; line-height: 1.22; letter-spacing: -.035em;
    }
    .reel--last .reel-head { margin-top: 14px; }
    .reel-desc { max-width: 340px; margin: 10px auto 0; color: #686c74; font-size: 14px; line-height: 1.55; }
    .reel-hint {
      position: absolute; left: 0; right: 0; bottom: 44px;
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      color: #858990; animation: neutralFloat 1.8s ease-in-out infinite;
    }
    .reel-hint span:first-child { font-size: 18px; }
    .reel-hint span:last-child { font-size: 12px; font-weight: 700; }
    @keyframes neutralFloat { 0%,100% { transform: translateY(0); opacity: .9; } 50% { transform: translateY(-6px); opacity: .5; } }
    .reel-money-row { display: grid; grid-template-columns: 1fr 32px 1fr; gap: 8px; margin-top: 16px; text-align: left; }
    .reel-money { padding: 11px; border: 1px solid #e3e6eb; border-radius: 13px; background: #f6f7f9; }
    .reel-money b { display: block; margin-bottom: 7px; color: #686c74; font-size: 10px; font-weight: 750; }
    .reel-money em { display: block; color: #17191d; font-size: 18px; font-style: normal; font-weight: 900; letter-spacing: -.025em; }
    .reel-money small { display: block; margin-top: 4px; color: #858990; font-size: 10px; line-height: 1.35; }
    .reel-money:first-child em { color: #315bd6; }
    .reel-vs { display: grid; place-items: center; color: #315bd6; font-size: 11px; font-weight: 900; }
    .reel-back {
      margin-top: 24px; min-height: 48px; padding: 0 22px;
      border: 1px solid #d9dde5; border-radius: 14px;
      color: #fff; background: #315bd6; font-weight: 800; cursor: pointer;
      transition: transform 150ms cubic-bezier(.23,1,.32,1);
    }
    .reel-back:active { transform: scale(.97); }
    .reels-top {
      position: absolute; z-index: 3; top: 0; left: 0; right: 0;
      padding: max(10px, env(safe-area-inset-top)) 16px 10px;
      display: flex; align-items: center; gap: 12px;
    }
    .reels-segs { flex: 1; display: flex; gap: 6px; }
    .reels-seg { flex: 1; height: 3px; border-radius: 2px; background: #dde1e7; transition: background 260ms ease; }
    .reels-seg.is-on { background: #315bd6; }
    .reels-close {
      flex: 0 0 auto; width: 34px; height: 34px; border: 0; border-radius: 999px;
      display: grid; place-items: center; color: #17191d; background: #f4f5f7;
      font-size: 18px; cursor: pointer; transition: transform 140ms cubic-bezier(.23,1,.32,1);
    }
    .reels-overlay :focus-visible { outline-color: rgba(49,91,214,.42); }
    .reels-close:active { transform: scale(.9); }
    @media (min-width: 460px) {
      .reels-overlay { width: 402px; left: 50%; transform: translateX(-50%) translateY(100%); }
      .reels-overlay.is-open { transform: translateX(-50%) translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .neutral-toast, .reels-overlay, .reel-hint { transition-duration: 1ms !important; animation-duration: 1ms !important; }
    }
  `;
  document.head.appendChild(style);

  const toast = document.createElement("div");
  toast.className = "neutral-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);

  const REEL_VISUALS = {
    chips: `<svg viewBox="0 0 344 276" aria-hidden="true">
      <rect width="344" height="276" fill="#fafbfc"/>
      <g fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">
        <text x="28" y="37">主要參與者</text><text x="245" y="37">集中區</text>
      </g>
      <g fill="#d8dbe0">
        <circle cx="42" cy="76" r="7"/><circle cx="42" cy="116" r="7"/><circle cx="42" cy="156" r="7"/><circle cx="42" cy="196" r="7"/>
        <rect x="58" y="69" width="54" height="14" rx="7"/><rect x="58" y="109" width="76" height="14" rx="7"/>
        <rect x="58" y="149" width="44" height="14" rx="7"/><rect x="58" y="189" width="66" height="14" rx="7"/>
      </g>
      <g fill="none" stroke="#c8cdd5" stroke-width="1.5">
        <path d="M116 76 C168 76 169 91 220 101"/><path d="M138 116 C177 116 179 112 220 112"/>
        <path d="M106 156 C170 156 172 142 220 129"/><path d="M128 196 C177 196 179 164 220 145"/>
      </g>
      <rect x="217" y="75" width="99" height="104" rx="18" fill="#e4eaff" stroke="#315bd6" stroke-width="1.5"/>
      <g fill="#315bd6">
        <circle cx="244" cy="104" r="8"/><circle cx="271" cy="104" r="8"/><circle cx="289" cy="124" r="8"/>
        <circle cx="244" cy="139" r="8"/><circle cx="271" cy="139" r="8"/>
      </g>
      <g fill="#8ea5ea"><circle cx="289" cy="154" r="8"/><circle cx="262" cy="158" r="8"/></g>
    </svg>`,
    price: `<svg viewBox="0 0 344 276" aria-hidden="true">
      <rect width="344" height="276" fill="#fafbfc"/>
      <text x="27" y="37" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">相對位置</text>
      <rect x="28" y="174" width="288" height="28" rx="10" fill="#e8eaee"/>
      <rect x="28" y="132" width="288" height="20" rx="9" fill="#e1e4e8"/>
      <g fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">
        <text x="44" y="192">短期參考區</text><text x="44" y="146">近期參考區</text>
      </g>
      <path d="M42 164 C83 165 99 151 128 154 C159 156 169 125 201 127 C233 129 241 91 292 91" fill="none" stroke="#a9afb9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="292" cy="91" r="15" fill="#e4eaff" stroke="#315bd6" stroke-width="2"/>
      <circle cx="292" cy="91" r="5" fill="#315bd6"/>
      <path d="M292 72 V58" stroke="#315bd6" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="248" y="36" width="88" height="24" rx="12" fill="#315bd6"/>
      <text x="292" y="52" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">目前位置</text>
    </svg>`,
    volume: `<svg viewBox="0 0 344 276" aria-hidden="true">
      <rect width="344" height="276" fill="#fafbfc"/>
      <text x="28" y="37" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">市場參與程度</text>
      <rect x="28" y="72" width="288" height="116" rx="18" fill="#f0f2f5"/>
      <path d="M28 108 H316" stroke="#b8bec7" stroke-width="1.5" stroke-dasharray="5 5"/>
      <text x="42" y="98" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">近期常態範圍</text>
      <g fill="#cdd1d8">
        <rect x="47" y="137" width="18" height="35" rx="5"/><rect x="75" y="125" width="18" height="47" rx="5"/>
        <rect x="103" y="143" width="18" height="29" rx="5"/><rect x="131" y="118" width="18" height="54" rx="5"/>
        <rect x="159" y="130" width="18" height="42" rx="5"/><rect x="187" y="122" width="18" height="50" rx="5"/>
        <rect x="215" y="141" width="18" height="31" rx="5"/>
      </g>
      <rect x="249" y="116" width="28" height="56" rx="7" fill="#315bd6"/>
      <path d="M263 108 V88" stroke="#315bd6" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="230" y="65" width="66" height="24" rx="12" fill="#315bd6"/>
      <text x="263" y="81" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">目前</text>
      <circle cx="55" cy="220" r="5" fill="#315bd6"/>
      <text x="69" y="224" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">尚未明顯超出常態範圍</text>
    </svg>`
  };

  const REELS = [
    {
      kicker: "資訊候選 A｜籌碼動向",
      head: "法人籌碼持續增加",
      desc: "主要參與者買盤延續，持股分布逐漸集中。",
      visual: "chips",
      visualLabel: "主要參與者由分散轉為集中的籌碼資料骨架",
      hint: "上滑看價格確認"
    },
    {
      kicker: "資訊候選 B｜價格位置",
      head: "價格位於短期參考區上方",
      desc: "價格維持在近期區間偏上位置，暫未回到整理區。",
      visual: "price",
      visualLabel: "價格位置與兩段短期參考區的資料骨架",
      hint: "上滑看量能確認"
    },
    {
      kicker: "資訊候選 C｜量能確認",
      head: "成交量尚未明顯擴大",
      desc: "價格已有反應，但市場參與程度仍接近近期常態。",
      visual: "volume",
      visualLabel: "目前市場參與程度與近期常態範圍的資料骨架",
      money: true,
      hint: "上滑看下一步"
    },
    {
      kicker: "04 · 下一步",
      head: "決定追蹤或先略過",
      desc: "回到總覽後，可保留目前的追蹤狀態，或先略過這次查看。",
      last: true
    }
  ];

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1700);
  }

  function post(type, payload = {}) {
    if (window.parent !== window) window.parent.postMessage({ type, version: "neutral", ...payload }, "*");
  }

  function wireDialog(dialog) {
    const closeButton = dialog.querySelector(".dialog-close, .neutral-dialog-close, [aria-label='關閉']");
    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function setTracked(tracked, notify = false) {
    trackButton.textContent = tracked ? "✓ 已追蹤" : "追蹤後續變化";
    trackButton.setAttribute("aria-pressed", String(tracked));
    window.sessionStorage.setItem(STORAGE_KEY, String(tracked));
    if (notify) {
      showToast(tracked ? "已追蹤後續變化" : "已取消追蹤");
      post("prototype:tracked", { tracked });
    }
  }

  function reelHTML(reel) {
    const money = reel.money
      ? `<div class="reel-money-row">
          <div class="reel-money"><b>目前參與程度</b><em>接近常態</em><small>與近期區間相近</small></div>
          <div class="reel-vs">對比</div>
          <div class="reel-money"><b>確認狀態</b><em>尚待確認</em><small>仍需後續觀察</small></div>
        </div>`
      : "";
    const back = reel.last ? '<button class="reel-back" type="button" data-close-reels>返回總覽 ›</button>' : "";
    const hint = reel.hint ? `<div class="reel-hint"><span>︿</span><span>${reel.hint}</span></div>` : "";
    const media = reel.visual
      ? `<div class="reel-media" role="img" aria-label="${reel.visualLabel}">${REEL_VISUALS[reel.visual]}</div>`
      : "";

    return `<section class="reel${reel.last ? " reel--last" : ""}" aria-label="${reel.kicker}">
      <div class="reel-body">
        <div class="reel-kicker">${reel.kicker}</div>
        ${media}
        <strong class="reel-head">${reel.head}</strong>
        <p class="reel-desc">${reel.desc}</p>
        ${money}${back}
      </div>
      ${hint}
    </section>`;
  }

  const overlay = document.createElement("div");
  overlay.className = "reels-overlay";
  overlay.id = "reelsOverlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="reels-top">
      <div class="reels-segs">${REELS.map((_, index) => `<span class="reels-seg${index === 0 ? " is-on" : ""}"></span>`).join("")}</div>
      <button class="reels-close" type="button" data-close-reels aria-label="關閉詳細導覽">✕</button>
    </div>
    <div class="reels-scroll" id="reelsScroll">${REELS.map(reelHTML).join("")}</div>
  `;
  document.body.appendChild(overlay);

  const scroller = overlay.querySelector("#reelsScroll");
  const segments = [...overlay.querySelectorAll(".reels-seg")];
  let touchStartX = 0;
  let touchStartY = 0;
  let pointerStartX = 0;
  let pointerStartY = 0;

  function guideIndex() {
    return Math.max(0, Math.min(segments.length - 1, Math.round(scroller.scrollTop / (scroller.clientHeight || 1))));
  }

  function setGuideActive(index) {
    segments.forEach((segment, segmentIndex) => segment.classList.toggle("is-on", segmentIndex <= index));
  }

  function moveGuide(index) {
    const boundedIndex = Math.max(0, Math.min(segments.length - 1, index));
    scroller.scrollTo({
      top: boundedIndex * (scroller.clientHeight || window.innerHeight),
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    setGuideActive(boundedIndex);
  }

  function openGuide(index = 0, opener = document.activeElement) {
    guideOpener = opener;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    app.inert = true;
    window.requestAnimationFrame(() => {
      scroller.scrollTop = Math.max(0, Math.min(segments.length - 1, index)) * (scroller.clientHeight || window.innerHeight);
      setGuideActive(index);
      overlay.querySelector(".reels-close").focus({ preventScroll: true });
    });
  }

  function closeGuide() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    app.inert = false;
    guideOpener?.focus({ preventScroll: true });
  }

  function handleLeftSwipe(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    if (dx >= -55 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
    const current = guideIndex();
    if (current === 0) closeGuide();
    else moveGuide(current - 1);
  }

  document.querySelectorAll("[data-open-reels]").forEach((element) => {
    const target = Number(element.dataset.reelTarget) || 0;
    element.addEventListener("click", () => openGuide(target, element));
    if (element.getAttribute("role") === "button") {
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openGuide(target, element);
        }
      });
    }
  });

  overlay.querySelectorAll("[data-close-reels]").forEach((element) => element.addEventListener("click", closeGuide));
  scroller.addEventListener("scroll", () => setGuideActive(guideIndex()), { passive: true });
  scroller.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  scroller.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    handleLeftSwipe(touchStartX, touchStartY, touch.clientX, touch.clientY);
  }, { passive: true });
  scroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  }, { passive: true });
  scroller.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch") return;
    handleLeftSwipe(pointerStartX, pointerStartY, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeGuide();
    } else if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      moveGuide(guideIndex() + 1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      moveGuide(guideIndex() - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveGuide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveGuide(segments.length - 1);
    }
  });

  sourceButton.addEventListener("click", () => sourceDialog.showModal());
  wireDialog(sourceDialog);

  const moreDialog = document.createElement("dialog");
  moreDialog.className = "neutral-dialog";
  moreDialog.innerHTML = `
    <div class="neutral-dialog-head">
      <strong>更多選項</strong>
      <button class="neutral-dialog-close" type="button" aria-label="關閉">×</button>
    </div>
    <div class="neutral-dialog-body">可查看 sample data 說明，或重設目前的追蹤狀態。</div>
    <div class="neutral-dialog-actions">
      <button type="button" data-more-action="info">查看資料說明</button>
      <button class="is-primary" type="button" data-more-action="reset">重設目前狀態</button>
    </div>
  `;
  document.body.appendChild(moreDialog);
  wireDialog(moreDialog);
  moreDialog.querySelector('[data-more-action="info"]').addEventListener("click", () => {
    moreDialog.close();
    sourceDialog.showModal();
  });
  moreDialog.querySelector('[data-more-action="reset"]').addEventListener("click", () => {
    setTracked(false);
    moreDialog.close();
    showToast("目前狀態已重設");
  });
  moreButton.addEventListener("click", () => moreDialog.showModal());

  setTracked(window.sessionStorage.getItem(STORAGE_KEY) === "true");
  trackButton.addEventListener("click", () => setTracked(trackButton.getAttribute("aria-pressed") !== "true", true));
  skipButton.addEventListener("click", () => {
    showToast("已略過這次查看");
    post("prototype:skip");
  });
  backButton.addEventListener("click", () => {
    if (window.parent !== window) post("prototype:back");
    else window.location.href = "../index.html?version=v3";
  });

  window.reelsOpen = openGuide;
  window.reelsClose = closeGuide;
})();
