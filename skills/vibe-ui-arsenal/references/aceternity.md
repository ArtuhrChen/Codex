# Aceternity UI 參考手冊（給 Arthur 的 React 網頁 / 瀏覽器遊戲開發）

> 📁 文中提到的 `raw/…` 原始資料不進版控；執行 `bash skills/vibe-ui-arsenal/scripts/update-sources.sh` 會重新抓到 `skills/vibe-ui-arsenal/.cache/`。

> 整理日期：2026-10-05。所有 URL 皆於當日以 curl 實測回傳 HTTP 200。
> 資料來源：`https://ui.aceternity.com/llms.txt`、`https://ui.aceternity.com/llms-full.txt`（2026-10-02 生成）、`https://ui.aceternity.com/api/components`、各元件文件頁與 registry JSON。

---

## 1. 一句話定位

**Aceternity UI 是「行銷頁視覺特效」取向的 copy-paste React 元件庫**：Tailwind CSS + Motion（前身 Framer Motion）寫成的 TypeScript 原始碼，走 shadcn 模式——程式碼複製進你的專案後就是你的，沒有 runtime 套件、沒有版本升級問題。作者 Manu Arora（@mannupaaji），2023 年創立。

- 免費元件：**112 個**（API 統計；llms-full 說 116，因為把 3 個 free sections 頁與 hook 算進去）
- 付費（All-Access）：180+ 個 Blocks、17 個 Templates、2 個完整 Pages、23 個 Pro Components
- 官方自我定位：與 shadcn/ui **互補**而非競爭——shadcn 管 dialog/form/table 這類應用原件，Aceternity 管 hero、bento、背景特效（來源：llms-full.txt「compared to other libraries」）

## 2. 授權（免費 vs 付費）

### 免費元件的授權條款
官方 llms-full.txt 開頭即聲明：
> Licence: components are free to use in unlimited personal and commercial projects. Reselling or redistributing the components as a competing library is not permitted.

完整條款頁 https://ui.aceternity.com/licence（頁面標題寫 Pro，但「Aceternity License」涵蓋網站上所有可下載項目），重點：

| 可以 | 不可以 |
|---|---|
| 無限數量的個人 / 客戶成品（End Products） | 以原始碼或素材形式重新散布元件（即使有修改） |
| 成品可販售、授權、免費散布 | 在任何 marketplace（含 ui.aceternity.com）轉售元件或衍生品 |
| 修改、合併、做衍生作品 | 拿來做主題 / 模板 / 元件庫去賣 |
| 同一元件多專案重複使用 | — |

**官方明列「Games」為合法 End Product**（licence 頁 Sample End Products 一節），所以瀏覽器遊戲可以放心用。
**注意：這不是 MIT。** 它是自訂授權，差別在「不得重新打包成元件庫/模板販售」。把元件放進你自己的遊戲或網站沒問題；若你想做一套「Arthur UI Kit」拿去賣就不行。另外條款提到部分項目可能內含第三方開源元件，依各自授權。

### 哪些是付費、不要抓
- 網址以 `/blocks/...` 開頭的（Pro Blocks：Hero Sections、Bento Grids、Pricing、Shaders、Illustrations、Text Animations 等 180+ 個）→ 付費
- `/templates/...` 的 17 個模板 → 多數 $49–$79 USD（llms-full 列出 Minimalist Portfolio、Sidefolio 兩個 Price: $0）
- `/pages/...` 的 2 個完整頁 → 需 All-Access
- 定價（llms-full.txt「Pricing」）：Annual $169/年、Lifetime $199 一次付、Team $1590（10 人）。無退款。
- 免費與付費的簡單判別：**只要在 `/components/<slug>` 底下、且 `https://ui.aceternity.com/registry/<name>.json` 不需登入就回 200，就是免費的。** 本報告只涵蓋這些。

## 3. 安裝方式

### 3.1 前置相依（來源：https://ui.aceternity.com/components/add-utilities）
```bash
npm i motion clsx tailwind-merge
```
```ts
// lib/utils.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
- 所有元件 import `@/lib/utils` 的 `cn`，與 shadcn/MagicUI 共用同一支即可。
- 動畫元件 import 的是 `motion/react`（新版 Motion 套件名），不是 `framer-motion`。若專案裝的是 framer-motion，把 import 改成 `framer-motion` 即可，API 相同。
- Tailwind v3 與 v4 都支援；少數元件（aurora-background、meteors 等）需要在 CSS 加 `@theme inline { --animate-xxx ... @keyframes ... }`，各元件文件頁有「Tailwind CSS v4 / v3」切換區塊。
- 3D 類額外要 `three` + `@react-three/fiber`（canvas-reveal-effect、card-spotlight、3d-globe、globe）。

### 3.2 shadcn CLI（三種寫法，來源：https://ui.aceternity.com/components/cli）
```bash
# A. 直接用 registry URL（任何 shadcn CLI 版本皆可）—— 已實測 200
npx shadcn@latest add https://ui.aceternity.com/registry/bento-grid.json

# B. shadcn CLI 3.0 namespace：先在 components.json 加
#   { "registries": { "@aceternity": "https://ui.aceternity.com/registry/{name}.json" } }
npx shadcn@latest add @aceternity/bento-grid

# C. 不用 CLI：到文件頁點 Manual 分頁直接複製
```
**已驗證的 registry URL 模式**：`https://ui.aceternity.com/registry/<name>.json`。
以下 22 個名稱於 2026-10-05 實測回 200：3d-card, aurora-background, background-beams, bento-grid, canvas-reveal-effect, card-spotlight, container-scroll-animation, cover, flip-words, globe, glowing-effect, glowing-stars, grid, hover-border-gradient, lamp, macbook-scroll, meteors, moving-border, shooting-stars, sparkles, spotlight, spotlight-new, stars-background, tabs, text-generate-effect, typewriter-effect, use-outside-click（hook）, sparkles-demo（示範檔）。

**陷阱**：
1. **registry 名稱 ≠ 文件頁 slug**。例：文件 `/components/3d-card-effect` → registry `3d-card`；`lamp-effect` → `lamp`；`github-globe` → `globe`；`glowing-stars-effect` → `glowing-stars`；`shooting-stars-and-stars-background` → 拆成 `shooting-stars` + `stars-background`；`container-cover` → `cover`；`grid-and-dot-backgrounds` → `grid`。正確名稱請以 llms.txt 最後一節「Complete Component List」或 `api/components` 的 `name` 欄位為準。
2. **名稱打錯不是 404 而是 401**（實測 `lamp-effect.json`、`expandable-card.json`、`hero-sections-free.json` 皆回 401）。看到 401 先懷疑名字，不是權限。
3. `expandable-card`、`signup-form`、三個 `*-free` sections 頁沒有 registry 入口，只能從文件頁手動複製（signup-form 的底層是 `input` + `label` 兩個 registry 項）。
4. 每個元件另有 `<name>-demo.json`（如 `sparkles-demo`），抓示範用法時可用。

### 3.3 registry JSON 結構（寫工具時用）
```json
{ "name": "3d-card", "type": "registry:ui", "author": "Manu Arora <hi@manuarora.in>",
  "dependencies": ["motion"], "registryDependencies": ["https://ui.aceternity.com/registry/canvas-reveal-effect.json"],
  "files": [{ "path": "components/ui/3d-card.tsx", "type": "registry:ui", "target": "components/ui/3d-card.tsx", "content": "..." }] }
```
元件原始碼在 `files[].content`；`registryDependencies` 用完整 URL 指向其他元件。

## 4. 完整免費元件目錄（112 個）

> llms.txt 自身的分類重疊且有 80 個塞在「Other Components」，所以這裡採用**官網左側導覽的分類**（擷自 https://ui.aceternity.com/components/cli 的側欄），每格第一欄是文件頁 slug（`https://ui.aceternity.com/components/<slug>`），括號內為 registry 名稱（若不同）。npm 相依來自 `api/components`。

### 4.1 Backgrounds & Effects（背景與特效，30）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| background-beams | SVG 路徑光束背景，hero 經典款，低調 | motion |
| background-beams-with-collision | 光束落下撞擊爆開 | motion |
| background-lines | 波浪狀 SVG 線條背景（height.app 風） | motion |
| background-boxes | 全寬格子背景，hover 亮格 | motion, mini-svg-data-uri |
| background-gradient | 卡片/按鈕底下的動態漸層框 | motion |
| background-gradient-animation | 漸層位置緩慢流動的全幅背景 | — |
| background-ripple-effect | 點擊格子產生漣漪 | motion |
| aurora-background | 極光背景，純 CSS 動畫，需加 keyframes | — |
| wavy-background | Canvas 流動波浪 | simplex-noise |
| vortex | 漩渦粒子背景，CTA 用 | motion, simplex-noise |
| sparkles | tsparticles 閃爍粒子，可做背景或裝飾 | @tsparticles/react+engine+slim, motion |
| meteors | 容器內斜飛流星，需加 keyframes | — |
| glowing-stars-effect（glowing-stars） | 卡片背景星點閃爍 | motion |
| shooting-stars-and-stars-background（shooting-stars + stars-background） | 流星 + Canvas 星空，兩個元件疊用 | — |
| dotted-glow-background | 點陣發光背景 | — |
| noise-background | 噪點 + 漸層流動背景 | — |
| scales | 斜線/橫線/直線重複圖樣背景 | — |
| grid-and-dot-backgrounds（grid） | 最簡單的格線/點陣背景 | — |
| spotlight | 純 Tailwind 的 SVG 聚光燈，超輕量 | — |
| spotlight-new | 左右雙聚光燈可調版 | — |
| lamp-effect（lamp） | Linear 風格的檯燈段落標題 | motion |
| canvas-reveal-effect | Clerk 風 hover 展開點陣（WebGL） | three, @react-three/fiber |
| svg-mask-effect | 滑鼠遮罩揭露底層內容 | motion |
| tracing-beam | 隨捲動延伸的側邊光束 | motion |
| glowing-effect | Cursor 官網風的邊框發光跟隨指標 | lucide-react |
| google-gemini-effect | Gemini 官網的捲動 SVG 線條 | motion |
| cloud-shader | 程序化飄移雲朵 shader | — |
| chromatic-image | 圖片色差分離 + 傾斜互動 | — |
| parallax-hero-images | 滑鼠驅動多層深度視差圖 | motion |
| images-badge | 頭像徽章 hover 展開更多圖 | — |
| webcam-pixel-grid | 即時攝影機像素格效果 | — |

### 4.2 Card Components（卡片，18）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| 3d-card-effect（3d-card） | 滑鼠位置驅動的 3D 透視卡片，子元素可分層浮起 | — |
| card-hover-effect | 多卡片 hover 時背景色塊滑過去 | motion |
| card-spotlight | 卡片聚光燈揭露徑向漸層（內含 canvas-reveal） | motion, three, @react-three/fiber |
| card-stack | 卡片定時輪替疊放，適合 testimonial | motion |
| evervault-card | hover 顯示亂碼文字 + 漸層 | motion |
| glare-card | Linear 風格炫光卡 | — |
| wobble-card | 滑鼠移動時卡片位移縮放 | motion |
| comet-card | Perplexity Comet 風 3D 傾斜卡 | — |
| draggable-card | 可拖曳、會傾斜、碰邊回彈 | — |
| focus-cards | hover 聚焦一張、其餘模糊 | — |
| expandable-card（無 registry，手動複製） | 點擊展開顯示更多內容 | motion, use-outside-click |
| infinite-moving-cards | 無限水平跑馬燈卡片 | — |
| direction-aware-hover | 依滑入方向決定動畫方向 | motion |
| tooltip-card | 跟隨指標的 tooltip 卡 | — |
| keyboard | Mac 鍵盤外觀 + 機械鍵音 | @tabler/icons-react, motion |
| terminal | Mac 風終端機 + 打字效果 | — |
| ascii-art | 圖片轉 ASCII 藝術，可動畫 | motion |
| pixelated-canvas | 圖片像素化 + 滑鼠扭曲（Tailwind 官網風） | — |

### 4.3 Scroll & Parallax（捲動與視差，5）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| macbook-scroll | 捲動時 MacBook 螢幕畫面「浮出」（Fey.com 風） | motion, @tabler/icons-react |
| container-scroll-animation | 捲動時容器 3D 旋轉立起，macbook-scroll 的輕量版 | motion |
| hero-parallax | 多排圖片隨捲動旋轉、位移、淡入 | motion |
| parallax-scroll（parallax-scroll / parallax-scroll-2） | 兩欄反向捲動的圖片牆 | motion |
| sticky-scroll-reveal | 左側文字捲動、右側內容釘住切換 | motion |

### 4.4 Text Components（文字，13）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| text-generate-effect | 文字逐字淡入（含 blur），最常用 | motion |
| typewriter-effect | 打字機效果 | motion |
| flip-words | 單字輪替翻轉 | motion |
| container-text-flip | 單字輪替且容器寬度跟著變 | — |
| layout-text-flip | 翻轉文字並改變周圍排版 | motion |
| text-hover-effect | hover 時文字描邊漸層（x.ai 風） | motion |
| hero-highlight | 背景點陣 + 文字螢光筆 highlight | motion, mini-svg-data-uri |
| text-reveal-card | 滑鼠劃過揭露底層文字 | motion |
| colourful-text | 多彩濾鏡縮放文字 | — |
| encrypted-text | 亂碼逐漸解密成文字 | motion |
| squiggly-text | SVG 擾動波浪文字 | — |
| canvas-text | Canvas 彩色曲線裁切成文字形狀 | — |
| text-flipping-board | Vestaboard 翻牌顯示板 | motion |

### 4.5 Buttons（按鈕，6）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| hover-border-gradient | hover 時漸層邊框繞一圈再填滿 | motion |
| moving-border | 邊框光點繞行的按鈕/卡片 | motion |
| stateful-button | 點擊→loading→成功三態按鈕 | — |
| magnetic-button | 按鈕被游標吸引、放開回彈 | motion |
| tailwindcss-buttons | 純 Tailwind 的一組按鈕樣式 | @tabler/icons-react |
| noise-background | 噪點漸層流動（歸在 Buttons 側欄下，實為背景） | — |

### 4.6 Loaders（載入，3）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| loader | 一組極簡 loader | — |
| multi-step-loader | 多步驟文字輪播 loader | motion, @tabler/icons-react |
| image-generation-loader | 掃描式像素格 loader（AI 生圖感） | — |

### 4.7 Navigation（導覽，8）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| floating-navbar | 往下捲隱藏、往上捲出現的浮動導覽 | motion |
| resizable-navbar | 捲動時寬度收縮的導覽列 | — |
| navbar-menu | hover 展開大型選單 | motion |
| floating-dock | macOS Dock 風格導覽 | motion, @tabler/icons-react |
| sidebar | hover 展開側欄，含手機版 | motion, @tabler/icons-react |
| tabs | 分頁切換，背景區塊滑動 | @radix-ui/react-tabs |
| notch | 釘在上/下緣的浮動 notch 導覽 | motion |
| sticky-banner | 頂部公告橫幅，下捲隱藏 | — |

### 4.8 Inputs & Forms（輸入，4）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| placeholders-and-vanish-input | placeholder 輪播、送出時文字粒子化消散 | motion |
| gooey-input | SVG 黏液濾鏡展開的搜尋框 | motion |
| file-upload | 拖放上傳 + 微互動 | motion, react-dropzone, @tabler/icons-react |
| signup-form（input + label） | shadcn 風表單範例 | motion, @radix-ui/react-label |

### 4.9 Overlays & Popovers（4）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| animated-modal | 複合式動畫 Modal | motion |
| animated-tooltip | 頭像 hover 跟隨指標的 tooltip | motion |
| link-preview | 連結 hover 顯示網頁預覽圖 | motion, @radix-ui/react-hover-card, qss |
| dither-shader | 即時有序抖動濾鏡（像素風） | — |

### 4.10 Carousels & Sliders（4）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| apple-cards-carousel | Apple 官網風卡片輪播 | motion, @tabler/icons-react, use-outside-click |
| carousel | 含微互動的滑桿式輪播 | @tabler/icons-react |
| images-slider | 全頁圖片滑動（鍵盤可控） | motion |
| animated-testimonials | 圖 + 引言的推薦語輪播 | motion, @tabler/icons-react |

### 4.11 Layout & Grid（3）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| bento-grid | 便當格佈局（標題、描述、header 插槽） | @tabler/icons-react（僅 demo 用） |
| layout-grid | 點擊格子放大的 layout 動畫 | motion |
| container-cover（cover） | 包任何內容，hover 出現光束速度感 | motion, sparkles |

### 4.12 Data & Visualization（5）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| github-globe（globe） | GitHub 首頁風 3D 地球弧線 | three, three-globe, @react-three/fiber, @react-three/drei |
| world-map | 點陣世界地圖 + 動畫連線 | motion, dotted-map |
| timeline | 捲動時光束跟隨的時間軸 | motion |
| compare | 兩圖拖曳比較 | motion, @tabler/icons-react |
| code-block | 程式碼區塊 | react-syntax-highlighter, @tabler/icons-react |

### 4.13 Cursor & Pointer（3）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| following-pointer | 自訂游標 + 跟隨內容 | motion |
| pointer-highlight | 進入視窗時用指標 + 邊框標示文字 | — |
| lens | 放大鏡局部放大圖片/影片 | motion |

### 4.14 3D（3）
| slug（registry） | 用途 | 額外相依 |
|---|---|---|
| 3d-globe | 寫實地球 + tooltip/頭像 | three, @react-three/fiber, @react-three/drei |
| 3d-pin | hover 浮起的 3D 圖釘卡 | motion |
| 3d-marquee | 3D 傾斜網格跑馬燈 | — |

### 4.15 Sections and Blocks（免費範例頁，3，無 registry）
- hero-sections-free：一組 hero 版型
- feature-sections-free：一組功能區（含 bento）
- cards-free：一組卡片範例

### 4.16 Hook 與只在 registry 出現的項目
- use-outside-click（hook）：點擊外部關閉（expandable-card、apple-cards-carousel 用）
- moving-line：API 與 registry 有、llms.txt 沒有文件頁（相依 motion），屬未公開/內部用元件，不建議依賴
- parallax-scroll-2：parallax-scroll 的第二版，同一文件頁

## 5. 網頁開發精選 Top 12

手機效能風險：**低** = 純 CSS / 少量 motion；**中** = 持續 rAF 或 scroll-driven；**高** = Canvas/WebGL 持續繪製或大量 DOM 動畫。

| # | 元件 | 用途 | 適用場景 | 相依 | 手機風險 |
|---|---|---|---|---|---|
| 1 | bento-grid | 功能/作品展示格 | 任何 landing 的 features 區、portfolio | 無（icons 僅 demo） | 低 |
| 2 | text-generate-effect | 標題/段落逐字淡入 | hero 標語、章節開場 | motion | 低 |
| 3 | background-beams | 低調光束背景 | 深色 hero、CTA 底 | motion | 低–中（多條 SVG path 動畫） |
| 4 | spotlight | 一道聚光燈 | 深色 hero 左上打光，幾乎零成本 | 無 | 低 |
| 5 | hover-border-gradient | 主要 CTA 按鈕 | 「開始使用」「下載」 | motion | 低 |
| 6 | 3d-card-effect | 產品/作品卡片 | 作品集、商品卡（桌機 hover） | 無 | 低（手機退化為靜態） |
| 7 | aurora-background | 柔和極光背景 | 淺色或深色 hero、登入頁 | 無 + keyframes | 低–中（大面積 blur + filter） |
| 8 | lamp-effect | 段落標題打光 | 深色主題的 section header | motion | 中（大 blur 範圍） |
| 9 | container-scroll-animation | 產品截圖立起 | SaaS hero 的 app 截圖 | motion | 中（scroll-driven，內建 isMobile 縮小） |
| 10 | macbook-scroll | 筆電螢幕浮出 | 桌面 app 介紹頁的招牌動畫 | motion, @tabler/icons-react | 中–高（整頁長 scroll、大量 DOM 鍵帽） |
| 11 | floating-navbar / resizable-navbar | 捲動感知導覽列 | 單頁式網站 | motion / 無 | 低 |
| 12 | animated-testimonials | 推薦語輪播 | 客戶見證區 | motion, @tabler/icons-react | 低 |

備選：timeline（履歷/里程碑）、sticky-scroll-reveal（功能逐步說明）、card-hover-effect（服務列表）、infinite-moving-cards（logo 牆/評價跑馬燈）、stateful-button（表單送出）。

## 6. 遊戲開發精選 Top 8

遊戲場景的重點：**主選單、載入、過場、結算、HUD 包裝**——不是遊戲迴圈本身（迴圈交給 Canvas/Phaser/PixiJS）。Aceternity 元件是 DOM 層，疊在遊戲 canvas 上方或主選單畫面用最合適。

| # | 元件 | 用途 | 適用場景 | 相依 | 手機風險 |
|---|---|---|---|---|---|
| 1 | stars-background + shooting-stars | 星空 + 流星 | 太空/夜景主選單、結算背景 | 無 | 中（Canvas rAF；星數可調） |
| 2 | spotlight / spotlight-new | 聚光燈 | 主選單標題打光、「新角色解鎖」 | 無 | 低 |
| 3 | text-generate-effect | 逐字浮現 | 劇情旁白、關卡開場字幕 | motion | 低 |
| 4 | typewriter-effect | 打字機 | NPC 對話框、終端機風教學 | motion | 低 |
| 5 | multi-step-loader | 分步載入文字 | 載入畫面「生成地圖…載入音效…」 | motion, @tabler/icons-react | 低 |
| 6 | 3d-card-effect / draggable-card | 卡片傾斜/拖曳 | 卡牌遊戲手牌、角色選擇 | 無 | 低（3d-card 手機無 hover；draggable 支援拖曳） |
| 7 | meteors | 流星雨 | 結算卡片、成就彈窗背景 | 無 + keyframes | 低–中（DOM 數 = 流星數，20 以下） |
| 8 | hover-border-gradient / moving-border | 發光按鈕 | 「開始遊戲」「再玩一次」 | motion | 低 |

備選：vortex（Boss 戰/傳送門背景，但 simplex-noise + canvas 持續運算，手機高風險）、background-beams-with-collision（技能命中感）、encrypted-text（駭客/解謎主題）、stateful-button（存檔按鈕）、glowing-effect（選中的道具框）、dither-shader / pixelated-canvas（像素風圖片處理）。
**不建議在遊戲中用**：sparkles（tsparticles 三包很重，且遊戲通常已有自己的粒子系統——見 §8）、canvas-reveal-effect / card-spotlight（額外塞一個 three.js WebGL context，會與遊戲 canvas 搶 GPU）。

## 7. 何時該用 Aceternity、何時該克制

影片提到的缺點（風格不統一、有些太花俏、不適合放在大部分網站）是真的，原因在於它是「特效集」而非「設計系統」：每個元件各自模仿某個名站（Linear、Clerk、Fey、x.ai、Apple、Cursor…），沒有共同的 token 與節奏。

### 判斷準則（五問）
1. **這一頁的主角是誰？** 內容是主角 → 特效只能當背景（spotlight、beams、aurora）；特效是主角（作品集首頁、遊戲主選單）→ 才上 macbook-scroll、hero-parallax 這種「表演型」。
2. **一頁最多幾個「會動的大東西」？** 建議 **1 個 hero 級動畫 + 1 種微互動**。背景 + 卡片 hover + 按鈕光邊 = 已達上限。兩個全幅背景疊加（如 aurora + beams）幾乎一定太花。
3. **名站風格會不會打架？** 同一頁別混 Linear 風（lamp、glare-card）+ Apple 風（apple-cards-carousel）+ 賽博風（encrypted-text、evervault）。選一個「參考站」然後只挑那一系。
4. **觸控與低階裝置怎麼辦？** 所有 hover 類（3d-card、wobble、direction-aware、glowing-effect、following-pointer）在手機上無效或變成純裝飾；Canvas/WebGL 類（vortex、wavy、canvas-reveal、globe）在手機發熱掉幀。至少用 `useReducedMotion`（motion 提供）或媒體查詢降級——Aceternity 元件**沒有內建** `prefers-reduced-motion` 處理（15 個 snippet 中 0 個有），要自己包。
5. **這個效果能不能用 MagicUI 已有的替代？** 能就用 MagicUI（Arthur 的既有庫，風格較統一、Props 較一致）；Aceternity 只補 MagicUI 沒有的（見 §8）。

### 克制好用款（低調、跟多數設計搭得起來）
| 元件 | 為何克制 |
|---|---|
| background-beams | 細線、低對比、不搶內容 |
| spotlight | 一道靜態漸層光，純 Tailwind |
| text-generate-effect | 只在載入時動一次，之後是普通文字 |
| hover-border-gradient | 只在 hover 時動，按鈕尺寸不變 |
| bento-grid | 本質是佈局，動畫只有 hover 位移 |
| 3d-card | 不 hover 就是普通卡片 |
| macbook-scroll | 雖是大動畫，但內容是「你的產品截圖」，不是為了特效而特效；一頁只放一個 |
| aurora-background | 低飽和、慢速（60s 循環），淺色主題也能用 |
| lamp-effect | 一個 section header 用一次 |
| timeline / sticky-scroll-reveal | 動畫服務於閱讀順序 |
| stateful-button / multi-step-loader | 功能性回饋，不是裝飾 |

### 容易「太花俏」的（限定情境再用）
vortex、background-beams-with-collision、wavy-background、google-gemini-effect、hero-parallax、3d-marquee、canvas-reveal-effect、evervault-card、squiggly-text、colourful-text、text-flipping-board、webcam-pixel-grid、keyboard。這些適合作品集 / 遊戲 / 活動頁的「一次性驚喜」，不適合公司官網、文件站、電商。

## 8. 與 MagicUI / React Bits 的重疊與互補

Arthur 已有 MagicUI（BlurFade, TextAnimate, NumberTicker, Particles, Meteors, BorderBeam, MagicCard, ShimmerButton 等）。原則：**重疊的用 MagicUI，Aceternity 只拿它獨有的。**

### 重疊（優先用 MagicUI，省得多裝一套風格）
| 需求 | MagicUI 已有 | Aceternity 對應 | 建議 |
|---|---|---|---|
| 文字進場 | TextAnimate、BlurFade | text-generate-effect、typewriter-effect | 用 MagicUI；Aceternity 的 text-generate 多了 blur 逐字，差異不大 |
| 粒子背景 | Particles | sparkles | **用 MagicUI**，sparkles 要多裝 tsparticles 三包 |
| 流星 | Meteors | meteors | 幾乎同一個東西（兩邊都是 Manu/Dillion 系的寫法），用 MagicUI |
| 邊框光 | BorderBeam、ShineBorder | moving-border、hover-border-gradient、glowing-effect | BorderBeam 做「常駐」光；hover-border-gradient 做「hover 才動」的按鈕——後者 MagicUI 沒有 |
| 卡片聚光 | MagicCard | card-spotlight | **用 MagicUI**，card-spotlight 要 three.js |
| 便當格 | bento-grid（MagicUI 也有） | bento-grid | 任一；Aceternity 的更簡單（1.3KB） |
| 跑馬燈 | Marquee | infinite-moving-cards、3d-marquee | 用 MagicUI Marquee；3d-marquee 是獨有的 3D 版 |
| 地球 | Globe（cobe） | github-globe（three-globe）、3d-globe | MagicUI 的輕很多 |
| 按鈕 | ShimmerButton、RainbowButton、PulsatingButton | stateful-button、magnetic-button | 互補：Aceternity 的 stateful（三態）與 magnetic MagicUI 沒有 |
| Dock | Dock | floating-dock | 任一 |
| 放大鏡 | Lens | lens | 同功能 |
| 終端機 | Terminal | terminal | 同功能 |
| 極光 | AuroraText（文字） | aurora-background（全幅背景） | 互補：一個是文字一個是背景 |

### Aceternity 獨有、值得補進工具箱的
- **Scroll 敘事**：macbook-scroll、container-scroll-animation、hero-parallax、sticky-scroll-reveal、tracing-beam、timeline —— MagicUI 幾乎沒有 scroll-driven 大型元件（只有 ScrollProgress、ScrollBasedVelocity）
- **背景光**：background-beams、spotlight、lamp-effect、aurora-background、stars-background + shooting-stars
- **3D 卡片**：3d-card-effect、comet-card、draggable-card、glare-card
- **互動輸入**：placeholders-and-vanish-input、gooey-input、file-upload
- **導覽**：resizable-navbar、floating-navbar、navbar-menu、sidebar、notch
- **像素/復古**：dither-shader、pixelated-canvas、ascii-art、image-generation-loader
- **多步驟 loader**：multi-step-loader

### 與 React Bits 的關係
React Bits（https://reactbits.dev/llms.txt）走的是 **WebGL / OGL shader 背景**（aurora、beams、hyperspeed、liquid-chrome、plasma、galaxy、lightning…）與 **游標特效**（splash-cursor、click-spark、blob-cursor、target-cursor），有 JS/TS × CSS/Tailwind 四種版本，授權 MIT + Commons Clause。
- **遊戲背景想要「GPU 等級」的視覺** → React Bits（但手機風險更高）
- **遊戲 UI 想要 DOM 層、好改、好懂的 Tailwind 元件** → Aceternity
- 三者的 `cn` util 與 Tailwind 設定可共用，混用沒有技術衝突，衝突在**風格**：請遵守 §7 的「一頁一個參考站」原則。

## 9. 如何即時取得最新內容（機器可讀入口）

| 用途 | URL（皆實測 200） |
|---|---|
| 精簡連結索引（含免費/Pro 分類、Complete Component List） | https://ui.aceternity.com/llms.txt |
| 長版語料（授權、定價、安裝步驟、FAQ、完整目錄含 install 指令） | https://ui.aceternity.com/llms-full.txt |
| JSON API（112 個元件的 name/dependencies/registryDependencies/categories/installCommand） | https://ui.aceternity.com/api/components |
| 單一元件原始碼 | `https://ui.aceternity.com/registry/<name>.json`（例 https://ui.aceternity.com/registry/3d-card.json） |
| 示範用法 | `https://ui.aceternity.com/registry/<name>-demo.json` |
| AI 目錄頁（JSON-LD，2.7MB，較重） | https://ui.aceternity.com/ai-recommendations |
| 品牌事實 | https://ui.aceternity.com/brand-facts |
| Sitemap（117 components、204 blocks、18 templates…） | https://ui.aceternity.com/sitemap.xml |
| 元件文件頁 | `https://ui.aceternity.com/components/<slug>` |
| 授權 / 定價 | https://ui.aceternity.com/licence 、 https://ui.aceternity.com/pricing |
| 官方比較文 | https://ui.aceternity.com/compare/aceternity-vs-shadcn 、 https://ui.aceternity.com/blog/motion-vs-gsap-for-react |

快速腳本（取某元件原始碼）：
```bash
curl -sS -L -A "Mozilla/5.0" https://ui.aceternity.com/registry/<name>.json | python3 -c "import json,sys; print(json.load(sys.stdin)['files'][0]['content'])"
```
注意：github.com 上 `aceternity/ui` 的 raw 檔實測 404（README/LICENSE/package.json 皆無），**官網 registry 是唯一可靠的原始碼來源**。

## 10. 本地備份政策

Aceternity 的授權禁止把免費元件「重新打包成元件庫再散佈」，而本 repo 是公開的，所以 **不收錄 Aceternity 原始碼**。
需要時一行指令就能拿到最新版（見 §3），`snippets/aceternity/INDEX.md` 只保留 15 個精選元件的安裝指令、相依與 Tailwind keyframes。
