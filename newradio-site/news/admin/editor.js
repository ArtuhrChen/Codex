/* 消息編輯器：所見即所得、圖片上傳、表情符號、即時預覽（零依賴） */
(function () {
  "use strict";
  var ed = document.getElementById("nr-editor"), form = document.getElementById("nr-form"), hidden = document.getElementById("nr-html");
  var preview = document.querySelector("#nr-preview .news-body"), status = document.getElementById("nr-upload-status");
  var file = document.getElementById("nr-file"), panel = document.getElementById("nr-emoji"), csrf = form.querySelector('[name="csrf"]').value;
  if (!ed) return;

  function focusEd() { ed.focus(); }
  function exec(cmd, val) { focusEd(); document.execCommand(cmd, false, val || null); sync(); }
  function insertHTML(html) { focusEd(); document.execCommand("insertHTML", false, html); sync(); }
  function sync() { hidden.value = ed.innerHTML; preview.innerHTML = ed.innerHTML; }

  // 工具列
  document.querySelectorAll(".nr-toolbar [data-cmd]").forEach(function (b) { b.addEventListener("click", function () { exec(b.dataset.cmd); }); });
  document.querySelectorAll(".nr-toolbar [data-block]").forEach(function (b) { b.addEventListener("click", function () {
    // 按「標題」時若游標所在那一行已經有字，先換新行再變標題，不會把整句吃掉
    if (b.dataset.block === "h3") {
      var sel = window.getSelection(), node = sel && sel.anchorNode, block = node && (node.nodeType === 1 ? node : node.parentElement);
      while (block && block !== ed && !/^(P|DIV|H3|H4|LI)$/.test(block.tagName)) block = block.parentElement;
      if (block && block !== ed && block.textContent.trim()) { focusEd(); document.execCommand("insertParagraph"); }
    }
    exec("formatBlock", b.dataset.block);
  }); });
  document.querySelector("[data-link]").addEventListener("click", function () {
    var url = prompt("要連到哪個網址？（例如 https://www.facebook.com/newradio995）", "https://");
    if (url && /^https?:\/\//.test(url)) exec("createLink", url);
  });
  document.querySelector("[data-image]").addEventListener("click", function () { file.click(); });
  file.addEventListener("change", function () { if (file.files[0]) upload(file.files[0]); file.value = ""; });

  // 貼上 / 拖曳圖片也能上傳
  ed.addEventListener("paste", function (e) {
    var items = (e.clipboardData || {}).items || [];
    for (var i = 0; i < items.length; i++) if (items[i].kind === "file" && /^image\//.test(items[i].type)) { e.preventDefault(); upload(items[i].getAsFile()); return; }
    // 貼純文字，不要把別處的格式一起貼進來
    var text = (e.clipboardData || window.clipboardData).getData("text/plain");
    if (text) { e.preventDefault(); insertHTML(text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")); }
  });
  ed.addEventListener("drop", function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) { e.preventDefault(); upload(f); } });

  function upload(f) {
    status.textContent = "圖片上傳中…";
    var fd = new FormData(); fd.append("file", f); fd.append("csrf", csrf);
    fetch("upload.php", { method: "POST", body: fd, credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.error) { status.textContent = "上傳失敗：" + j.error; return; }
      // 編輯器在 admin/ 底下，要多一層 ../ 才看得到圖；送出時會再換回 uploads/
      insertHTML('<figure><img src="../' + j.url + '" alt="" width="' + j.width + '"></figure><p><br></p>');
      status.textContent = "圖片已放進文章。";
    }).catch(function () { status.textContent = "上傳失敗，請再試一次。"; });
  }

  // 表情符號
  var toggle = document.querySelector("[data-emoji-toggle]");
  toggle.addEventListener("click", function () { panel.hidden = !panel.hidden; toggle.setAttribute("aria-expanded", String(!panel.hidden)); });
  panel.addEventListener("click", function (e) {
    var b = e.target.closest("[data-emoji]"), u = e.target.closest("[data-unicode]");
    if (b) insertHTML('<img class="nr-emoji" src="../emoji/' + b.dataset.emoji + '.svg" alt=":' + b.dataset.emoji + ':" data-emoji="' + b.dataset.emoji + '" width="28" height="28">&nbsp;');
    if (u) insertHTML(u.dataset.unicode);
  });

  ed.addEventListener("input", sync);
  form.addEventListener("submit", function () { sync(); });
  // 圖片路徑：編輯器在 admin/ 下，官網在上一層；存檔時把 ../emoji → emoji、uploads 維持相對 news/
  form.addEventListener("submit", function () {
    hidden.value = ed.innerHTML.replace(/src="\.\.\/emoji\//g, 'src="emoji/');
  });
  // 載入既有內容時反向處理，讓預覽與編輯器看得到圖
  ed.innerHTML = ed.innerHTML.replace(/src="emoji\//g, 'src="../emoji/').replace(/src="uploads\//g, 'src="../uploads/');
  preview.innerHTML = ed.innerHTML;
  form.addEventListener("submit", function () { hidden.value = hidden.value.replace(/src="\.\.\/uploads\//g, 'src="uploads/'); });
  sync();

  // 寫很久也不會被登出：每 5 分鐘跟伺服器打一聲招呼，登入狀態就會延長
  setInterval(function () { fetch("index.php", { credentials: "same-origin", cache: "no-store" }).catch(function () {}); }, 5 * 60 * 1000);

  // 草稿暫存：每次打字都存在這台電腦的瀏覽器裡；不小心關掉或被登出，重開同一頁就能拿回來
  var draftKey = "nr-draft:" + (form.querySelector('[name="id"]').value || "new");
  var titleEl = form.querySelector('[name="title"]');
  function saveDraft() { try { localStorage.setItem(draftKey, JSON.stringify({ title: titleEl.value, html: ed.innerHTML, at: Date.now() })); } catch (e) {} }
  ed.addEventListener("input", saveDraft); titleEl.addEventListener("input", saveDraft);
  form.addEventListener("submit", function () { try { localStorage.removeItem(draftKey); } catch (e) {} });
  try {
    var d = JSON.parse(localStorage.getItem(draftKey) || "null");
    if (d && d.html && d.html !== ed.innerHTML && Date.now() - d.at < 7 * 24 * 3600 * 1000 && confirm("找到上次沒存檔的草稿（" + (d.title || "沒有標題") + "），要接著寫嗎？")) {
      titleEl.value = d.title || titleEl.value; ed.innerHTML = d.html; sync();
    }
  } catch (e) {}
}());
