(() => {
  const STORAGE_KEY = "h8-prototype-neutral-state";
  const DEFAULT_STATE = { tracked: false, tab: "chart", period: "short" };
  const tabLabels = { live: "即時", chart: "K 線", chips: "籌碼" };
  const periodLabels = { short: "短期", medium: "中期", long: "長期" };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const app = document.getElementById("appRoot");
  const toast = document.getElementById("toast");
  const trackButton = document.getElementById("trackButton");
  const skipButton = document.getElementById("skipButton");
  const backButton = document.getElementById("backButton");
  const sourceButton = document.getElementById("sourceButton");
  const pageContext = document.getElementById("pageContext");
  const sourceDialog = document.getElementById("sourceDialog");
  const moreDialog = document.getElementById("moreDialog");
  const chartCard = document.getElementById("chartCard");
  const expandChart = document.getElementById("expandChart");
  const plot = document.getElementById("abstractPlot");
  const periodFeedback = document.getElementById("periodFeedback");
  const guide = document.getElementById("guideOverlay");
  const guideScroll = document.getElementById("guideScroll");
  const guideSegments = [...guide.querySelectorAll(".guide-segments i")];
  let toastTimer;
  let dragging = false;
  let focusX = 50;
  let focusY = 46;
  let guideOpener = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let pointerStartX = 0;
  let pointerStartY = 0;

  function readState() {
    try {
      return { ...DEFAULT_STATE, ...JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  let state = readState();

  function saveState() {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1700);
  }

  function post(type, payload = {}) {
    if (window.parent !== window) window.parent.postMessage({ type, version: "neutral", ...payload }, "*");
  }

  function setTracked(tracked, notify = false) {
    state.tracked = tracked;
    trackButton.setAttribute("aria-pressed", String(tracked));
    trackButton.textContent = tracked ? "已追蹤" : "追蹤";
    saveState();
    if (notify) {
      showToast(tracked ? "已追蹤後續變化" : "已取消追蹤");
      post("prototype:tracked", { tracked });
    }
  }

  function activateTab(name, options = {}) {
    const normalized = Object.hasOwn(tabLabels, name) ? name : DEFAULT_STATE.tab;
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === normalized;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
    });
    pageContext.textContent = tabLabels[normalized];
    state.tab = normalized;
    saveState();
    if (options.focus) tabs.find((tab) => tab.dataset.tab === normalized)?.focus();
    if (options.notify) showToast(`已切換到${tabLabels[normalized]}`);
  }

  function setPeriod(period, notify = false) {
    const normalized = Object.hasOwn(periodLabels, period) ? period : DEFAULT_STATE.period;
    document.querySelectorAll("[data-period]").forEach((button) => {
      if (button.tagName === "BUTTON") button.setAttribute("aria-pressed", String(button.dataset.period === normalized));
    });
    plot.dataset.period = normalized;
    periodFeedback.textContent = `目前顯示${periodLabels[normalized]}區間`;
    state.period = normalized;
    saveState();
    if (notify) showToast(`已切換到${periodLabels[normalized]}區間`);
  }

  function setPlotFocus(x, y) {
    focusX = Math.max(4, Math.min(96, x));
    focusY = Math.max(8, Math.min(92, y));
    plot.style.setProperty("--focus-x", `${focusX}%`);
    plot.style.setProperty("--focus-y", `${focusY}%`);
    plot.classList.add("has-focus");
  }

  function focusFromPointer(event) {
    const rect = plot.getBoundingClientRect();
    setPlotFocus(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100);
  }

  function setGuideActive(index) {
    guideSegments.forEach((segment, itemIndex) => segment.classList.toggle("is-on", itemIndex <= index));
  }

  function guideIndex() {
    return Math.max(0, Math.min(guideSegments.length - 1, Math.round(guideScroll.scrollTop / (guideScroll.clientHeight || 1))));
  }

  function moveGuide(target) {
    const index = Math.max(0, Math.min(guideSegments.length - 1, target));
    guideScroll.scrollTo({ top: index * (guideScroll.clientHeight || window.innerHeight), behavior: reducedMotion.matches ? "auto" : "smooth" });
    setGuideActive(index);
  }

  function handleLeftSwipe(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    if (dx >= -55 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;
    const current = guideIndex();
    if (current === 0) closeGuide();
    else moveGuide(current - 1);
  }

  function openGuide(index, opener) {
    guideOpener = opener || document.activeElement;
    guide.classList.add("is-open");
    guide.setAttribute("aria-hidden", "false");
    app.inert = true;
    window.requestAnimationFrame(() => {
      guideScroll.scrollTop = index * (guideScroll.clientHeight || window.innerHeight);
      setGuideActive(index);
      guide.querySelector(".guide-close").focus({ preventScroll: true });
    });
  }

  function closeGuide() {
    if (!guide.classList.contains("is-open")) return;
    guide.classList.remove("is-open");
    guide.setAttribute("aria-hidden", "true");
    app.inert = false;
    guideOpener?.focus({ preventScroll: true });
  }

  function wireDialog(dialog) {
    dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab, { notify: true }));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      const current = tabs.indexOf(tab);
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      activateTab(tabs[next].dataset.tab, { focus: true, notify: true });
    });
  });

  document.querySelectorAll(".period-switch button").forEach((button) => {
    button.addEventListener("click", () => setPeriod(button.dataset.period, true));
  });

  expandChart.addEventListener("click", () => {
    const expanded = expandChart.getAttribute("aria-expanded") !== "true";
    expandChart.setAttribute("aria-expanded", String(expanded));
    expandChart.textContent = expanded ? "收合" : "展開";
    chartCard.classList.toggle("is-expanded", expanded);
    showToast(expanded ? "圖表已展開" : "圖表已收合");
  });

  plot.addEventListener("pointerdown", (event) => {
    dragging = true;
    plot.setPointerCapture?.(event.pointerId);
    focusFromPointer(event);
  });
  plot.addEventListener("pointermove", (event) => {
    if (dragging) focusFromPointer(event);
  });
  plot.addEventListener("pointerup", (event) => {
    dragging = false;
    plot.releasePointerCapture?.(event.pointerId);
  });
  plot.addEventListener("pointercancel", () => { dragging = false; });
  plot.addEventListener("keydown", (event) => {
    const offsets = { ArrowLeft: [-6, 0], ArrowRight: [6, 0], ArrowUp: [0, -6], ArrowDown: [0, 6] };
    if (offsets[event.key]) {
      event.preventDefault();
      setPlotFocus(focusX + offsets[event.key][0], focusY + offsets[event.key][1]);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setPlotFocus(focusX, focusY);
    }
    if (event.key === "Escape") plot.classList.remove("has-focus");
  });

  document.querySelectorAll("[data-open-guide]").forEach((element) => {
    element.addEventListener("click", () => openGuide(Number(element.dataset.guideTarget) || 0, element));
  });
  guide.querySelectorAll("[data-close-guide]").forEach((button) => button.addEventListener("click", closeGuide));
  guideScroll.addEventListener("scroll", () => setGuideActive(guideIndex()), { passive: true });
  guideScroll.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  guideScroll.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    handleLeftSwipe(touchStartX, touchStartY, touch.clientX, touch.clientY);
  }, { passive: true });
  guideScroll.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  }, { passive: true });
  guideScroll.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch") return;
    handleLeftSwipe(pointerStartX, pointerStartY, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (!guide.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeGuide();
    }
    if (["ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      moveGuide(guideIndex() + 1);
    }
    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      moveGuide(guideIndex() - 1);
    }
    if (event.key === "Home") { event.preventDefault(); moveGuide(0); }
    if (event.key === "End") { event.preventDefault(); moveGuide(guideSegments.length - 1); }
  });

  sourceButton.addEventListener("click", () => sourceDialog.showModal());
  document.getElementById("moreButton").addEventListener("click", () => moreDialog.showModal());
  moreDialog.querySelector('[data-more-action="info"]').addEventListener("click", () => {
    moreDialog.close();
    sourceDialog.showModal();
  });
  moreDialog.querySelector('[data-more-action="reset"]').addEventListener("click", () => {
    state = { ...DEFAULT_STATE };
    setTracked(false);
    activateTab(DEFAULT_STATE.tab);
    setPeriod(DEFAULT_STATE.period);
    chartCard.classList.remove("is-expanded");
    expandChart.setAttribute("aria-expanded", "false");
    expandChart.textContent = "展開";
    plot.classList.remove("has-focus");
    moreDialog.close();
    showToast("狀態已重設");
  });
  wireDialog(sourceDialog);
  wireDialog(moreDialog);

  trackButton.addEventListener("click", () => setTracked(trackButton.getAttribute("aria-pressed") !== "true", true));
  skipButton.addEventListener("click", () => {
    showToast("已先略過，可稍後再查看");
    post("prototype:skip");
  });
  backButton.addEventListener("click", () => {
    if (window.parent !== window) post("prototype:back");
    else window.location.href = "../index.html?version=v3";
  });

  setTracked(Boolean(state.tracked));
  activateTab(state.tab);
  setPeriod(state.period);
})();
