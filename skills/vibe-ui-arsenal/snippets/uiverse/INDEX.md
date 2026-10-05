# Uiverse 精選片段索引

來源：`uiverse-io/galaxy`（MIT）。每個資料夾含原始 `<name>.html`（HTML＋`<style>`，或純 Tailwind class）與 `SOURCE.txt`（作者、Uiverse 網址、tags、授權）。Uiverse 網址為 `https://uiverse.io/<author>/<slug>` 格式，未能用 curl 實測（Cloudflare 403）。

## A. 網頁 UI（15）

| # | 分類 | 資料夾 | 作者 | 型別 | 大小 | 說明 | 適用場景 |
|---|---|---|---|---|---|---|---|
| 1 | Buttons | `Buttons/0x-Sarthak_hungry-penguin-30/` | 0x-Sarthak | CSS | 1295 B | CTA 箭頭按鈕：hover 時白色圓點橫向展開成深色底、箭頭滑入 | Landing page 主 CTA、聯絡我們按鈕 |
| 2 | Buttons | `Buttons/AKAspidey01_orange-donkey-78/` | AKAspidey01 | Tailwind | 904 B | Tailwind 版「返回」按鈕：綠色圖示區塊 hover 時延展填滿 | Tailwind 專案的返回/上一步按鈕，可直接貼 JSX |
| 3 | Buttons | `Buttons/elijahgummer_short-bird-25/` | elijahgummer | CSS | 1843 B | 玻璃擬態黑底按鈕，hover 四邊流光（shimmer） | 深色 Hero 區的次要 CTA |
| 4 | Buttons | `Buttons/LilaRest_chilly-moth-52/` | LilaRest | CSS | 1538 B | 擬物（neumorphism）愛心按鈕，點擊彈性放大、變色 | 文章/作品按讚、收藏 |
| 5 | Cards | `Cards/emmanuelh-dev_yellow-grasshopper-99/` | emmanuelh-dev | Tailwind | 1610 B | Tailwind 黑底定價卡（方案名／價格／CTA） | 定價頁、SaaS 方案比較 |
| 6 | Cards | `Cards/PriyanshuGupta28_sour-rat-57/` | PriyanshuGupta28 | CSS | 913 B | 極簡深色 Toast 訊息條（文字＋勾勾圖示） | 操作成功提示、表單送出回饋 |
| 7 | Toggle-switches | `Toggle-switches/JkHuger_itchy-turtle-45/` | JkHuger | CSS | 3216 B | 太陽／月亮主題切換開關（純 CSS，背景色漸變） | Dark mode 切換鈕 |
| 8 | Tooltips | `Tooltips/MohamedAboSeada_bitter-skunk-14/` | MohamedAboSeada | CSS | 1890 B | hover 浮出圓角 tooltip 卡片，附「Got It」按鈕與指示線 | 功能導覽、欄位說明 |
| 9 | Inputs | `Inputs/garerim_rare-moth-56/` | garerim | CSS | 1142 B | 膠囊形搜尋框，內嵌放大鏡 SVG，focus 展開 | 導覽列搜尋、列表篩選 |
| 10 | Checkboxes | `Checkboxes/catraco_hungry-squid-59/` | catraco | CSS | 2138 B | 勾選時爆出放射線條的慶祝動畫 checkbox | 待辦清單、同意條款 |
| 11 | Radio-buttons | `Radio-buttons/elijahgummer_soft-firefox-40/` | elijahgummer | CSS | 1332 B | 三段式分段按鈕（Left/Middle/Right），多層陰影 jelly 感 | 檢視模式切換、排序選項 |
| 12 | Forms | `Forms/Yaya12085_massive-warthog-99/` | Yaya12085 | Tailwind | 1847 B | Tailwind 深色註冊表單（Email／密碼／確認密碼） | 登入/註冊頁骨架 |
| 13 | loaders | `loaders/adamgiebl_thin-lionfish-5/` | adamgiebl | CSS | 1111 B | 五顆藍點依序脈動的 loading | 資料載入中、按鈕內 loading |
| 14 | loaders | `loaders/Cybercom682_happy-mole-82/` | Cybercom682 | Tailwind | 410 B | Tailwind 虛線圓環 spinner＋「Loading...」文字（支援 dark:） | 頁面級 loading 畫面 |
| 15 | Patterns | `Patterns/adamgiebl_curvy-earwig-79/` | adamgiebl | CSS | 639 B | 深色方格網格背景（純 CSS gradient，可調 --color） | Hero 背景、Dashboard 底圖 |

## B. 遊戲 UI（10）

| # | 分類 | 資料夾 | 作者 | 型別 | 大小 | 說明 | 適用場景 |
|---|---|---|---|---|---|---|---|
| 1 | Buttons | `Buttons/barisdogansutcu_heavy-dragon-15/` | barisdogansutcu | CSS | 607 B | Windows 95 風格灰色凹凸按鈕，按下時陰影反轉 | 復古像素風遊戲的選單/對話框按鈕 |
| 2 | Buttons | `Buttons/TanimMahbub_selfish-goat-90/` | TanimMahbub | CSS | 740 B | 橘色粗邊厚底「卡通 3D」按鈕，按下會下沉 2px | 休閒遊戲 Start / Play 按鈕 |
| 3 | Buttons | `Buttons/carlosepcc_heavy-emu-25/` | carlosepcc | Tailwind | 388 B | Tailwind 一行搞定的 3D 遊戲按鈕（border-b 厚度隨 hover/active 變化） | React+Tailwind 遊戲 HUD 按鈕，零 CSS |
| 4 | Buttons | `Buttons/SelfMadeSystem_terrible-rat-80/` | SelfMadeSystem | CSS | 1504 B | 多層 box-shadow 堆出的插畫風 3D 按鈕（CSS 變數可換色） | RPG 選單、技能按鈕 |
| 5 | Buttons | `Buttons/namecho_slippery-moth-23/` | namecho | CSS | 1818 B | 賽博龐克 glitch 文字按鈕，hover 時 clip-path 切片抖動 | 科幻/駭客題材的主選單 |
| 6 | Buttons | `Buttons/zjssun_tidy-sloth-40/` | zjssun | CSS | 719 B | 霓虹藍發光按鈕（text-shadow + box-shadow 多層光暈） | 夜店/霓虹風格遊戲 UI |
| 7 | Buttons | `Buttons/Cevorob_serious-shrimp-82/` | Cevorob | CSS | 946 B | 「GAME ON」十字準星按鈕，hover 游標變 crosshair、框線收縮 | 射擊/FPS 類遊戲開始按鈕 |
| 8 | Toggle-switches | `Toggle-switches/vinodjangid07_quick-moth-22/` | vinodjangid07 | CSS | 1640 B | 圓形電源鍵開關，開啟時青色霓虹光暈 | 遊戲設定頁的音效/音樂開關 |
| 9 | loaders | `loaders/JaydipPrajapati1910_strong-zebra-9/` | JaydipPrajapati1910 | CSS | 1051 B | 綠色電池格逐格填滿的 loader（steps 動畫） | HP／能量條、充能進度、關卡載入 |
| 10 | Notifications | `Notifications/alexruix_gentle-octopus-87/` | alexruix | CSS | 1901 B | 頭像＋「Player reached level 15!」滑入式通知 | 升級、成就解鎖、戰鬥紀錄 toast |

## 使用方式

1. 開 `<name>.html`，把 `<style>` 內容抽到 `X.module.css`（或保留 Tailwind class 直接進 JSX）。
2. HTML 片段改成 JSX（`class`→`className`、自閉合標籤、`for`→`htmlFor`）。
3. 把寫死的顏色/尺寸改成 CSS 變數或 props。
4. 署名：在元件檔頂端保留 `/* From Uiverse.io by <author> */` 註解即可。
