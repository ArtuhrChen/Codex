# Uiverse 與 CodePen 參考手冊（給 React 網頁／瀏覽器遊戲開發）

> 📁 文中提到的 `raw/…` 原始資料不進版控；執行 `bash skills/vibe-ui-arsenal/scripts/update-sources.sh` 會重新抓到 `skills/vibe-ui-arsenal/.cache/`。

> 整理日期：2026-10-05。資料來源：本機 clone 的 `uiverse-io/galaxy`（HEAD commit 2024-09-02，shallow clone）、
> raw.githubusercontent.com 上的 galaxy README/LICENSE、blog.codepen.io 官方文件。
> 網址驗證規則：下列直接網址皆以 `curl -A "Mozilla/5.0"` 實測回 200；標「未能實測（Cloudflare 擋）」者為 uiverse.io / codepen.io 主站路徑（curl 回 403），格式來自官方 README、commit 訊息或官方文件。

---

## 第一部分：Uiverse（https://uiverse.io — 未能實測（Cloudflare 擋））

### 1.1 一句話定位
Uiverse 是「社群投稿、單檔 HTML+CSS（或純 Tailwind class）的開源小控件庫」：按鈕、卡片、開關、loader、tooltip 等，每個元素零依賴、複製即用。官方把全部元素自動鏡像到 GitHub repo `uiverse-io/galaxy`（README：https://raw.githubusercontent.com/uiverse-io/galaxy/main/README.md）。

### 1.2 授權
- 全部元素 **MIT License**（LICENSE：https://raw.githubusercontent.com/uiverse-io/galaxy/main/LICENSE，`Copyright (c) 2023 Uiverse.io`）。
- README 原文：「attribution 非必須，但深受感謝」—— 建議在元件檔頂端保留原本就有的註解
  `/* From Uiverse.io by <author> - Tags: ... */`，等於同時署名原作者與 Uiverse。
- 注意：galaxy repo **不接受 PR**，只能在 uiverse.io 投稿後由官方自動同步。

### 1.3 兩種元素：CSS vs Tailwind
| 型別 | 檔案長相 | 佔比（本機統計） | 進 React 的方式 |
|---|---|---|---|
| CSS 元素 | `<html 片段>` + `<style>...</style>`，第一行註解在 `<style>` 內 | 3,369 / 3,802（88.6%） | 抽 `<style>` 到 `.module.css` |
| Tailwind 元素 | 只有 HTML，class 全是 Tailwind utility；註解 `<!-- From Uiverse.io by ... tailwindcss -->` 在最上方 | 433 / 3,802（11.4%） | `class`→`className` 直接貼 JSX |

判斷法：`grep -L "<style" <file>` 沒有 `<style>` 的就是 Tailwind 元素。全部 3,802 個檔案 **都不含 `<script>`**（0 個），所以沒有任何 JS 邏輯；需要互動狀態時自己用 React state 接。

### 1.4 galaxy 本機 repo 統計（3,802 個元素、927 位作者）
| 分類資料夾 | 元素數 | 其中 Tailwind | 備註 |
|---|---|---|---|
| Buttons | 1,231 | 149 | 最大宗；3d / neon / glitch / game 標籤多在這 |
| Cards | 726 | 124 | 定價卡、產品卡、通知卡、toast 都歸這裡 |
| loaders | 718 | 21 | spinner、進度條、電池、文字 loading |
| Toggle-switches | 260 | 19 | 含 47 個 `light&dark` 主題切換（全站） |
| Inputs | 226 | 36 | 搜尋框、OTP、檔案上傳 |
| Forms | 180 | 51 | 登入/註冊/訂閱表單 |
| Checkboxes | 171 | 14 | |
| Patterns | 103 | 0 | 純 CSS 背景圖樣（網格、點陣、棋盤） |
| Radio-buttons | 102 | 6 | 含分段按鈕（segmented） |
| Tooltips | 62 | 13 | |
| Notifications | 23 | 0 | 數量最少，tag 幾乎只有 `notification` |

熱門 tag（出現次數）：button 1247、loader 705、card 698、simple 463、animation 385、hover 304、gradient 193、material design 139、3d 115、neumorphism 112、glassmorphism 62、neon 48、glitch 9、pixel/retro/8-bit 約 8、game 15。
→ **遊戲風格元素其實很少**（pixel/retro 不到 10 個），Uiverse 的強項是通用網頁控件；遊戲 UI 多半要拿 3d/neon/glitch 按鈕改色改字。

產量最高作者：vinodjangid07（120）、Yaya12085（103）、Javierrocadev（78）、andrew-demchenk0（74）、Shoh2008（69）。

### 1.5 檔案結構（實測）
```
raw/galaxy/
├── LICENSE            # MIT
├── README.md
├── Buttons/           # 每個元素 = 一個 .html 檔，沒有子資料夾
│   ├── 0x-Sarthak_hungry-penguin-30.html
│   └── ...
├── Cards/  Checkboxes/  Forms/  Inputs/  Notifications/
├── Patterns/  Radio-buttons/  Toggle-switches/  Tooltips/  loaders/
```
- **沒有** 每元素的 README、metadata.json、截圖；作者與 tags 只存在檔案內那一行註解。
- 檔名格式：`<author>_<slug>.html`，slug 固定是 `<形容詞>-<動物>-<數字>`（如 `hungry-penguin-30`）。
  3,799 / 3,802 符合此格式；例外是作者名本身含底線（`pandey_saurav_`、`i_vickykrishna`、`bek_uz`），解析時請用「最後一個底線」切。
- 內容第一行（CSS 元素是 `<style>` 內第一行）：`/* From Uiverse.io by <author> - Tags: a, b, c */`。

### 1.6 從檔名反推 uiverse.io 網址
格式：`https://uiverse.io/<author>/<slug>`
- 證據：galaxy 的 commit 訊息就是這個格式，例如 HEAD commit
  `Launching a new loader to space! 🚀 - https://uiverse.io/Cksunandh/helpless-moose-39`
  對應檔案 `loaders/Cksunandh_helpless-moose-39.html`。
- 範例：`Buttons/0x-Sarthak_hungry-penguin-30.html` → https://uiverse.io/0x-Sarthak/hungry-penguin-30 — 未能實測（Cloudflare 擋，curl 回 403；`/elements`、`/buttons`、`/sitemap.xml`、`/api/elements` 亦皆 403）。
- 一行 bash：`f=Buttons/0x-Sarthak_hungry-penguin-30.html; n=${f##*/}; n=${n%.html}; echo "https://uiverse.io/${n%_*}/${n##*_}"`

### 1.7 精選 25 個（已複製到 `snippets/uiverse/<分類>/<檔名>/`，含原始 .html + SOURCE.txt）
完整表格（作者、型別、說明、場景）見 `snippets/uiverse/INDEX.md`。摘要：

**A. 網頁用（15）**
| 分類 | 檔名 | 作者 | 一句話 |
|---|---|---|---|
| Buttons | 0x-Sarthak_hungry-penguin-30 | 0x-Sarthak | CTA 箭頭按鈕，hover 圓點展開 |
| Buttons | AKAspidey01_orange-donkey-78 | AKAspidey01 | Tailwind「返回」按鈕 |
| Buttons | elijahgummer_short-bird-25 | elijahgummer | 玻璃擬態四邊流光按鈕 |
| Buttons | LilaRest_chilly-moth-52 | LilaRest | 擬物愛心按讚鈕 |
| Cards | emmanuelh-dev_yellow-grasshopper-99 | emmanuelh-dev | Tailwind 黑底定價卡 |
| Cards | PriyanshuGupta28_sour-rat-57 | PriyanshuGupta28 | 極簡 toast |
| Toggle-switches | JkHuger_itchy-turtle-45 | JkHuger | 太陽/月亮 dark mode 開關 |
| Tooltips | MohamedAboSeada_bitter-skunk-14 | MohamedAboSeada | 浮出式 tooltip 卡＋Got It |
| Inputs | garerim_rare-moth-56 | garerim | 膠囊搜尋框 |
| Checkboxes | catraco_hungry-squid-59 | catraco | 勾選放射慶祝動畫 |
| Radio-buttons | elijahgummer_soft-firefox-40 | elijahgummer | 三段式分段按鈕 |
| Forms | Yaya12085_massive-warthog-99 | Yaya12085 | Tailwind 深色註冊表單 |
| loaders | adamgiebl_thin-lionfish-5 | adamgiebl | 五點脈動 loading |
| loaders | Cybercom682_happy-mole-82 | Cybercom682 | Tailwind 虛線圓環 spinner（支援 dark:） |
| Patterns | adamgiebl_curvy-earwig-79 | adamgiebl | 深色方格網格背景 |

**B. 遊戲 UI 用（10）**
| 分類 | 檔名 | 作者 | 一句話 |
|---|---|---|---|
| Buttons | barisdogansutcu_heavy-dragon-15 | barisdogansutcu | Win95 凹凸復古按鈕（607 B） |
| Buttons | TanimMahbub_selfish-goat-90 | TanimMahbub | 卡通厚底 3D 按鈕，按下下沉 |
| Buttons | carlosepcc_heavy-emu-25 | carlosepcc | Tailwind 一行 3D 遊戲按鈕（388 B，tag: game） |
| Buttons | SelfMadeSystem_terrible-rat-80 | SelfMadeSystem | 插畫風多層陰影 3D 按鈕，CSS 變數換色 |
| Buttons | namecho_slippery-moth-23 | namecho | 賽博龐克 glitch 文字按鈕 |
| Buttons | zjssun_tidy-sloth-40 | zjssun | 霓虹藍光暈按鈕 |
| Buttons | Cevorob_serious-shrimp-82 | Cevorob | 「GAME ON」十字準星按鈕 |
| Toggle-switches | vinodjangid07_quick-moth-22 | vinodjangid07 | 電源鍵霓虹開關（音效/音樂開關） |
| loaders | JaydipPrajapati1910_strong-zebra-9 | JaydipPrajapati1910 | 電池格逐格填滿 → HP／能量條 |
| Notifications | alexruix_gentle-octopus-87 | alexruix | 「Player reached level 15!」滑入通知 |

其他值得一看但未複製（檔案過大或含商標）：`Buttons/Galahhad_odd-yak-40`（pixelart，15 KB）、`Buttons/StealthWorm_polite-mole-15`（synthwave 網格地平線，4.7 KB）、`Notifications/Praashoo7_ugly-walrus-48`（Mario 像素通知，124 KB）、`loaders/Pradeepsaranbishnoi_neat-swan-21`（Windows XP 開機條）、`Inputs/MijailVillegas_grumpy-horse-85`（cyberpunk 輸入框）。

### 1.8 把純 CSS 元素用進 React／Tailwind 專案：三種作法
**作法 A：CSS Module（最快、最不會污染全域）**
1. 把 `<style>` 內容存成 `NeonButton.module.css`；若選擇器是裸 `button {}`，改成 `.btn {}`（Uiverse 很多元素直接寫 `button`、`input` 等標籤選擇器，會污染全頁）。
2. HTML 片段轉 JSX：`class`→`className={styles.btn}`、`for`→`htmlFor`、`<input>`/`<path>` 自閉合、`style="..."` 轉物件、SVG 屬性 `clip-rule`→`clipRule`、`stroke-width`→`strokeWidth`。
3. 把寫死的顏色、尺寸抽成 CSS 變數（`--accent`）或 props；保留頂端 `/* From Uiverse.io by ... */` 作署名。

**作法 B：styled-components / Emotion / vanilla-extract**
把整段 CSS 貼進 `` styled.button`...` ``，巢狀選擇器（`.cta:before`、`.cta svg`）改成 `&:before`、`& svg`；@keyframes 用 `keyframes` helper。適合需要靠 props 切變體（`$variant="danger"`）的遊戲按鈕。

**作法 C：轉 Tailwind**
簡單樣式（padding、radius、單層 shadow、transition）直接對映 utility；複雜的多層 `box-shadow`、`clip-path`、`@keyframes` 放進 `tailwind.config` 的 `theme.extend`（`boxShadow`、`keyframes`、`animation`）或用 arbitrary value `shadow-[0_0_20px_#008cff]`。Uiverse 已有 433 個 Tailwind 元素可直接搜（`grep -L "<style"`），優先拿這些。

**和 MagicUI / React Bits 的分工**
| | Uiverse | MagicUI / React Bits |
|---|---|---|
| 形式 | 單檔 HTML+CSS，零依賴，無 JS | React 元件，常依賴 framer-motion / tailwind / three |
| 擅長 | 小控件：按鈕、開關、checkbox、loader、tooltip、背景 pattern | 區塊級動效：Hero、文字動畫、粒子背景、marquee、bento grid |
| 互動 | 只有 :hover / :active / :checked | 有狀態、有 scroll/pointer 事件 |
| 用法建議 | 版面已定、要「換一顆更有感的按鈕/開關」時 | 整個區塊需要動起來時 |
原則：**頁面骨架與大動效交給 MagicUI/React Bits，表單控件與遊戲 HUD 小按鈕拿 Uiverse 改色**，兩邊都 MIT，可混用。

### 1.9 即時取得最新內容
```bash
# 完整歷史很大，shallow clone 就夠（約 3,800 檔）
git clone --depth 1 https://github.com/uiverse-io/galaxy.git raw/galaxy
# 之後更新
git -C raw/galaxy pull --depth 1

# 依 tag 關鍵字搜（不分大小寫）
grep -rli "Tags:.*\(neon\|glitch\|pixel\|retro\|game\)" raw/galaxy --include=*.html
# 只找 Tailwind 元素
grep -L "<style" raw/galaxy/Buttons/*.html
# 找小檔（< 1.5 KB，通常最好改）
find raw/galaxy/Buttons -name '*.html' -size -1500c
# 列出某作者全部作品
ls raw/galaxy/*/vinodjangid07_*
# 看 tag 排行
grep -rhoi "Tags: [^*>]*" raw/galaxy --include=*.html | sed 's/Tags: //' | tr ',' '\n' | sed 's/^ *//' | sort | uniq -c | sort -rn | head -40
```
注意：本機 clone HEAD 是 2024-09-02，`git pull` 前無法確認 repo 是否仍持續同步；若 uiverse.io 上有新元素但 repo 沒有，就只能到站上手動複製（站上每個元素頁有「Get code」按鈕 — 未能實測（Cloudflare 擋））。

---

## 第二部分：CodePen（https://codepen.io — 未能實測（Cloudflare 擋））

### 2.1 一句話定位
CodePen 是「線上即時編輯＋預覽的 HTML/CSS/JS 沙盒社群」：任何前端效果（含 Canvas、WebGL、GSAP 動畫、小遊戲）都能以一個 Pen 存在、被 fork、被嵌入。它不是元件庫，而是一個可執行的範例海。

### 2.2 授權（官方文件，實測 200）
- 文件：https://blog.codepen.io/documentation/licensing/
- 原文摘要：「**public Pens are MIT Licensed**, private Pens are owned by you with no implicit license.」公開 Pen 自動套 MIT，license 文字會出現在 Details View 以及 Full Page view 的 HTML 原始碼中。
- 署名格式（官方給的 header）：`<!-- Copyright (c) YEAR - YOUR NAME - URL TO ORIGINAL ... MIT ... -->`。
- 實務：搬一個 Pen 進專案時，把 Pen URL＋作者名寫進檔案頂端註解即可。Export .zip 時官方也會自動附 MIT license 檔與 README.markdown。
- 注意 Private Pen（PRO 功能）**沒有**任何預設授權，不能直接拿。

### 2.3 「內容量太大不好找」的解法：一套實用搜尋法
1. **站內搜尋**（未能實測（Cloudflare 擋）；路徑格式 `https://codepen.io/search/pens?q=<關鍵字>`）：結果頁可切 Pens / Projects / Collections，排序選 **Most Hearted**（愛心數 = 社群品質票）或 **Most Viewed**，再用 Depth filter 排除 fork。官方文件說 **forked pens 不會出現在全站搜尋**（https://blog.codepen.io/documentation/forks/），所以搜到的都是原作。
2. **Tags**（https://blog.codepen.io/documentation/tags/）：每個 Pen 最多 5 個 tag，tag 有公開頁面 `https://codepen.io/tag/<tag>`（未能實測）。常用 tag：`css-animation`、`canvas`、`game`、`threejs`、`gsap`、`svg`。
3. **Topics**：官方策展主題頁（`https://codepen.io/topics` — 未能實測），依技術（CSS Grid、Canvas、Three.js…）分類，每個 topic 下有 Picked Pens。
4. **Collections**（https://blog.codepen.io/documentation/collections/）：使用者可把任何人的 Pen 收進 Collection，而且 Collection 可再包 Collection —— 找到一個好 Pen 後，看作者的 Collections 常能撈到同主題一整包。
5. **Spark**：CodePen 每週電子報／精選頁（`https://codepen.io/spark` — 未能實測），適合瀏覽近期熱門；文件站上 /documentation/spark/ 只是舊 blog 文，實際內容在主站。
6. **Picks / Trending**：首頁 Trending 與 Picked Pens 是官方編輯挑選，品質高但偏炫技。
7. **Google `site:codepen.io`**（最可靠、不需登入、可用引號與減號）：
   `site:codepen.io "health bar" css -three.js`。Google 索引的是 Pen 標題與描述，所以要用作者會寫的英文詞。
8. **看作者**：找到一個對味的，進作者頁（`https://codepen.io/<user>/pens/popular` — 未能實測）看他最受歡迎的作品，常比搜尋快。

### 2.4 拿到 Pen 之後：看、抓、搬
| 動作 | 怎麼做 | 官方文件 |
|---|---|---|
| Full Page view | Change View → Full Page；或 URL `/pen/` 改 `/full/`。預覽仍在 sandboxed iframe | https://blog.codepen.io/documentation/full-page-view/ |
| Debug view | URL `/pen/` 改 `/debug/`；**無 header、無 iframe、不改你的 JS**，是測效能／看 Canvas 遊戲真實表現的唯一正確視圖。免費帳號只能看自己的 Pen，PRO 才能分享 | https://blog.codepen.io/documentation/debug-view/ |
| Export .zip | 編輯器 footer → Export → Export .zip。zip 內 `/src/` 是原碼（含 scss/ts 等預處理原檔）、`/dist/` 是編譯後可直接開的 index.html，外部資源以 `<link>`/`<script>` 連結不打包 | https://blog.codepen.io/documentation/exporting-pens/ |
| 直接抓單一面板原始碼 | 在 Pen URL 後加副檔名：`.html` `.css` `.js`（編譯後）或 `.scss` `.babel` `.typescript`（原碼）。官方註明「不要在正式環境引用這些 URL」 | https://blog.codepen.io/documentation/url-extensions/ |
| 看愛心數／views／授權／留言 | Details View（`/details/`） | https://blog.codepen.io/documentation/details-view/ |
| Fork 再改 | Fork 會複製全部程式碼與依賴，描述自動附上原作連結 | https://blog.codepen.io/documentation/forks/ |
| 外部資源 | Settings → JS/CSS 的 External Resources（CDN、npm 套件、甚至另一個 Pen 的 .js） | https://blog.codepen.io/documentation/adding-external-resources/ |
| ES Modules | Pen 可 `import` 另一個 Pen 的 `.js` URL；Pen 編輯器會自動補 `type="module"` | https://blog.codepen.io/documentation/es-modules-on-codepen/ |
| 被 CodePen 剝掉的東西 | 表單送出、頁面跳轉等會被 strip，搬出來時行為可能不同 | https://blog.codepen.io/documentation/things-we-strip/ |

**把 Pen 搬進 React 的步驟**
1. 先看 Settings（齒輪）：HTML 預處理器（Pug/Haml？）、CSS 預處理器（SCSS/Less？）、JS 預處理器（Babel/TS？）與 External Resources（GSAP、Three、p5、jQuery？）。沒看就搬，80% 的失敗來自漏了外部資源。
2. 用 `.html` / `.css` / `.js` 副檔名 URL 抓**編譯後**版本（或 Export .zip 取 `/dist/`），避免自己再裝預處理器。
3. 建元件：HTML → JSX（`class`→`className`、`for`→`htmlFor`、自閉合、inline style 物件）；CSS → `.module.css`，若原作用 `body {}`、`* {}`、`html {}` 全域選擇器，改成包在元件 root class 下。
4. JS 邏輯：`document.querySelector(...)` 改 `useRef`；`window.addEventListener` / `requestAnimationFrame` / `setInterval` 放進 `useEffect` 並在 cleanup 中移除／`cancelAnimationFrame`；Canvas 遊戲把 `canvas` 元素給 `ref`，初始化放 `useEffect`。
5. 外部函式庫改成 npm 安裝（`npm i gsap three`），把 CDN `<script>` 換成 `import`。
6. 檔案頂端寫 `// Adapted from https://codepen.io/<user>/pen/<slug> by <name> (MIT)`。
7. 若只是想「看效果決定要不要用」，先用 Embed 嵌到 Storybook／Notion 比較（https://blog.codepen.io/documentation/embedded-pens/）。

### 2.5 網頁／遊戲最常搜的 10 個效果關鍵字（Google site: 搜尋連結，皆實測 200）
| # | 關鍵字 | 用途 | 搜尋連結 |
|---|---|---|---|
| 1 | css glitch text | 科幻標題、Game Over 畫面 | https://www.google.com/search?q=site%3Acodepen.io+css+glitch+text |
| 2 | canvas particles | 爆炸、擊中粒子、背景星空 | https://www.google.com/search?q=site%3Acodepen.io+canvas+particles |
| 3 | parallax scroll | Landing page 分層滾動、橫向卷軸遊戲背景 | https://www.google.com/search?q=site%3Acodepen.io+parallax+scroll |
| 4 | card hover 3d | 作品卡、卡牌遊戲手牌傾斜 | https://www.google.com/search?q=site%3Acodepen.io+card+hover+3d |
| 5 | loading animation | 頁面／關卡載入 | https://www.google.com/search?q=site%3Acodepen.io+loading+animation |
| 6 | health bar css | HP／MP 條、Boss 血條 | https://www.google.com/search?q=site%3Acodepen.io+health+bar+css |
| 7 | pixel art css | box-shadow 像素畫、8-bit 圖示 | https://www.google.com/search?q=site%3Acodepen.io+pixel+art+css |
| 8 | retro crt effect | 掃描線、螢幕弧面、復古濾鏡 | https://www.google.com/search?q=site%3Acodepen.io+retro+crt+effect |
| 9 | typewriter effect | RPG 對話框逐字出現 | https://www.google.com/search?q=site%3Acodepen.io+typewriter+effect |
| 10 | screen shake javascript | 受傷震動、爆炸回饋（game feel） | https://www.google.com/search?q=site%3Acodepen.io+screen+shake+javascript |

搜尋技巧：加 `"vanilla"` 排除 jQuery 版；加 `-three.js` 或 `-jquery` 去雜訊；想要 React 版加 `react`（CodePen 支援 Babel/JSX，有不少 React Pen）。

### 2.6 CodePen 獨有、其他六站沒有的能力
1. **即時可編輯、即時預覽**：改一個數字馬上看結果，是「調參數試手感」最快的環境；Uiverse/MagicUI 等都只是靜態展示＋複製碼。
2. **可 fork、有版本史、可嵌入**：fork 保留原作連結，Pen 每次儲存都有版本（https://blog.codepen.io/documentation/pens/），Embed 可嵌進文件或 Storybook。
3. **有 JS 邏輯，不只 UI**：Canvas/WebGL 遊戲原型、物理模擬、GSAP 時間軸、音訊視覺化、鍵盤控制 —— 這是元件庫做不到的。遊戲開發時「找一個現成的 canvas 粒子系統然後改」比從零寫快很多。
4. **預處理器與外部套件開箱即用**：SCSS、TypeScript、Babel/JSX、Pug、再加任意 CDN／npm 套件，不用本機 build。
5. **Debug view 無 iframe 真實執行**：測 requestAnimationFrame 效能、DevTools context 直接對、沒有 CodePen 注入的防無限迴圈 JS。
6. **URL 副檔名直接取碼、ES Module 跨 Pen import**：可把一個 Pen 當小型函式庫給另一個 Pen 用。
7. **Templates**（https://blog.codepen.io/documentation/templates/）：把「React + Tailwind + GSAP」設定存成 Pen Template，之後一鍵開新沙盒。
8. **社群訊號**：hearts / views / comments / Picks 可當品質排序，Uiverse 的 galaxy repo 完全沒有這類 metadata。

**限制**（https://blog.codepen.io/documentation/limitations/）：免費帳號 Pen 皆公開、Debug view 只能看自己的、檔案數有上限；且 Pen 多半是「demo 等級」程式碼（全域變數、無清理），搬進 React 時務必做 2.4 第 4 步的 cleanup。

---

## 附錄：本次驗證紀錄
- 200：raw.githubusercontent.com 的 galaxy README / LICENSE；blog.codepen.io/documentation/ 下 licensing、exporting-pens、full-page-view、debug-view、forks、collections、embedded-pens、tags、url-extensions、es-modules-on-codepen、details-view、templates、pens、adding-external-resources、things-we-strip、limitations；10 個 Google site: 搜尋連結。
- 403（Cloudflare）：uiverse.io 全部路徑（含 /elements、/buttons、/sitemap.xml、/api/elements、/<author>/<slug>）、codepen.io 全部路徑（含 /search、/topics、/spark、/trending、/collections）、github.com。
- 404：blog.codepen.io/documentation/topics/、/searching/、/picked-pens/（這些功能文件不存在於 docs 站，故本文對 Topics/Spark/排序的描述來自主站功能常識，未能實測）。
- 產出：`refs/uiverse-codepen.md`（本檔）、`snippets/uiverse/INDEX.md`、`snippets/uiverse/<分類>/<檔名>/{<檔名>.html, SOURCE.txt}` × 25。
