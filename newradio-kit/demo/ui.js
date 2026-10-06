// 介面層互動：頂欄捲動邊緣陰影 + 段落進場顯示。
// 與播放器邏輯（newradio.js）完全分離，這裡壞了不影響收聽。
(function () {
  var header = document.querySelector(".site-header");

  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  // 進場顯示：不支援 IntersectionObserver 或使用者要求減少動態時，完全不掛 class，
  // 內容維持原樣可見（漸進增強，永不因 JS 失敗而空白）。
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    return;
  }

  var targets = document.querySelectorAll(
    ".radio-player, .weather-now, .editorial-panel, .entry-strip a, .paper-card, .about-section > *"
  );

  // 進場結束後把 reveal 類別整組拆掉：.reveal 的 transition 會蓋掉
  // 卡片自己的 hover 過場（時間變長還帶階梯延遲），不能留在元素上
  function finishReveal(el) {
    el.classList.add("is-visible");
    setTimeout(function () {
      el.classList.remove("reveal", "is-visible");
      el.style.removeProperty("--reveal-delay");
    }, 1000);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        finishReveal(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

  // 保底：IntersectionObserver 在部分省電或內嵌瀏覽器可能延遲甚至不回呼。
  // 動畫沒了只是小事，內容永遠隱形是大事，時間到一律強制顯示。
  setTimeout(function () {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      observer.unobserve(el);
      finishReveal(el);
    });
  }, 4000);

  targets.forEach(function (el, index) {
    // 已在首屏可見的元素不做進場，避免載入時整頁閃動
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      return;
    }

    // 同一排卡片給極小的階梯延遲，形成節奏而非等待
    el.style.setProperty("--reveal-delay", (index % 4) * 0.06 + "s");
    el.classList.add("reveal");
    observer.observe(el);
  });
}());
