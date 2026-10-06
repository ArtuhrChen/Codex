/* ==========================================================================
   site.js — 2026-10 改版互動層：現在播出 / 今日節目 / 主持人聲紋卡 /
   Podcast Hub（含站內播放器）/ 公開資訊。
   原則：全部漸進增強；任何資料讀不到就留原本的靜態內容與連結，收聽不受影響。
   與 newradio.js（直播播放器）只透過 DOM 狀態互動，不改它的程式。
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var liveAudio = $("[data-audio]");
  var livePlayer = $(".radio-player");
  var liveButton = $("[data-play]");

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.indexOf("data-") === 0 || k.indexOf("aria-") === 0 || k === "role" || k === "hidden" || k === "href" || k === "target" || k === "rel" || k === "type" || k === "src" || k === "alt" || k === "width" || k === "height" || k === "loading" || k === "datetime" || k === "open") n.setAttribute(k, attrs[k]);
      else n[k] = attrs[k];
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(url + " " + r.status); return r.json(); });
  }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  function firstGrapheme(s) {
    try { return Array.from(new Intl.Segmenter("zh-Hant", { granularity: "grapheme" }).segment(s))[0].segment; } catch (e) { return Array.from(s)[0] || ""; }
  }
  function fmtTime(sec) { sec = Math.max(0, Math.floor(sec || 0)); var m = Math.floor(sec / 60), s = sec % 60; var h = Math.floor(m / 60); m = m % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0"); }

  /* ------------------------------------------------------------------------
     台北時間（不受瀏覽器時區影響）
     ------------------------------------------------------------------------ */
  var taipeiFmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  function taipeiNow() {
    var parts = {};
    taipeiFmt.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var h = parseInt(parts.hour, 10) % 24;
    return { day: parts.weekday, minutes: h * 60 + parseInt(parts.minute, 10), seconds: parseInt(parts.second, 10), hh: String(h).padStart(2, "0"), mm: parts.minute };
  }
  function toMin(t) { var p = t.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }

  /* ------------------------------------------------------------------------
     1. 現在播出 + 2. 今日節目帶 + 3. 主持人聲紋卡（共用 schedule.json）
     ------------------------------------------------------------------------ */
  var schedule = null, currentSlot = null, hostCards = {};

  function slotsFor(dayKey) { return schedule ? (dayKey === "sunday" ? schedule.sunday : schedule.weekday) : []; }
  function todayKey() { return taipeiNow().day === "Sun" ? "sunday" : "weekday"; }
  function findCurrent() {
    var now = taipeiNow(), list = slotsFor(todayKey());
    for (var i = 0; i < list.length; i++) {
      var a = toMin(list[i].start), b = toMin(list[i].end); if (b === 0) b = 1440;
      if (now.minutes >= a && now.minutes < b) return { slot: list[i], index: i, next: list[(i + 1) % list.length], progress: (now.minutes * 60 + now.seconds - a * 60) / ((b - a) * 60) };
    }
    return null;
  }

  function renderNow() {
    var box = $("[data-now]"); if (!box || !schedule) return;
    var cur = findCurrent();
    if (!cur) { box.hidden = true; return; }
    var changed = !currentSlot || currentSlot.slot !== cur.slot;
    currentSlot = cur;
    box.hidden = false;
    $("[data-now-title]", box).textContent = cur.slot.title;
    $("[data-now-hosts]", box).textContent = cur.slot.hosts.length ? "主持：" + cur.slot.hosts.join("、") : "";
    $("[data-now-time]", box).textContent = cur.slot.start + " – " + cur.slot.end;
    $("[data-now-bar]", box).style.width = Math.round(cur.progress * 100) + "%";
    $("[data-now-next]", box).textContent = cur.next ? "接下來 " + cur.next.start + " " + cur.next.title + (cur.next.hosts.length ? "・" + cur.next.hosts.join("、") : "") : "";
    if (changed) {
      // 同步 timeline 與主持人卡的「直播中」狀態
      $$(".slot").forEach(function (s) { s.classList.toggle("is-live", s.dataset.slotIndex === String(cur.index) && s.dataset.day === todayKey()); s.classList.toggle("is-past", s.dataset.day === todayKey() && parseInt(s.dataset.slotIndex, 10) < cur.index); });
      Object.keys(hostCards).forEach(function (name) { hostCards[name].classList.toggle("is-live", cur.slot.hosts.indexOf(name) !== -1); });
      updateMediaSessionTitle();
    }
  }
  function updateMediaSessionTitle() {
    if (!("mediaSession" in navigator) || !livePlayer || !livePlayer.classList.contains("is-playing") || !currentSlot) return;
    try {
      var art = $('meta[property="og:image"]'); var src = art ? art.getAttribute("content") : "";
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSlot.slot.title + (currentSlot.slot.hosts.length ? "・" + currentSlot.slot.hosts.join("、") : ""),
        artist: "雲端新廣播 FM99.5 現場直播", album: currentSlot.slot.start + " – " + currentSlot.slot.end,
        artwork: src ? [{ src: src, sizes: "801x553", type: "image/png" }] : []
      });
    } catch (e) {}
  }

  function renderTimeline(dayKey) {
    var wrap = $("[data-timeline]"); if (!wrap || !schedule) return;
    wrap.textContent = "";
    var cur = findCurrent(), isToday = dayKey === todayKey();
    slotsFor(dayKey).forEach(function (s, i) {
      var live = isToday && cur && cur.index === i;
      var d = el("details", { class: "slot" + (live ? " is-live" : "") + (isToday && cur && i < cur.index ? " is-past" : "") + (s.rerun ? " is-rerun" : ""), "data-slot-index": i, "data-day": dayKey }, [
        el("summary", null, [
          el("span", { class: "slot-time", text: s.start + " – " + s.end }),
          el("strong", { class: "slot-title", text: s.title }),
          el("span", { class: "slot-hosts", text: s.hosts.join("、") })
        ]),
        s.summary ? el("p", { class: "slot-summary", text: s.summary }) : null
      ]);
      if (live) d.setAttribute("open", "");
      wrap.appendChild(d);
    });
    if (window.matchMedia("(max-width: 640px)").matches) {
      var liveEl = $(".slot.is-live", wrap); if (liveEl) liveEl.scrollIntoView({ inline: "start", block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  var palette = ["#39bdb7", "#12807c", "#f8ae78", "#e8434a", "#44535c", "#2a9d8f", "#e07a5f", "#3d405b"];
  function waveSVG(name) {
    var h = hashStr(name), bars = 24, w = 200, H = 48, gap = 2, bw = (w - gap * (bars - 1)) / bars;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + H); svg.setAttribute("class", "host-wave"); svg.setAttribute("aria-hidden", "true");
    var seed = h;
    for (var i = 0; i < bars; i++) {
      seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
      var env = Math.sin((i + 1) / (bars + 1) * Math.PI);           // 中間高、兩端低，像一句話的能量包絡
      var r = ((seed >>> 8) % 1000) / 1000;
      var hh = Math.max(4, Math.round((0.25 + 0.75 * r) * env * H));
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", (i * (bw + gap)).toFixed(2)); rect.setAttribute("y", ((H - hh) / 2).toFixed(2));
      rect.setAttribute("width", bw.toFixed(2)); rect.setAttribute("height", hh); rect.setAttribute("rx", "1.5");
      rect.style.setProperty("--i", i);
      svg.appendChild(rect);
    }
    return svg;
  }
  function renderHosts() {
    var grid = $("[data-hosts]"); if (!grid || !schedule) return;
    grid.textContent = "";
    var slotsByHost = {};
    ["weekday", "sunday"].forEach(function (k) {
      slotsFor(k).forEach(function (s) {
        if (s.rerun) return;
        s.hosts.forEach(function (hName) { (slotsByHost[hName] = slotsByHost[hName] || []).push((k === "sunday" ? "日 " : "一至六 ") + s.start); });
      });
    });
    schedule.hosts.forEach(function (hst) {
      var color = palette[hashStr(hst.name) % palette.length];
      var card = el("article", { class: "host-card" }, [
        el("div", { class: "host-top" }, [
          el("span", { class: "host-mark", text: firstGrapheme(hst.name), "aria-hidden": "true" }),
          el("span", { class: "host-live", text: "ON AIR" })
        ]),
        waveSVG(hst.name),
        el("strong", { class: "host-name", text: hst.name }),
        el("span", { class: "host-shows", text: hst.shows.join("・") }),
        el("span", { class: "host-slots", text: (slotsByHost[hst.name] || []).slice(0, 3).join("　") })
      ]);
      card.style.setProperty("--host-color", color);
      hostCards[hst.name] = card;
      grid.appendChild(card);
    });
  }

  function setupSchedule() {
    getJSON("data/schedule.json").then(function (data) {
      schedule = data;
      renderHosts();
      renderTimeline(todayKey());
      renderNow();
      setInterval(renderNow, 30000);
      $$(".day-switch [data-day]").forEach(function (b) {
        if (b.dataset.day === todayKey()) { $$(".day-switch [data-day]").forEach(function (x) { x.setAttribute("aria-selected", "false"); }); b.setAttribute("aria-selected", "true"); }
        b.addEventListener("click", function () {
          $$(".day-switch [data-day]").forEach(function (x) { x.setAttribute("aria-selected", "false"); });
          b.setAttribute("aria-selected", "true");
          renderTimeline(b.dataset.day);
        });
      });
      if (liveAudio) liveAudio.addEventListener("playing", function () { setTimeout(updateMediaSessionTitle, 0); });
    }).catch(function () { /* 保留靜態 fallback */ });
  }

  /* ------------------------------------------------------------------------
     4. Podcast Hub：節目卡、集數清單、站內播放器（與直播互斥）
     ------------------------------------------------------------------------ */
  var pod = null, showIndex = {}, currentShow = "all", episodeCache = {}, pageSize = 20, shownCount = 0, currentList = [];
  var pp = { box: $("[data-pod-player]"), audio: $("[data-pod-audio]") };
  var currentEp = null;

  function showMeta(id) { return showIndex[id] || { title: "雲端新播客", cover: "", id: id }; }
  function coverFor(ep) { var s = showMeta(ep.show); return s.cover || ep.cover || (pod && pod.channel.cover) || "assets/shows/default.png"; }

  function renderShowGrid() {
    var grid = $("[data-show-grid]"); if (!grid) return;
    grid.textContent = "";
    var all = pod.shows.concat(pod.collections.filter(function (c) { return c.episodeCount >= 2; }));
    all.forEach(function (s) {
      var isNew = s.latest && (Date.now() - new Date(s.latest).getTime()) < 1000 * 86400 * 21;
      var fallback = function () { var f = el("div", { class: "show-fallback", text: firstGrapheme(s.title), "aria-hidden": "true" }); f.style.setProperty("--fb", palette[hashStr(s.title) % palette.length]); return f; };
      var media = s.cover ? el("img", { src: s.cover, alt: "", loading: "lazy", width: 320, height: 320 }) : fallback();
      if (s.cover) media.addEventListener("error", function () { media.replaceWith(fallback()); });
      var btn = el("button", { type: "button", class: "show-card" + (isNew ? " is-new" : ""), "aria-pressed": "false", "data-show-id": s.id }, [
        media,
        el("div", { class: "show-body" }, [
          el("strong", { text: s.title }),
          el("small", { text: s.episodeCount + " 集" + (s.host && s.host !== "雲端新廣播" ? "・" + s.host : "") + (s.latest ? "・最新 " + s.latest.slice(5).replace("-", "/") : "") })
        ])
      ]);
      btn.addEventListener("click", function () { selectShow(s.id, true); });
      grid.appendChild(btn);
    });
  }
  function renderTabs() {
    var tabs = $("[data-show-tabs]"); if (!tabs) return;
    pod.shows.forEach(function (s) {
      var b = el("button", { type: "button", role: "tab", "data-show": s.id, "aria-selected": "false", text: s.title });
      tabs.appendChild(b);
    });
    var more = el("button", { type: "button", role: "tab", "data-show": "more", "aria-selected": "false", text: "更多系列 " + pod.collections.length });
    tabs.appendChild(more);
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-show]"); if (!b) return;
      if (b.dataset.show === "more") { $("[data-show-grid]").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); return; }
      selectShow(b.dataset.show, false);
    });
  }
  function selectShow(id, scroll) {
    currentShow = id;
    $$("[data-show-tabs] [data-show]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.show === id)); });
    $$(".show-card").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.showId === id)); });
    var title = $("[data-episode-title]");
    if (id === "all") { title.textContent = "最新集數"; currentList = pod.latest; renderEpisodes(true); }
    else {
      title.textContent = showMeta(id).title;
      var load = episodeCache[id] ? Promise.resolve(episodeCache[id]) : getJSON("data/episodes/" + encodeURIComponent(id) + ".json").then(function (l) { episodeCache[id] = l; return l; });
      $("[data-episode-list]").innerHTML = '<li class="data-fallback">讀取中…</li>';
      load.then(function (list) { currentList = list; renderEpisodes(true); }).catch(function () { $("[data-episode-list]").innerHTML = '<li class="data-fallback">集數暫時讀取失敗，請稍後再試。</li>'; });
    }
    if (scroll) $(".episode-head").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
  function renderEpisodes(reset) {
    var list = $("[data-episode-list]"); if (!list) return;
    if (reset) { list.textContent = ""; shownCount = 0; }
    var slice = currentList.slice(shownCount, shownCount + pageSize);
    slice.forEach(function (ep, i) {
      var s = showMeta(ep.show);
      var li = el("li", { class: "episode" + (reduceMotion ? "" : " nr-in") + (currentEp && currentEp.id === ep.id ? " is-current" : ""), "data-ep-id": ep.id }, [
        el("button", { type: "button", class: "ep-play", "aria-label": "播放 " + ep.title, html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5L8 5.5z"/></svg>' }),
        el("div", { class: "ep-main" }, [
          currentShow === "all" ? el("span", { class: "ep-show", text: s.title }) : null,
          el("strong", { class: "ep-title", text: ep.title }),
          el("span", { class: "ep-meta", text: [ep.date, ep.durationText].filter(Boolean).join("・") }),
          ep.description && currentShow !== "all" ? el("span", { class: "ep-desc", text: ep.description }) : null
        ]),
        el("a", { class: "ep-open", href: ep.url, target: "_blank", rel: "noopener", text: "SoundOn ↗" })
      ]);
      li.style.setProperty("--i", i);
      $(".ep-play", li).addEventListener("click", function () { playEpisode(ep); });
      list.appendChild(li);
    });
    shownCount += slice.length;
    var more = $("[data-episode-more]");
    if (more) { more.hidden = shownCount >= currentList.length; more.textContent = "載入更多（還有 " + (currentList.length - shownCount) + " 集）"; }
  }

  /* 站內播放器 */
  function playEpisode(ep) {
    if (!pp.audio || !ep.audio) { window.open(ep.url, "_blank", "noopener"); return; }
    if (currentEp && currentEp.id === ep.id) { togglePod(); return; }
    currentEp = ep;
    pp.box.hidden = false;
    $("[data-pod-cover]").src = coverFor(ep);
    $("[data-pod-show]").textContent = showMeta(ep.show).title;
    $("[data-pod-title]").textContent = ep.title;
    $("[data-pod-open]").href = ep.url;
    $$(".episode").forEach(function (li) { li.classList.toggle("is-current", li.dataset.epId === ep.id); });
    pp.audio.src = ep.audio;
    var saved = 0; try { saved = parseFloat(localStorage.getItem("nr-pod-pos:" + ep.id) || "0"); } catch (e) {}
    pp.audio.currentTime = 0;
    pp.audio.play().then(function () { if (saved > 20) pp.audio.currentTime = saved; }).catch(function () {});
    pauseLive();
  }
  function togglePod() { if (!pp.audio.src) return; if (pp.audio.paused) { pp.audio.play().catch(function () {}); pauseLive(); } else pp.audio.pause(); }
  function pauseLive() { if (livePlayer && livePlayer.classList.contains("is-playing") && liveButton) liveButton.click(); }
  function setupPodPlayer() {
    if (!pp.box || !pp.audio) return;
    $("[data-pod-toggle]").addEventListener("click", togglePod);
    $("[data-pod-back]").addEventListener("click", function () { pp.audio.currentTime = Math.max(0, pp.audio.currentTime - 15); });
    $("[data-pod-fwd]").addEventListener("click", function () { pp.audio.currentTime = Math.min(pp.audio.duration || 0, pp.audio.currentTime + 30); });
    var seek = $("[data-pod-seek]"), timeEl = $("[data-pod-time]"), seeking = false;
    seek.addEventListener("input", function () { seeking = true; if (pp.audio.duration) timeEl.textContent = fmtTime(seek.value / 1000 * pp.audio.duration) + " / " + fmtTime(pp.audio.duration); });
    seek.addEventListener("change", function () { if (pp.audio.duration) pp.audio.currentTime = seek.value / 1000 * pp.audio.duration; seeking = false; });
    pp.audio.addEventListener("timeupdate", function () {
      if (!pp.audio.duration) return;
      if (!seeking) seek.value = Math.round(pp.audio.currentTime / pp.audio.duration * 1000);
      timeEl.textContent = fmtTime(pp.audio.currentTime) + " / " + fmtTime(pp.audio.duration);
      if (currentEp && Math.floor(pp.audio.currentTime) % 5 === 0) { try { localStorage.setItem("nr-pod-pos:" + currentEp.id, String(pp.audio.currentTime)); } catch (e) {} }
    });
    pp.audio.addEventListener("play", function () { pp.box.classList.add("is-playing"); $("[data-pod-toggle]").setAttribute("aria-label", "暫停"); setPodMediaSession(); });
    pp.audio.addEventListener("pause", function () { pp.box.classList.remove("is-playing"); $("[data-pod-toggle]").setAttribute("aria-label", "播放"); });
    pp.audio.addEventListener("ended", function () {
      try { localStorage.removeItem("nr-pod-pos:" + currentEp.id); } catch (e) {}
      var i = currentList.findIndex(function (e) { return e.id === currentEp.id; });
      if (i !== -1 && currentList[i + 1]) playEpisode(currentList[i + 1]);
    });
    // 直播開始時，暫停 Podcast
    if (liveAudio) liveAudio.addEventListener("play", function () { if (!pp.audio.paused) pp.audio.pause(); });
  }
  function setPodMediaSession() {
    if (!("mediaSession" in navigator) || !currentEp) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: currentEp.title, artist: showMeta(currentEp.show).title, album: "雲端新播客", artwork: [{ src: coverFor(currentEp), sizes: "640x640", type: "image/jpeg" }] });
      navigator.mediaSession.setActionHandler("play", function () { pp.audio.play(); });
      navigator.mediaSession.setActionHandler("pause", function () { pp.audio.pause(); });
      navigator.mediaSession.setActionHandler("seekbackward", function () { pp.audio.currentTime = Math.max(0, pp.audio.currentTime - 15); });
      navigator.mediaSession.setActionHandler("seekforward", function () { pp.audio.currentTime = Math.min(pp.audio.duration || 0, pp.audio.currentTime + 30); });
    } catch (e) {}
  }
  function setupPodcast() {
    getJSON("data/podcast.json").then(function (data) {
      pod = data;
      pod.shows.concat(pod.collections).forEach(function (s) { showIndex[s.id] = s; });
      renderTabs();
      renderShowGrid();
      selectShow("all", false);
      var more = $("[data-episode-more]"); if (more) more.addEventListener("click", function () { renderEpisodes(false); });
      setupPodPlayer();
      // 首屏右欄「最新上架」：三集（newradio.js 也會用 podcast-latest.json 填，這裡用同一份資料覆蓋成一致內容）
      var side = $("[data-podcast-list]");
      if (side) {
        side.textContent = "";
        pod.latest.slice(0, 3).forEach(function (ep, i) {
          var a = el("a", { href: "#podcast" }, [el("span", { text: String(i + 1).padStart(2, "0") }), el("div", null, [el("strong", { text: ep.title }), el("small", { text: showMeta(ep.show).title + "・" + ep.date })])]);
          a.addEventListener("click", function (e) { e.preventDefault(); $("#podcast").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); playEpisode(ep); });
          side.appendChild(a);
        });
      }
      var feat = $("[data-feature-podcast]");
      if (feat && pod.latest[0]) { $("h2", feat).textContent = pod.latest[0].title; $("p", feat).textContent = showMeta(pod.latest[0].show).title + "・" + pod.latest[0].date + "。點進 Podcast 專區，站內直接播放。"; $("span", feat).textContent = "Latest"; feat.href = "#podcast"; }
    }).catch(function () { /* 保留靜態 fallback */ });
  }

  /* ------------------------------------------------------------------------
     5. 公開資訊（NCC）
     ------------------------------------------------------------------------ */
  function setupNotices() {
    getJSON("data/notices.json").then(function (data) {
      var facts = $("[data-station]"), list = $("[data-notices]");
      var st = data.station || {};
      var rows = [["電台名稱", st.name], ["頻率", st.frequency], ["廣播執照字號", st.licenseNo], ["執照有效期間", st.licenseValid], ["服務區域", st.coverage], ["電台地址", st.address], ["聯絡電話", st.phone], ["開播年份", st.founded]];
      if (facts) { facts.textContent = ""; rows.forEach(function (r) { if (!r[1]) return; var todo = /請填寫/.test(r[1]); facts.appendChild(el("div", null, [el("dt", { text: r[0] }), el("dd", { class: todo ? "is-todo" : "", text: r[1] })])); }); }
      if (list) {
        list.textContent = "";
        (data.items || []).forEach(function (it) {
          list.appendChild(el("li", { class: "notice" }, [
            el("time", { datetime: it.date, text: it.date.replace(/-/g, ".") }),
            el("div", null, [it.type ? el("span", { class: "notice-type", text: it.type }) : null, el("strong", { text: it.title }), it.body ? el("p", { text: it.body }) : null])
          ]));
        });
        if (!data.items || !data.items.length) list.innerHTML = '<li class="data-fallback">目前沒有公告。</li>';
      }
    }).catch(function () {});
  }

  /* ------------------------------------------------------------------------
     6. 天氣溫度數字滾動（CountUp 手法）：監看 newradio.js 填入的文字
     ------------------------------------------------------------------------ */
  function setupCountUp() {
    if (reduceMotion) return;
    $$("[data-weather-temp]").forEach(function (node) {
      var obs = new MutationObserver(function () {
        var m = /^(-?\d+)°C$/.exec(node.textContent); if (!m) return;
        obs.disconnect();
        var target = parseInt(m[1], 10), start = performance.now(), dur = 900;
        (function tick(t) {
          var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
          node.textContent = Math.round(target * e) + "°C";
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
      obs.observe(node, { childList: true, characterData: true, subtree: true });
    });
  }

  function boot() { setupSchedule(); setupPodcast(); setupNotices(); setupCountUp(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
}());
