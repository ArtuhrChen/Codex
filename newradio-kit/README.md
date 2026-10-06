# newradio-kit — 雲端新廣播官網 UI 強化套件

從七站研究（`skills/vibe-ui-arsenal`）挑出**最適合 FM99.5 官網**的技術，重寫成零依賴的原生 CSS/JS。
不改你現有架構（Apache 靜態站、無 build、`newradio.js` 的直播容錯邏輯一行不動），加兩個檔案就生效。

## 為什麼是這幾樣，不是 React 元件

官網是純 HTML/CSS/原生 JS，已經有 reveal 進場、reduced-motion、a11y、直播 failover。
把 React Bits / Aceternity 裝進去等於整站重寫，違反「已經 work 的不要重構」。
所以做法是**拿技術不拿套件**：每一樣都對應研究裡的來源，但用你站上既有的 token 重寫。

| 模組 | 來源技術 | 為什麼適合電台站 |
|---|---|---|
| 1. 真實音訊頻譜 | CodePen Web Audio 視覺化 | 你現在的 16 根 bar 是假的 CSS 律動。接上 AnalyserNode 後它會跟著主持人的聲音跳，這是電台站最有「活著」感的一件事 |
| 2. 常駐迷你播放列 | 21st.dev audio player / Dock 手法 | 聽眾往下看 Podcast 或節目表時，播放鍵不會消失；手機上這是留住收聽的關鍵 |
| 3. Media Session | 標準 Web API（補強，非七站） | 鎖定畫面、耳機、車機顯示「雲端新廣播 FM99.5」與 logo，可直接暫停 |
| 4. 標題逐字進場 | React Bits SplitText | 「雲端新廣播」五個字 60ms 階梯浮現，是整頁唯一的一次性驚喜，不搶播放鍵 |
| 5. 節目 / 集數跑馬燈 | MagicUI Marquee | 把 Podcast 最新集數和「直播中」做成一條安靜流動的帶子，hover 暫停 |
| 6. 站點規格書 prompt | MotionSites 寫法 | 以後叫 AI 改版，貼上去就不會變成藍色 SaaS 樣板 |

刻意**沒拿**的：粒子、極光、3D 卡片、霓虹。你的站是紙本編輯風，這些會打架。

## 安裝（3 步）

1. 把 `newradio-kit.css` 和 `newradio-kit.js` 放到站上（例如 `css/` 與 `js/`）。
2. `index.html` 的 `<head>` 加一行，`</body>` 前加一行（放在 `ui.js` 之後）：
   ```html
   <link rel="stylesheet" href="css/newradio-kit.css">
   ...
   <script src="js/newradio-kit.js" defer></script>
   ```
3. 想要逐字進場就在標題加屬性，想要跑馬燈就放一個容器：
   ```html
   <h1 id="hero-title" data-split data-split-delay="120ms" data-split-stagger="60ms">雲端新廣播</h1>
   <p class="slogan" data-split data-split-delay="520ms" data-split-stagger="40ms">雲端之上，聽見未來</p>

   <div data-marquee data-marquee-duration="45s">
     <a href="#listen" data-label="Live" data-live>FM99.5 現場直播</a>
     <a href="https://www.newradio.com.tw/Podcast/" data-label="Podcast">金曲悄悄話</a>
   </div>
   ```
   跑馬燈也能吃 `podcast-latest.json`：
   ```js
   fetch("podcast-latest.json").then(r => r.json()).then(d =>
     NRKit.marqueeFill(document.querySelector("[data-marquee]"),
       [{ title: "FM99.5 現場直播", label: "Live", url: "#listen", live: true }]
         .concat(d.episodes.map(e => ({ title: e.title, label: e.date || "Podcast", url: e.url })))));
   ```

關掉任一模組：在 `newradio-kit.js` 之前放
```html
<script>window.NR_KIT = { marquee: false };</script>
```

## 頻譜的一個前提：CORS

Web Audio 要讀到直播資料，音源必須帶 `Access-Control-Allow-Origin`。
`https://live.arthur.com.tw/` 目前回 `access-control-allow-origin: *`（2026-10-06 實測），所以可以。
套件會把 `audio.crossOrigin` 設成 `anonymous`；萬一哪天中繼站把這個 header 拿掉，
主音源會載入失敗，`newradio.js` 會照原本邏輯切到同網域的 `stream.php` 備援，收聽不中斷，
只是頻譜退回 CSS 律動（套件在 1.5 秒內偵測到全 0 就自動退場）。
備援 `stream.php` 是同網域，頻譜照樣能讀。

## 驗證過的事（headless Chromium，`demo/demo.html?demo=osc`）

- 標題 5 字、slogan 9 字正確切成字素，`aria-label` 保留原文，螢幕閱讀器讀到完整句子。
- 跑馬燈 8 項 × 2 份無縫循環；`prefers-reduced-motion` 時不動、只留一份可水平捲。
- 迷你播放列：首屏隱藏，捲過 `#listen` 後浮出，播放狀態與狀態文字跟主播放器同步，點擊轉發給真正的播放鍵。
- 頻譜：16 根 bar 各自拿到 0–1 的 `--level`，分頁隱藏時停止 rAF。
- reduced-motion 下逐字進場不啟動、跑馬燈 `animation: none`。
- 沒有新增任何 JS 錯誤（沙箱裡的直播連線失敗是環境造成，與套件無關）。

沒驗證到的：真實直播的頻譜手感（沙箱連不到音源，用振盪器代替），以及 iOS Safari 的 Media Session 畫面。
上線後請在手機實聽一次，頻譜太跳或太平可以調 `newradio-kit.js` 裡的 `smoothingTimeConstant`（.72）與 `Math.pow(v, 1.35)`。

## 檔案

```
newradio-kit/
├── newradio-kit.css             四個模組的樣式 + 三種降級
├── newradio-kit.js              五個模組（visualizer / mini / mediaSession / split / marquee）
├── newradio-site-spec.prompt.md 給 AI 的站點規格書
└── demo/                        官網首頁快照 + 套件，離線可開；?demo=osc 用振盪器測頻譜
```
