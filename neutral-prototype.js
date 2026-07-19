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
    .reels-overlay {
      position: fixed; inset: 0; z-index: 2147483000;
      transform: translateY(100%); transition: transform 440ms cubic-bezier(.23,1,.32,1);
      color: #f7f7f3; background: #08090c;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans TC", sans-serif;
    }
    .reels-overlay.is-open { transform: translateY(0); }
    .reels-scroll {
      position: absolute; inset: 0; overflow-y: auto; scroll-snap-type: y mandatory;
      -ms-overflow-style: none; scrollbar-width: none; -webkit-overflow-scrolling: touch;
    }
    .reels-scroll::-webkit-scrollbar { display: none; }
    .reel { height: 100dvh; scroll-snap-align: start; position: relative; overflow: hidden; background: #08090c; }
    .reel-visual {
      position: absolute; inset: 0; overflow: hidden;
      background:
        linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px),
        #11141a;
      background-size: 54px 54px;
    }
    .reel-visual::before,
    .reel-visual::after {
      content: ""; position: absolute; border-radius: 999px; transform-origin: center;
    }
    .reel-visual::before {
      width: 72%; height: 20px; left: 8%; top: 28%;
      background: linear-gradient(90deg, rgba(255,255,255,.35), rgba(255,178,46,.67));
      transform: rotate(-7deg);
    }
    .reel-visual::after {
      width: 52%; height: 16px; right: 7%; top: 41%;
      background: linear-gradient(90deg, rgba(255,255,255,.22), rgba(255,178,46,.42));
      transform: rotate(9deg);
    }
    .reel-block { position: absolute; border: 1px solid rgba(255,255,255,.14); border-radius: 14px; background: rgba(255,255,255,.07); }
    .reel-block.one { width: 64px; height: 76px; left: 16%; top: 17%; transform: rotate(11deg); }
    .reel-block.two { width: 86px; height: 52px; left: 45%; top: 11%; transform: rotate(-8deg); }
    .reel-block.three { width: 58px; height: 96px; right: 13%; top: 22%; transform: rotate(16deg); border-color: rgba(255,178,46,.27); }
    .reel-veil { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,9,12,.12), rgba(8,9,12,.24) 30%, #08090c 56%); }
    .reel-body { position: absolute; left: 20px; right: 20px; bottom: 118px; }
    .reel-kicker { color: #ffb22e; font-size: 13px; font-weight: 900; letter-spacing: .14em; }
    .reel-head { display: block; margin-top: 12px; color: #f7f7f3; font-size: 29px; font-weight: 900; line-height: 1.2; letter-spacing: -.01em; }
    .reel-desc { margin: 12px 0 0; color: #c8ccd2; font-size: 15px; line-height: 1.55; }
    .reel-hint {
      position: absolute; left: 0; right: 0; bottom: 52px;
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      color: #9da3ad; animation: neutralFloat 1.8s ease-in-out infinite;
    }
    .reel-hint span:first-child { font-size: 18px; }
    .reel-hint span:last-child { font-size: 12px; font-weight: 700; }
    @keyframes neutralFloat { 0%,100% { transform: translateY(0); opacity: .9; } 50% { transform: translateY(-6px); opacity: .5; } }
    .reel-money-row { display: grid; grid-template-columns: 1fr 30px 1fr; gap: 8px; margin-top: 18px; }
    .reel-money { padding: 11px; border-radius: 13px; background: rgba(28,32,39,.86); backdrop-filter: blur(4px); }
    .reel-money b { display: block; margin-bottom: 8px; color: #c8ccd2; font-size: 11px; font-weight: 700; }
    .reel-money em { display: block; color: #f7f7f3; font-size: 23px; font-style: normal; font-weight: 900; letter-spacing: -.03em; }
    .reel-money small { display: block; margin-top: 5px; color: #9da3ad; font-size: 10px; line-height: 1.35; }
    .reel-money:first-child em { color: #ffb22e; }
    .reel-vs { display: grid; place-items: center; color: #ffb22e; font-size: 12px; font-weight: 900; }
    .reel-back {
      margin-top: 24px; min-height: 48px; padding: 0 22px;
      border: 1px solid rgba(255,255,255,.16); border-radius: 14px;
      color: #f7f7f3; background: rgba(255,255,255,.06); font-weight: 800; cursor: pointer;
      transition: transform 150ms cubic-bezier(.23,1,.32,1);
    }
    .reel-back:active { transform: scale(.97); }
    .reels-top {
      position: absolute; z-index: 3; top: 0; left: 0; right: 0;
      padding: max(10px, env(safe-area-inset-top)) 16px 10px;
      display: flex; align-items: center; gap: 12px;
    }
    .reels-segs { flex: 1; display: flex; gap: 6px; }
    .reels-seg { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.22); transition: background 260ms ease; }
    .reels-seg.is-on { background: #ffb22e; }
    .reels-close {
      flex: 0 0 auto; width: 34px; height: 34px; border: 0; border-radius: 999px;
      display: grid; place-items: center; color: #fff; background: rgba(9,10,13,.6);
      font-size: 18px; cursor: pointer; transition: transform 140ms cubic-bezier(.23,1,.32,1);
    }
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

  const REELS = [
    {
      kicker: "01 · 目前狀態",
      head: "先查看現在的狀態",
      desc: "幾何圖形只回應操作，不對應公司、數值、日期或市場方向。",
      hint: "上滑看主要原因"
    },
    {
      kicker: "02 · 主要原因",
      head: "辨識需要留意的變化",
      desc: "保留查看理由的資訊順序，內容以中立描述取代金融判讀。",
      hint: "上滑看需要注意"
    },
    {
      kicker: "03 · 需要注意",
      head: "比較兩個相對狀態",
      desc: "只呈現狀態區塊，不提供量值、買賣方向、推薦或預測。",
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
          <div class="reel-money"><b>狀態區塊 A</b><em>—</em><small>相對狀態</small></div>
          <div class="reel-vs">與</div>
          <div class="reel-money"><b>狀態區塊 B</b><em>—</em><small>等待更多資訊再比較</small></div>
        </div>`
      : "";
    const back = reel.last ? '<button class="reel-back" type="button" data-close-reels>返回總覽 ›</button>' : "";
    const hint = reel.hint ? `<div class="reel-hint"><span>︿</span><span>${reel.hint}</span></div>` : "";

    return `<section class="reel" aria-label="${reel.kicker}">
      <div class="reel-visual" aria-hidden="true"><span class="reel-block one"></span><span class="reel-block two"></span><span class="reel-block three"></span></div>
      <div class="reel-veil"></div>
      <div class="reel-body"${reel.money ? ' style="bottom:150px"' : reel.last ? ' style="bottom:auto;top:50%;transform:translateY(-50%)"' : ""}>
        <div class="reel-kicker">${reel.kicker}</div>
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
    <div class="neutral-dialog-body">可查看資料說明，或重設目前的追蹤狀態。</div>
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
