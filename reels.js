/*
 * 共用圖解導覽（A→B reels）元件
 * 用法：版本頁 <script src="../reels.js"></script>，並在要點擊進導覽的元素加
 *   data-open-reels [data-reel-target="0..3"] [role="button" tabindex="0"]
 * 本元件會注入樣式與全幅上下滑的四段導覽，並處理開合、進度條、往左滑返回、Esc、鍵盤。
 * 圖表為 2408 南亞科 2026/07/14 真實截圖（已移除含投資建議的分析師橫幅）。示範材料、非投資建議。
 */
(function () {
  if (window.__reelsInit) return;
  window.__reelsInit = true;

  var REELS = [
    {
      kicker: "01 · 現在盤面",
      img: "../assets/2408-01-intraday-line.png",
      imgStyle: "width:150%; left:-25%; top:26px;",
      veil: "linear-gradient(180deg, rgba(8,9,12,.28) 0%, rgba(8,9,12,0) 12%, rgba(8,9,12,0) 26%, #08090c 40%)",
      head: "開低走高，<br>尾盤收在近高點",
      desc: "今天早盤先下殺，下午一路拉回，收盤量縮 7%。",
      hint: "上滑看為什麼會漲"
    },
    {
      kicker: "02 · 為什麼會熱",
      kColor: "#ffb22e",
      img: "../assets/2408-03-kline.png",
      imgStyle: "width:132%; left:-16%; top:-430px;",
      veil: "linear-gradient(180deg, rgba(8,9,12,.55) 0%, rgba(8,9,12,0) 12%, rgba(8,9,12,0) 30%, #08090c 40%)",
      head: "營收創高後，<br>帶量突破上漲",
      desc: "股價站上均線糾結、成交量明顯放大，短線力道轉強——熱度是有基本面燃料的。",
      hint: "上滑看最大的風險"
    },
    {
      kicker: "03 · 最大的風險",
      img: "../assets/2408-08-chips.png",
      imgStyle: "width:150%; left:-25%; top:-560px;",
      veil: "linear-gradient(180deg, rgba(8,9,12,.78) 0%, rgba(8,9,12,.30) 22%, rgba(8,9,12,.55) 46%, #08090c 62%)",
      head: "價格在漲，<br>但大資金沒跟上",
      money: true,
      bodyStyle: "bottom:150px;",
      hint: "上滑看結論"
    },
    {
      kicker: "04 · 一句話帶走",
      kColor: "#ffb22e",
      last: true,
      bg: "radial-gradient(circle at 50% 30%, rgba(255,178,46,.12), transparent 42%), #08090c",
      bodyStyle: "bottom:auto; top:50%; transform:translateY(-50%);",
      head: "熱度有理由，<br>但資金還沒跟上",
      desc: "會漲有基本面撐腰，可是投信在買、外資和大戶在退——這個價量與資金的分歧，值得先看懂。"
    }
  ];

  var CSS = [
    ".reels-overlay{position:fixed;inset:0;z-index:2147483000;transform:translateY(100%);",
    "transition:transform 440ms cubic-bezier(.23,1,.32,1);background:#08090c;",
    "font-family:-apple-system,BlinkMacSystemFont,'PingFang TC','Noto Sans TC',sans-serif;}",
    ".reels-overlay.is-open{transform:translateY(0);}",
    ".reels-scroll{position:absolute;inset:0;overflow-y:auto;scroll-snap-type:y mandatory;",
    "-ms-overflow-style:none;scrollbar-width:none;-webkit-overflow-scrolling:touch;}",
    ".reels-scroll::-webkit-scrollbar{display:none;}",
    ".reel{height:100dvh;scroll-snap-align:start;position:relative;overflow:hidden;}",
    ".reel-crop{position:absolute;filter:saturate(.99) contrast(1.06);}",
    ".reel-veil{position:absolute;inset:0;}",
    ".reel-body{position:absolute;left:20px;right:20px;bottom:118px;}",
    ".reel-kicker{color:#ff3b47;font-size:13px;font-weight:900;letter-spacing:.14em;}",
    ".reel-head{display:block;margin-top:12px;color:#f7f7f3;font-size:29px;font-weight:900;line-height:1.2;letter-spacing:-.01em;}",
    ".reel-desc{margin:12px 0 0;color:#c8ccd2;font-size:15px;line-height:1.55;}",
    ".reel-hint{position:absolute;left:0;right:0;bottom:52px;display:flex;flex-direction:column;align-items:center;gap:5px;color:#9da3ad;animation:reelFloat 1.8s ease-in-out infinite;}",
    ".reel-hint span:first-child{font-size:18px;}",
    ".reel-hint span:last-child{font-size:12px;font-weight:700;}",
    "@keyframes reelFloat{0%,100%{transform:translateY(0);opacity:.9;}50%{transform:translateY(-6px);opacity:.5;}}",
    ".reel-money-row{display:grid;grid-template-columns:1fr 30px 1fr;gap:8px;margin-top:18px;}",
    ".reel-money{padding:11px;border-radius:13px;background:rgba(28,32,39,.86);backdrop-filter:blur(4px);}",
    ".reel-money b{display:block;margin-bottom:8px;font-size:11px;color:#c8ccd2;font-weight:700;}",
    ".reel-money em{display:block;font-style:normal;font-size:23px;font-weight:900;letter-spacing:-.03em;}",
    ".reel-money small{display:block;margin-top:5px;color:#9da3ad;font-size:10px;line-height:1.35;}",
    ".reel-money.buy em{color:#ff3b47;}",
    ".reel-money.sell em{color:#35c55b;}",
    ".reel-vs{display:grid;place-items:center;color:#ffb22e;font-size:12px;font-weight:900;}",
    ".reel-back{margin-top:24px;min-height:48px;padding:0 22px;border:1px solid rgba(255,255,255,.16);",
    "border-radius:14px;background:rgba(255,255,255,.06);color:#f7f7f3;font-weight:800;cursor:pointer;",
    "transition:transform 150ms cubic-bezier(.23,1,.32,1);}",
    ".reel-back:active{transform:scale(.97);}",
    ".reels-top{position:absolute;z-index:3;top:0;left:0;right:0;padding:max(10px,env(safe-area-inset-top)) 16px 10px;display:flex;align-items:center;gap:12px;}",
    ".reels-segs{flex:1;display:flex;gap:6px;}",
    ".reels-seg{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.22);transition:background 260ms ease;}",
    ".reels-seg.is-on{background:#ff3b47;}",
    ".reels-close{flex:0 0 auto;width:34px;height:34px;border:0;border-radius:999px;display:grid;place-items:center;",
    "background:rgba(9,10,13,.6);color:#fff;font-size:18px;cursor:pointer;transition:transform 140ms cubic-bezier(.23,1,.32,1);}",
    ".reels-close:active{transform:scale(.9);}",
    "[data-open-reels]{cursor:pointer;}",
    // 單獨開啟於寬螢幕時，把導覽收在置中的手機欄內（iframe 內視窗窄，不會觸發）
    "@media (min-width:460px){.reels-overlay{width:402px;left:50%;transform:translateX(-50%) translateY(100%);}",
    ".reels-overlay.is-open{transform:translateX(-50%) translateY(0);}}",
    "@media (prefers-reduced-motion: reduce){.reels-overlay,.reel-hint{transition-duration:1ms!important;animation-duration:1ms!important;}}"
  ].join("");

  function reelHTML(r) {
    var parts = [];
    parts.push('<section class="reel"' + (r.bg ? ' style="background:' + r.bg + ';"' : "") + ' aria-label="' + r.kicker + '">');
    if (r.img) parts.push('<img class="reel-crop" src="' + r.img + '" alt="南亞科圖表" style="' + r.imgStyle + '">');
    if (r.veil) parts.push('<div class="reel-veil" style="background:' + r.veil + ';"></div>');
    parts.push('<div class="reel-body"' + (r.bodyStyle ? ' style="' + r.bodyStyle + '"' : "") + ">");
    parts.push('<div class="reel-kicker"' + (r.kColor ? ' style="color:' + r.kColor + ';"' : "") + ">" + r.kicker + "</div>");
    parts.push('<strong class="reel-head">' + r.head + "</strong>");
    if (r.desc) parts.push('<p class="reel-desc">' + r.desc + "</p>");
    if (r.money) {
      parts.push('<div class="reel-money-row">' +
        '<div class="reel-money buy"><b>投信一個月</b><em>+7萬張</em><small>持續買進</small></div>' +
        '<div class="reel-vs">但</div>' +
        '<div class="reel-money sell"><b>外資／大戶</b><em>↘ 減碼</em><small>月減、連三週降</small></div>' +
        "</div>");
    }
    if (r.last) parts.push('<button class="reel-back" type="button" data-close-reels>回總覽看操作 ›</button>');
    parts.push("</div>");
    if (r.hint) parts.push('<div class="reel-hint"><span>︿</span><span>' + r.hint + "</span></div>");
    parts.push("</section>");
    return parts.join("");
  }

  function build() {
    var style = document.createElement("style");
    style.id = "reels-style";
    style.textContent = CSS;
    document.head.appendChild(style);

    var segs = REELS.map(function (_, i) {
      return '<span class="reels-seg' + (i === 0 ? " is-on" : "") + '"></span>';
    }).join("");

    var overlay = document.createElement("div");
    overlay.className = "reels-overlay";
    overlay.id = "reelsOverlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="reels-top"><div class="reels-segs">' + segs + "</div>" +
      '<button class="reels-close" type="button" data-close-reels aria-label="收合圖解導覽">✕</button></div>' +
      '<div class="reels-scroll" id="reelsScroll">' + REELS.map(reelHTML).join("") + "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  function init() {
    var overlay = build();
    var scroller = overlay.querySelector("#reelsScroll");
    var segEls = [].slice.call(overlay.querySelectorAll(".reels-seg"));
    var setActive = function (i) {
      segEls.forEach(function (s, idx) { s.classList.toggle("is-on", idx <= i); });
    };

    function openReels(index) {
      index = index || 0;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      scroller.scrollTop = index * scroller.clientHeight;
      setActive(index);
    }
    function closeReels() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }

    [].slice.call(document.querySelectorAll("[data-open-reels]")).forEach(function (el) {
      var target = Number(el.getAttribute("data-reel-target")) || 0;
      el.addEventListener("click", function () { openReels(target); });
      if (el.getAttribute("role") === "button") {
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openReels(target); }
        });
      }
    });
    [].slice.call(overlay.querySelectorAll("[data-close-reels]")).forEach(function (el) {
      el.addEventListener("click", closeReels);
    });

    scroller.addEventListener("scroll", function () {
      var h = scroller.clientHeight || 1;
      setActive(Math.max(0, Math.min(segEls.length - 1, Math.round(scroller.scrollTop / h))));
    }, { passive: true });

    // 往左滑 = 返回上一段；已在第一段則退回總覽
    var tsX = 0, tsY = 0;
    scroller.addEventListener("touchstart", function (e) {
      var t = e.changedTouches[0]; tsX = t.clientX; tsY = t.clientY;
    }, { passive: true });
    scroller.addEventListener("touchend", function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - tsX, dy = t.clientY - tsY;
      if (dx < -55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        var h = scroller.clientHeight || 1;
        var cur = Math.round(scroller.scrollTop / h);
        if (cur <= 0) closeReels();
        else scroller.scrollTo({ top: (cur - 1) * h, behavior: "smooth" });
      }
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeReels();
    });

    window.reelsOpen = openReels;
    window.reelsClose = closeReels;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
