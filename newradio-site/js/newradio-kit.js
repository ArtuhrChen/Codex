/* ==========================================================================
   newradio-kit.js — 雲端新廣播官網 UI 強化套件（零依賴，IIFE，不需 build）
   與 newradio.js（播放器邏輯）完全分離：本檔只「觀察」播放器狀態，
   任何模組失敗都不影響收聽。載入方式：<script src="newradio-kit.js" defer>
   設定：<script> 標籤前可放 window.NR_KIT = { visualizer:true, mini:true, mediaSession:true, split:true, marquee:true }
   ========================================================================== */
(function () {
  "use strict";

  var cfg = Object.assign(
    // visualizer 預設關閉（2026-10-07 上線實測）：開啟時會把 audio 設成 crossOrigin，
    // 而主音源 live.arthur.com.tw 目前回兩個 Access-Control-Allow-Origin 標頭，瀏覽器判 CORS 失敗，
    // 主音源整個被擋、所有聽眾都落到備援 stream.php。等該伺服器修好只送一個標頭，再改回 true。
    { visualizer: false, mini: true, mediaSession: true, split: true, marquee: true },
    window.NR_KIT || {}
  );
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var audio = document.querySelector("[data-audio]");
  var player = document.querySelector(".radio-player");
  var playButton = document.querySelector("[data-play]");
  var statusEl = document.querySelector("[data-status]");
  var bars = player ? Array.prototype.slice.call(player.querySelectorAll(".player-bars span")) : [];

  // 共用狀態匯流排：visualizer 算出每根 bar 的 level，mini player 也訂閱
  var levelListeners = [];
  function emitLevels(levels) {
    for (var i = 0; i < levelListeners.length; i++) levelListeners[i](levels);
  }
  function isPlaying() {
    return !!(player && player.classList.contains("is-playing"));
  }

  /* ------------------------------------------------------------------------
     1. 真實音訊視覺化（Web Audio AnalyserNode）
     條件：直播源要帶 Access-Control-Allow-Origin（live.arthur.com.tw 目前有 *），
     且 audio.crossOrigin 必須在 src 載入前設定。若 CORS 不成立，AnalyserNode
     只會讀到 0，這裡在 1.5 秒內偵測到全 0 就撤掉 .has-visualizer 回到 CSS 律動；
     聲音本身不受影響（我們不改 audio 的輸出路徑，只是旁聽）。
     ------------------------------------------------------------------------ */
  function setupVisualizer() {
    if (!cfg.visualizer || !audio || !player || !bars.length) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    // 必須在首次載入前設定；newradio.js 在它自己的 IIFE 已設 src，
    // 這裡改屬性後下一次 load() 會帶 CORS 模式（startAudio 每次都會 load()）。
    try { audio.crossOrigin = "anonymous"; } catch (e) { return; }

    var ctx = null, analyser = null, source = null, data = null, raf = 0;
    var smooth = bars.map(function () { return 0; });
    var silentSince = 0;
    var demoOsc = /[?&]demo=osc/.test(location.search); // 測試用：用振盪器餵訊號

    function init() {
      if (ctx) { if (ctx.state === "suspended") ctx.resume(); return true; }
      try {
        ctx = new AC();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 128;             // 64 bins，取低頻 ~ 中高頻 16 段
        analyser.smoothingTimeConstant = .72;
        if (demoOsc) {
          var osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.type = "sawtooth"; osc.frequency.value = 180; gain.gain.value = .0001;
          osc.connect(analyser); analyser.connect(gain); gain.connect(ctx.destination); osc.start();
          var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
          lfo.frequency.value = 2.3; lfoGain.gain.value = 120; lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start();
        } else {
          source = ctx.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(ctx.destination); // 必須接回輸出，否則無聲
        }
        data = new Uint8Array(analyser.frequencyBinCount);
        return true;
      } catch (e) {
        ctx = null;
        return false;
      }
    }

    // 64 個 bin → 16 根 bar：對數分佈，讓低音不霸佔全部
    var edges = (function () {
      var n = bars.length, out = [], maxBin = 48; // 忽略最高頻（直播多為 128kbps，上面沒料）
      for (var i = 0; i <= n; i++) out.push(Math.round(Math.pow(maxBin, i / n)));
      out[0] = 1;
      return out;
    })();

    function frame() {
      raf = requestAnimationFrame(frame);
      analyser.getByteFrequencyData(data);
      var total = 0, levels = [];
      for (var i = 0; i < bars.length; i++) {
        var a = edges[i], b = Math.max(edges[i + 1], a + 1), sum = 0, cnt = 0;
        for (var k = a; k < b && k < data.length; k++) { sum += data[k]; cnt++; }
        var v = cnt ? sum / cnt / 255 : 0;
        v = Math.pow(v, 1.35);                       // 壓低底噪、拉開動態
        smooth[i] = v > smooth[i] ? smooth[i] * .35 + v * .65 : smooth[i] * .82 + v * .18; // 快上慢下
        total += smooth[i];
        levels.push(smooth[i]);
        bars[i].style.setProperty("--level", smooth[i].toFixed(3));
      }
      emitLevels(levels);
      // CORS 失敗偵測：持續全 0 超過 1.5 秒就放棄
      if (total < .001) {
        if (!silentSince) silentSince = performance.now();
        else if (performance.now() - silentSince > 1500) teardown(true);
      } else {
        silentSince = 0;
        player.classList.add("has-visualizer");
      }
    }

    function start() {
      if (!init()) return;
      if (!raf) frame();
    }
    function stop() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      silentSince = 0;
      bars.forEach(function (bar) { bar.style.removeProperty("--level"); });
      emitLevels(null);
    }
    function teardown(corsFailed) {
      stop();
      player.classList.remove("has-visualizer");
      if (corsFailed) { audio.removeEventListener("playing", start); audio.removeEventListener("pause", stop); }
    }

    if (demoOsc) {
      // 測試模式：不接真實直播，按播放鍵即以振盪器餵頻譜，忽略 audio 的 error/pause
      if (playButton) playButton.addEventListener("click", function () { setTimeout(start, 50); });
    } else {
      audio.addEventListener("playing", start);
      audio.addEventListener("pause", stop);
      audio.addEventListener("ended", stop);
      audio.addEventListener("error", stop);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
      else if (isPlaying() && ctx) { start(); }
    });
  }

  /* ------------------------------------------------------------------------
     2. 常駐迷你播放列：主播放器捲出畫面時出現，點擊轉發給真正的播放鍵
     ------------------------------------------------------------------------ */
  function setupMiniPlayer() {
    if (!cfg.mini || !player || !playButton || !("IntersectionObserver" in window)) return;
    var logo = document.querySelector(".hero-logo, .brand img");
    var mini = document.createElement("aside");
    mini.className = "nr-mini";
    mini.setAttribute("aria-label", "迷你播放列");
    mini.innerHTML =
      '<button type="button" aria-label="播放線上直播">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path class="play-icon" d="M8 5.5v13l10.5-6.5L8 5.5z"></path>' +
          '<path class="pause-icon" d="M7 5.5h3.5v13H7v-13zm6.5 0H17v13h-3.5v-13z"></path>' +
        '</svg></button>' +
      '<div class="nr-mini-text"><strong>FM99.5 現場直播</strong><span aria-live="polite"></span></div>' +
      '<div class="nr-mini-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>';
    document.body.appendChild(mini);

    var btn = mini.querySelector("button");
    var text = mini.querySelector(".nr-mini-text span");
    var miniBars = Array.prototype.slice.call(mini.querySelectorAll(".nr-mini-bars span"));
    var listenVisible = true;

    btn.addEventListener("click", function () { playButton.click(); });

    function sync() {
      var playing = isPlaying();
      mini.classList.toggle("is-playing", playing);
      mini.classList.toggle("has-visualizer", player.classList.contains("has-visualizer"));
      btn.setAttribute("aria-label", playing ? "暫停線上直播" : "播放線上直播");
      if (statusEl) text.textContent = statusEl.textContent;
      mini.classList.toggle("is-shown", !listenVisible);
    }
    new MutationObserver(sync).observe(player, { attributes: true, attributeFilter: ["class"] });
    if (statusEl) new MutationObserver(sync).observe(statusEl, { childList: true, characterData: true, subtree: true });

    new IntersectionObserver(function (entries) {
      listenVisible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(player);

    levelListeners.push(function (levels) {
      if (!levels) { miniBars.forEach(function (b) { b.style.removeProperty("--level"); }); return; }
      // 16 → 5：取代表性區段
      var pick = [1, 3, 6, 9, 13];
      for (var i = 0; i < miniBars.length; i++) miniBars[i].style.setProperty("--level", levels[pick[i]].toFixed(3));
    });
    sync();
  }

  /* ------------------------------------------------------------------------
     3. Media Session：手機鎖定畫面 / 耳機按鍵 / 車機顯示電台資訊與播放控制
     ------------------------------------------------------------------------ */
  function setupMediaSession() {
    if (!cfg.mediaSession || !audio || !playButton || !("mediaSession" in navigator)) return;
    var logo = document.querySelector('meta[property="og:image"]');
    var art = logo ? logo.getAttribute("content") : "";
    function setMeta() {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "FM99.5 現場直播",
          artist: "雲端新廣播 New Radio",
          album: "好聲音・好陪伴・好生活",
          artwork: art ? [{ src: art, sizes: "801x553", type: "image/png" }] : []
        });
        navigator.mediaSession.setActionHandler("play", function () { if (!isPlaying()) playButton.click(); });
        navigator.mediaSession.setActionHandler("pause", function () { if (isPlaying()) playButton.click(); });
        navigator.mediaSession.setActionHandler("stop", function () { if (isPlaying()) playButton.click(); });
        // 直播沒有進度，明確停用快轉避免系統顯示無效按鈕
        ["seekbackward", "seekforward", "seekto"].forEach(function (a) {
          try { navigator.mediaSession.setActionHandler(a, null); } catch (e) {}
        });
      } catch (e) {}
    }
    audio.addEventListener("playing", function () {
      setMeta();
      navigator.mediaSession.playbackState = "playing";
    });
    audio.addEventListener("pause", function () { navigator.mediaSession.playbackState = "paused"; });
  }

  /* ------------------------------------------------------------------------
     4. 標題逐字進場：<h1 data-split data-split-delay="120ms" data-split-stagger="45ms">
     以 Intl.Segmenter 切字素（中文一字一格、emoji 不被拆壞）；aria-label 保留原文。
     ------------------------------------------------------------------------ */
  function setupSplitText() {
    if (!cfg.split || reduceMotion) return;
    var els = document.querySelectorAll("[data-split]");
    if (!els.length) return;
    var seg = ("Intl" in window && Intl.Segmenter) ? new Intl.Segmenter("zh-Hant", { granularity: "grapheme" }) : null;
    function graphemes(s) {
      if (seg) return Array.from(seg.segment(s), function (x) { return x.segment; });
      return Array.from(s);
    }
    els.forEach(function (el) {
      if (el.querySelector(".nr-char")) return;
      var text = el.textContent;
      el.setAttribute("aria-label", text.trim());
      if (el.dataset.splitDelay) el.style.setProperty("--split-delay", el.dataset.splitDelay);
      if (el.dataset.splitStagger) el.style.setProperty("--split-stagger", el.dataset.splitStagger);
      var frag = document.createDocumentFragment(), i = 0;
      graphemes(text).forEach(function (g) {
        var s = document.createElement("span");
        s.className = "nr-char" + (/\s/.test(g) ? " is-space" : "");
        s.setAttribute("aria-hidden", "true");
        s.textContent = /\s/.test(g) ? " " : g;
        s.style.setProperty("--i", i++);
        frag.appendChild(s);
      });
      el.textContent = "";
      el.appendChild(frag);
    });
  }

  /* ------------------------------------------------------------------------
     5. 跑馬燈：<div data-marquee data-marquee-duration="40s"><a>…</a>…</div>
     把子元素包成 track 並複製一份做無縫循環；hover / focus 暫停。
     也提供 window.NRKit.marqueeFill(el, items) 給動態資料（podcast-latest.json）。
     ------------------------------------------------------------------------ */
  function buildMarquee(el, items) {
    el.classList.add("nr-marquee");
    el.textContent = "";
    if (el.dataset.marqueeDuration) el.style.setProperty("--marquee-duration", el.dataset.marqueeDuration);
    function track(hidden) {
      var t = document.createElement("div");
      t.className = "nr-marquee-track";
      if (hidden) t.setAttribute("aria-hidden", "true");
      items.forEach(function (it) {
        var a = document.createElement(it.url ? "a" : "span");
        a.className = "nr-marquee-item" + (it.live ? " is-live" : "");
        if (it.url) { a.href = it.url; if (/^https?:/.test(it.url)) { a.target = "_blank"; a.rel = "noopener"; } }
        if (hidden) a.setAttribute("tabindex", "-1");
        var small = document.createElement("small"); small.textContent = it.label || "";
        a.appendChild(small);
        a.appendChild(document.createTextNode(it.title || ""));
        t.appendChild(a);
      });
      return t;
    }
    // 兩份 track 併成一條 2× 寬的帶子，位移 -50% 即無縫
    var wrap = document.createElement("div");
    wrap.className = "nr-marquee-track";
    var a = track(false), b = track(true);
    Array.prototype.slice.call(b.children).forEach(function (c) { a.appendChild(c); }); // 先快照再搬，live collection 邊搬邊迭代會漏一半
    el.appendChild(a);
    if (reduceMotion) {
      // 不動：只留一份、可水平捲動
      Array.prototype.slice.call(a.children, items.length).forEach(function (c) { c.remove(); });
    }
  }
  function setupMarquee() {
    if (!cfg.marquee) return;
    document.querySelectorAll("[data-marquee]").forEach(function (el) {
      var items = Array.prototype.map.call(el.children, function (c) {
        return {
          title: c.getAttribute("data-title") || c.textContent.trim(),
          label: c.getAttribute("data-label") || "",
          url: c.getAttribute("href") || "",
          live: c.hasAttribute("data-live")
        };
      });
      if (items.length) buildMarquee(el, items);
    });
  }

  window.NRKit = {
    marqueeFill: function (el, items) { if (el && items && items.length) buildMarquee(el, items); },
    onLevels: function (fn) { levelListeners.push(fn); }
  };

  function boot() {
    setupVisualizer();
    setupMiniPlayer();
    setupMediaSession();
    setupSplitText();
    setupMarquee();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}());
