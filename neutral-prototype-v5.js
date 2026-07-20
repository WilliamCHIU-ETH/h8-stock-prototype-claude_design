(() => {
  if (window.__neutralPrototypeV5Init) return;
  window.__neutralPrototypeV5Init = true;

  const VERSION = "v5";
  const STORAGE_KEY = "h8-prototype-v5-tracked";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const app = document.getElementById("appRoot");
  const sourceDialog = document.getElementById("sourceDialog");
  const moreButton = document.getElementById("moreButton");
  const backButton = document.getElementById("backButton");
  const rail = document.getElementById("signalRail");
  const railCards = [...rail.querySelectorAll(".signal-card")];
  const railDots = [...document.querySelectorAll(".rail-dots span")];
  let toastTimer;
  let guideOpener = null;
  let tracked = window.sessionStorage.getItem(STORAGE_KEY) === "true";
  let decision = null;
  let undoState = null;
  let activeIndex = 0;
  let lastPageEnteredAt = 0;

  const toast = document.createElement("div");
  toast.className = "v5-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1900);
  }

  function post(type, payload = {}) {
    if (window.parent !== window) {
      window.parent.postMessage({ type, version: VERSION, ...payload }, "*");
    }
  }

  function wireDialog(dialog) {
    const closeButton = dialog.querySelector(".dialog-close, [aria-label='關閉']");
    closeButton?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  wireDialog(sourceDialog);

  const moreDialog = document.createElement("dialog");
  moreDialog.className = "v5-dialog";
  moreDialog.innerHTML = `
    <div class="dialog-head">
      <strong>V5 測試選項</strong>
      <button class="dialog-close" type="button" aria-label="關閉">×</button>
    </div>
    <div class="dialog-body">V5 只測試從個股首頁的資訊卡進入判讀、完成決定，再返回或前往下一支股票的流程。</div>
    <div class="dialog-actions">
      <button type="button" data-more-action="info">查看資料說明</button>
      <button class="is-primary" type="button" data-more-action="reset">重設追蹤狀態</button>
    </div>
  `;
  document.body.appendChild(moreDialog);
  wireDialog(moreDialog);
  moreButton.addEventListener("click", () => moreDialog.showModal());
  moreDialog.querySelector('[data-more-action="info"]').addEventListener("click", () => {
    moreDialog.close();
    sourceDialog.showModal();
  });
  moreDialog.querySelector('[data-more-action="reset"]').addEventListener("click", () => {
    tracked = false;
    decision = null;
    undoState = null;
    window.sessionStorage.setItem(STORAGE_KEY, "false");
    renderDecision();
    moreDialog.close();
    showToast("追蹤狀態已重設");
  });

  backButton.addEventListener("click", () => {
    if (window.parent !== window) post("prototype:back");
    else window.location.href = "../index.html?version=v5";
  });

  function railIndex() {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    railCards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - rail.offsetLeft - rail.scrollLeft);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });
    return nearestIndex;
  }

  function updateRailDots(index = railIndex()) {
    railDots.forEach((dot, dotIndex) => dot.classList.toggle("is-on", dotIndex === index));
  }

  function moveRail(index, options = {}) {
    const boundedIndex = Math.max(0, Math.min(railCards.length - 1, index));
    rail.scrollTo({
      left: railCards[boundedIndex].offsetLeft - rail.offsetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    updateRailDots(boundedIndex);
    if (options.focus) railCards[boundedIndex].focus({ preventScroll: true });
  }

  let railScrollFrame = 0;
  rail.addEventListener("scroll", () => {
    window.cancelAnimationFrame(railScrollFrame);
    railScrollFrame = window.requestAnimationFrame(() => updateRailDots());
  }, { passive: true });
  rail.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentIndex = Number(event.target.closest(".signal-card")?.dataset.railIndex ?? railIndex());
    moveRail(currentIndex + (event.key === "ArrowRight" ? 1 : -1), { focus: true });
  });

  let railPointerId = null;
  let railStartX = 0;
  let railStartY = 0;
  let railStartScroll = 0;
  let railAxis = null;
  let suppressRailClickUntil = 0;
  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    railPointerId = event.pointerId;
    railStartX = event.clientX;
    railStartY = event.clientY;
    railStartScroll = rail.scrollLeft;
    railAxis = null;
  });
  rail.addEventListener("pointermove", (event) => {
    if (event.pointerId !== railPointerId) return;
    const dx = event.clientX - railStartX;
    const dy = event.clientY - railStartY;
    if (!railAxis && Math.hypot(dx, dy) >= 8) {
      railAxis = Math.abs(dx) >= Math.abs(dy) * 1.25 ? "x" : "y";
      if (railAxis === "x") {
        rail.classList.add("is-dragging");
        rail.setPointerCapture(event.pointerId);
      }
    }
    if (railAxis !== "x") return;
    event.preventDefault();
    rail.scrollLeft = railStartScroll - dx;
  });
  function finishRailDrag(event) {
    if (event.pointerId !== railPointerId) return;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    const shouldSnap = railAxis === "x";
    railPointerId = null;
    railAxis = null;
    rail.classList.remove("is-dragging");
    if (shouldSnap) {
      suppressRailClickUntil = Date.now() + 220;
      moveRail(railIndex());
    }
  }
  rail.addEventListener("pointerup", finishRailDrag);
  rail.addEventListener("pointercancel", finishRailDrag);

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
      <g fill="#315bd6"><circle cx="244" cy="104" r="8"/><circle cx="271" cy="104" r="8"/><circle cx="289" cy="124" r="8"/><circle cx="244" cy="139" r="8"/><circle cx="271" cy="139" r="8"/></g>
      <g fill="#8ea5ea"><circle cx="289" cy="154" r="8"/><circle cx="262" cy="158" r="8"/></g>
    </svg>`,
    price: `<svg viewBox="0 0 344 276" aria-hidden="true">
      <rect width="344" height="276" fill="#fafbfc"/>
      <text x="27" y="37" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">相對位置</text>
      <rect x="28" y="174" width="288" height="28" rx="10" fill="#e8eaee"/><rect x="28" y="132" width="288" height="20" rx="9" fill="#e1e4e8"/>
      <g fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em"><text x="44" y="192">短期參考區</text><text x="44" y="146">近期參考區</text></g>
      <path d="M42 164 C83 165 99 151 128 154 C159 156 169 125 201 127 C233 129 241 91 292 91" fill="none" stroke="#a9afb9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="292" cy="91" r="15" fill="#e4eaff" stroke="#315bd6" stroke-width="2"/><circle cx="292" cy="91" r="5" fill="#315bd6"/>
      <path d="M292 72 V58" stroke="#315bd6" stroke-width="1.5" stroke-linecap="round"/><rect x="248" y="36" width="88" height="24" rx="12" fill="#315bd6"/>
      <text x="292" y="52" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">目前位置</text>
    </svg>`,
    volume: `<svg viewBox="0 0 344 276" aria-hidden="true">
      <rect width="344" height="276" fill="#fafbfc"/>
      <text x="28" y="37" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">市場參與程度</text>
      <rect x="28" y="72" width="288" height="116" rx="18" fill="#f0f2f5"/><path d="M28 108 H316" stroke="#b8bec7" stroke-width="1.5" stroke-dasharray="5 5"/>
      <text x="42" y="98" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">近期常態範圍</text>
      <g fill="#cdd1d8"><rect x="47" y="137" width="18" height="35" rx="5"/><rect x="75" y="125" width="18" height="47" rx="5"/><rect x="103" y="143" width="18" height="29" rx="5"/><rect x="131" y="118" width="18" height="54" rx="5"/><rect x="159" y="130" width="18" height="42" rx="5"/><rect x="187" y="122" width="18" height="50" rx="5"/><rect x="215" y="141" width="18" height="31" rx="5"/></g>
      <rect x="249" y="116" width="28" height="56" rx="7" fill="#315bd6"/><path d="M263 108 V88" stroke="#315bd6" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="230" y="65" width="66" height="24" rx="12" fill="#315bd6"/><text x="263" y="81" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">目前</text>
      <circle cx="55" cy="220" r="5" fill="#315bd6"/><text x="69" y="224" fill="#686c74" font-size="10" font-weight="750" letter-spacing=".04em">尚未明顯超出常態範圍</text>
    </svg>`
  };

  const REELS = [
    {
      kicker: "資訊候選 A｜籌碼動向",
      head: "法人籌碼持續增加",
      desc: "主要參與者買盤延續，持股分布逐漸集中。",
      visual: "chips",
      visualLabel: "主要參與者由分散轉為集中的籌碼資料骨架"
    },
    {
      kicker: "資訊候選 B｜價格位置",
      head: "價格位於短期參考區上方",
      desc: "價格維持在近期區間偏上位置，暫未回到整理區。",
      visual: "price",
      visualLabel: "價格位置與兩段短期參考區的資料骨架"
    },
    {
      kicker: "資訊候選 C｜量能確認",
      head: "成交量尚未明顯擴大",
      desc: "價格已有反應，但市場參與程度仍接近近期常態。",
      visual: "volume",
      visualLabel: "目前市場參與程度與近期常態範圍的資料骨架",
      money: true
    },
    {
      kicker: "04 · 下一步",
      head: "決定追蹤或先略過",
      desc: "讀完三個面向後，在這裡完成這次查看。",
      last: true
    }
  ];

  function reelHTML(reel, index) {
    const media = reel.visual
      ? `<div class="reel-media" role="img" aria-label="${reel.visualLabel}">${REEL_VISUALS[reel.visual]}</div>`
      : "";
    const money = reel.money
      ? `<div class="reel-money-row">
          <div class="reel-money"><b>目前參與程度</b><em>接近常態</em><small>與近期區間相近</small></div>
          <div class="reel-vs">對比</div>
          <div class="reel-money"><b>確認狀態</b><em>尚待確認</em><small>仍需後續觀察</small></div>
        </div>`
      : "";
    const decisionPanel = reel.last
      ? `<div class="decision-panel">
          <div class="decision-gesture-hints" aria-hidden="true"><span>← 左滑略過</span><span>右滑加入自選股 →</span></div>
          <div class="decision-buttons" data-decision-buttons>
            <button class="decision-skip" type="button" data-decision="skip">先略過</button>
            <button class="decision-track" type="button" data-decision="track" aria-pressed="false">加入自選股</button>
          </div>
          <div class="decision-result" data-decision-result role="status" hidden>
            <div class="decision-result-row"><strong data-decision-title></strong><button type="button" data-decision-undo>Undo</button></div>
            <p data-decision-copy></p>
          </div>
          <div class="decision-exits" data-decision-exits hidden>
            <button class="decision-home" type="button" data-close-guide>返回個股首頁</button>
            <button class="decision-next-stock" type="button" data-next-stock>下一支股票</button>
          </div>
        </div>`
      : "";

    return `<section class="reel${reel.last ? " reel--last" : ""}" data-reel-index="${index}" tabindex="-1" aria-label="${reel.kicker}">
      <div class="reel-body">
        <div class="reel-kicker">${reel.kicker}</div>
        ${media}
        <strong class="reel-head">${reel.head}</strong>
        <p class="reel-desc">${reel.desc}</p>
        ${money}${decisionPanel}
      </div>
    </section>`;
  }

  const overlay = document.createElement("div");
  overlay.className = "reels-overlay";
  overlay.id = "reelsOverlayV5";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "guideProgressLabel");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="reels-top">
      <div class="reels-progress">
        <span class="reels-progress-label" id="guideProgressLabel">第 1 步，共 4 步</span>
        <div class="reels-segs" aria-hidden="true">${REELS.map((_, index) => `<span class="reels-seg${index === 0 ? " is-on" : ""}"></span>`).join("")}</div>
      </div>
      <button class="reels-close" type="button" data-close-guide aria-label="返回個股首頁">✕</button>
    </div>
    <div class="reels-scroll" id="reelsScrollV5">${REELS.map(reelHTML).join("")}</div>
    <div class="sr-only" id="guideLive" role="status" aria-live="polite"></div>
  `;
  document.body.appendChild(overlay);

  const scroller = overlay.querySelector("#reelsScrollV5");
  const reels = [...overlay.querySelectorAll(".reel")];
  const segments = [...overlay.querySelectorAll(".reels-seg")];
  const progressLabel = overlay.querySelector("#guideProgressLabel");
  const guideLive = overlay.querySelector("#guideLive");
  const closeButton = overlay.querySelector(".reels-close");

  function guideIndex() {
    return Math.max(0, Math.min(reels.length - 1, Math.round(scroller.scrollTop / (scroller.clientHeight || 1))));
  }

  function setActive(index, announce = false) {
    const boundedIndex = Math.max(0, Math.min(reels.length - 1, index));
    if (boundedIndex !== activeIndex && boundedIndex === reels.length - 1) lastPageEnteredAt = Date.now();
    activeIndex = boundedIndex;
    segments.forEach((segment, segmentIndex) => segment.classList.toggle("is-on", segmentIndex <= boundedIndex));
    reels.forEach((reel, reelIndex) => {
      const active = reelIndex === boundedIndex;
      reel.inert = !active;
      reel.setAttribute("aria-hidden", String(!active));
    });
    progressLabel.textContent = `第 ${boundedIndex + 1} 步，共 ${reels.length} 步`;
    if (announce) guideLive.textContent = `${progressLabel.textContent}：${REELS[boundedIndex].head}`;
  }

  function focusReel(index) {
    window.setTimeout(() => reels[index].focus({ preventScroll: true }), reducedMotion.matches ? 0 : 230);
  }

  function moveGuide(index, options = {}) {
    const boundedIndex = Math.max(0, Math.min(reels.length - 1, index));
    scroller.scrollTo({
      top: boundedIndex * (scroller.clientHeight || window.innerHeight),
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    setActive(boundedIndex, true);
    if (options.focus) focusReel(boundedIndex);
  }

  function openGuide(entryIndex = 0, opener = document.activeElement) {
    const boundedIndex = Math.max(0, Math.min(reels.length - 1, entryIndex));
    guideOpener = opener;
    decision = null;
    undoState = null;
    renderDecision();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    app.inert = true;
    scroller.scrollTop = boundedIndex * (scroller.clientHeight || window.innerHeight);
    setActive(boundedIndex);
    window.requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
  }

  function closeGuide() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    app.inert = false;
    guideOpener?.focus({ preventScroll: true });
    overlay.setAttribute("aria-hidden", "true");
    reels.forEach((reel) => { reel.inert = true; });
  }

  function setTracked(value) {
    tracked = value;
    window.sessionStorage.setItem(STORAGE_KEY, String(value));
  }

  function renderDecision() {
    if (!overlay) return;
    const buttons = overlay.querySelector("[data-decision-buttons]");
    const result = overlay.querySelector("[data-decision-result]");
    const exits = overlay.querySelector("[data-decision-exits]");
    const trackButton = overlay.querySelector('[data-decision="track"]');
    trackButton.setAttribute("aria-pressed", String(tracked));
    if (!decision) {
      buttons.hidden = false;
      result.hidden = true;
      exits.hidden = true;
      return;
    }
    buttons.hidden = true;
    result.hidden = false;
    exits.hidden = false;
    overlay.querySelector("[data-decision-title]").textContent = decision === "track" ? "已加入自選股" : "已略過這次查看";
    overlay.querySelector("[data-decision-copy]").textContent = decision === "track"
      ? "已開始追蹤後續變化；此狀態會保留在目前瀏覽分頁。"
      : "你仍可返回個股首頁，或繼續下一支股票。";
  }

  function applyDecision(nextDecision) {
    undoState = { tracked };
    decision = nextDecision;
    setTracked(nextDecision === "track");
    renderDecision();
    const message = nextDecision === "track" ? "已加入自選股" : "已略過這次查看";
    showToast(message);
    post(nextDecision === "track" ? "prototype:tracked" : "prototype:skip", { tracked });
    overlay.querySelector("[data-decision-undo]").focus({ preventScroll: true });
  }

  function undoDecision() {
    if (!undoState) return;
    setTracked(undoState.tracked);
    decision = null;
    undoState = null;
    renderDecision();
    showToast("已復原剛才的選擇");
    post("prototype:decision-undo", { tracked });
    overlay.querySelector('[data-decision="track"]').focus({ preventScroll: true });
  }

  railCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (Date.now() < suppressRailClickUntil) {
        event.preventDefault();
        return;
      }
      openGuide(Number(card.dataset.reelTarget), card);
    });
  });
  overlay.querySelectorAll("[data-close-guide]").forEach((button) => button.addEventListener("click", closeGuide));
  overlay.querySelectorAll("[data-decision]").forEach((button) => {
    button.addEventListener("click", () => applyDecision(button.dataset.decision));
  });
  overlay.querySelector("[data-decision-undo]").addEventListener("click", undoDecision);
  overlay.querySelector("[data-next-stock]").addEventListener("click", () => {
    post("prototype:next-stock", { decision });
    closeGuide();
    showToast("已觸發下一支股票出口（V5 placeholder）");
  });

  let scrollFrame = 0;
  scroller.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => setActive(guideIndex()));
  }, { passive: true });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartIndex = 0;
  let touchStartedAtEnd = false;
  let touchStartedOnControl = false;
  scroller.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
    touchStartIndex = activeIndex;
    touchStartedOnControl = Boolean(event.target.closest("button"));
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    touchStartedAtEnd = activeIndex === reels.length - 1 && Math.abs(scroller.scrollTop - maxScroll) < 4;
  }, { passive: true });
  scroller.addEventListener("touchend", (event) => {
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    const horizontalDecision = touchStartIndex === reels.length - 1
      && activeIndex === reels.length - 1
      && !decision
      && !touchStartedOnControl
      && Math.abs(dx) >= 64
      && Math.abs(dx) > Math.abs(dy) * 1.2;
    if (horizontalDecision) applyDecision(dx < 0 ? "skip" : "track");
    else if (touchStartedAtEnd && dy < -64 && Math.abs(dy) > Math.abs(dx) * 1.2) closeGuide();
    touchStartedAtEnd = false;
    touchStartedOnControl = false;
  }, { passive: true });

  let decisionPointer = null;
  scroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || activeIndex !== reels.length - 1 || event.target.closest("button")) return;
    decisionPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  scroller.addEventListener("pointerup", (event) => {
    if (!decisionPointer || event.pointerId !== decisionPointer.id || decision || activeIndex !== reels.length - 1) {
      decisionPointer = null;
      return;
    }
    const dx = event.clientX - decisionPointer.x;
    const dy = event.clientY - decisionPointer.y;
    decisionPointer = null;
    if (Math.abs(dx) >= 64 && Math.abs(dx) > Math.abs(dy) * 1.2) applyDecision(dx < 0 ? "skip" : "track");
  });
  scroller.addEventListener("pointercancel", () => { decisionPointer = null; });

  let wheelTotal = 0;
  let wheelResetTimer;
  scroller.addEventListener("wheel", (event) => {
    if (activeIndex !== reels.length - 1 || Date.now() - lastPageEnteredAt < 650 || event.deltaY <= 0) return;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    if (Math.abs(scroller.scrollTop - maxScroll) >= 4) return;
    window.clearTimeout(wheelResetTimer);
    wheelTotal += event.deltaY;
    wheelResetTimer = window.setTimeout(() => { wheelTotal = 0; }, 240);
    if (wheelTotal >= 110) {
      wheelTotal = 0;
      closeGuide();
    }
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeGuide();
    } else if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      if (activeIndex === reels.length - 1) closeGuide();
      else moveGuide(activeIndex + 1, { focus: true });
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      moveGuide(activeIndex - 1, { focus: true });
    } else if (activeIndex === reels.length - 1 && !decision && event.key === "ArrowLeft") {
      event.preventDefault();
      applyDecision("skip");
    } else if (activeIndex === reels.length - 1 && !decision && event.key === "ArrowRight") {
      event.preventDefault();
      applyDecision("track");
    } else if (event.key === "Home") {
      event.preventDefault();
      moveGuide(0, { focus: true });
    } else if (event.key === "End") {
      event.preventDefault();
      moveGuide(reels.length - 1, { focus: true });
    }
  });

  window.reelsOpen = (index = 0) => openGuide(index, railCards[index] || railCards[0]);
  window.reelsClose = closeGuide;
})();
