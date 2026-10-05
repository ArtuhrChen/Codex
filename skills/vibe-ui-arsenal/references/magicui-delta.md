# Magic UI 差距報告（Delta Reference）

> 📁 文中提到的 `raw/…` 原始資料不進版控；執行 `bash skills/vibe-ui-arsenal/scripts/update-sources.sh` 會重新抓到 `skills/vibe-ui-arsenal/.cache/`。

> 對象：Arthur（已移植 26 個 Magic UI 元件 + 既有 `magicui-design-assistant` skill）
> 查核日期：2026-10-05。所有 URL 皆以 `curl` 確認回傳 200。
> 來源：`https://magicui.design/llms.txt`、`https://magicui.design/r/registry.json`、`https://magicui.design/docs/installation`、`https://magicui.design/docs/mcp`、`https://pro.magicui.design`

## 1. 基本資料

| 項目 | 內容 |
|---|---|
| 授權 | **MIT**（`Copyright (c) Magic UI`）— https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md |
| 技術棧 | React + Tailwind CSS + `motion`（Framer Motion 新名，匯入路徑 `motion/react`）；shadcn/ui 風格 registry |
| 元件總數 | **78 個**（`llms.txt` 的 Components 區 78 列；`registry.json` 中 `registry:ui` 也是 78 項，另有 170 個 `registry:example` 範例、1 個 lib `utils`） |
| Arthur 已有 | 26 個（33%） |
| 尚未移植 | **52 個** |
| 官方 repo | GitHub `magicuidesign/magicui`（github.com HTML 在本環境回 403 未能驗證，故不附連結；raw.githubusercontent.com 可讀） |

## 2. 安裝方式（三種，皆已驗證）

**A. shadcn CLI 直接用 registry URL（最通用，不需設定 components.json registries）**
```bash
npx shadcn@latest add "https://magicui.design/r/confetti.json"
# 一次多個
npx shadcn@latest add "https://magicui.design/r/globe.json" "https://magicui.design/r/dock.json"
```
已驗證：`https://magicui.design/r/confetti.json` → 200（4.2 KB JSON，含 `files[0].content` 完整 TSX）。

**B. 官方文件的命名空間寫法**（shadcn ≥ 3 已內建 `@magicui` 命名空間）
```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add @magicui/globe
# 之後：import { Globe } from "@/components/ui/globe"
```
來源：https://magicui.design/docs/installation

**C. 官方 MCP server（給 Cursor / Claude Code / Windsurf 等 IDE）**
```bash
pnpm dlx @magicuidesign/cli@latest install cursor   # 也可 claude / windsurf / cline / roo-cline
```
來源：https://magicui.design/docs/mcp

> 注意：registry 產出的檔案一律放 `components/ui/<slug>.tsx`、匯入 `@/lib/utils` 的 `cn()`。
> Arthur 的現有路徑是 `components/{text,effects,transition,...}/`，移植時只需改匯入路徑。
> 另：`bento-grid`、`confetti`、`icon-cloud` 的 `registryDependencies` 為 shadcn 的 `button`，需要 `@/components/ui/button`。

## 3. 完整元件目錄（78 個）

分類依官方 docs 側欄（`llms.txt` 本身只有單一 Components 清單，無分類）。
每個元件文件頁格式：`https://magicui.design/docs/components/<slug>`；registry：`https://magicui.design/r/<slug>.json`。
✅ = Arthur 已有　⬜ = 尚未移植

#### Components（版面/互動元件）（17）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ✅ | Marquee | `marquee` | An infinite scrolling component that can be used to display  | — |
| ⬜ | Terminal | `terminal` | 終端機逐行打字輸出 | — |
| ⬜ | Hero Video Dialog | `hero-video-dialog` | Hero 影片縮圖 → 彈出播放 | motion |
| ⬜ | Bento Grid | `bento-grid` | Bento 便當格功能版面 | @radix-ui/react-icons（shadcn: button） |
| ⬜ | Animated List | `animated-list` | 項目依序滑入的通知清單 | motion |
| ⬜ | Dock | `dock` | macOS 風格放大 Dock | motion |
| ⬜ | Globe | `globe` | WebGL 可拖曳自轉地球（cobe） | cobe@^0.6.4, motion |
| ⬜ | Tweet Card | `tweet-card` | Tweet 卡片（server 端） | react-tweet |
| ⬜ | Client Tweet Card | `client-tweet-card` | Tweet 卡片（client 端取資料） | react-tweet |
| ✅ | Orbiting Circles | `orbiting-circles` | A collection of circles which move in orbit along a circular | — |
| ⬜ | Avatar Circles | `avatar-circles` | 重疊頭像圈 + 人數 | — |
| ⬜ | Icon Cloud | `icon-cloud` | 3D 旋轉圖示雲 | lucide-react（shadcn: button） |
| ⬜ | Lens | `lens` | 放大鏡局部放大圖片/影片 | motion |
| ⬜ | Pointer | `pointer` | 自訂游標跟隨指標 | motion |
| ⬜ | smooth-cursor | `smooth-cursor` | 物理彈簧平滑游標 | motion |
| ⬜ | Progressive Blur | `progressive-blur` | 捲動區域邊緣漸進模糊 | — |
| ⬜ | Dotted Map | `dotted-map` | 點陣世界地圖 + 標記 | svg-dotted-map |

#### Special Effects（特效）（9）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ⬜ | Animated Beam | `animated-beam` | 沿 SVG 路徑流動的光束（整合示意圖） | motion |
| ✅ | Border Beam | `border-beam` | An animated beam of light which travels along the border of  | motion |
| ✅ | Shine Border | `shine-border` | Shine border is an animated background border effect. | — |
| ✅ | Magic Card | `magic-card` | A spotlight effect that follows your mouse cursor and highli | motion, next-themes |
| ⬜ | Glare Hover | `glare-hover` | hover 斜向反光 | — |
| ✅ | Meteors | `meteors` | A meteor shower effect. | — |
| ⬜ | Confetti | `confetti` | 彩帶/煙火/星星噴發（canvas-confetti） | canvas-confetti, @types/canvas-confetti（shadcn: button） |
| ✅ | Particles | `particles` | Particles are a fun way to add some visual flair to your web | — |
| ⬜ | Theme Toggler | `animated-theme-toggler` | View Transition 深淺色切換（圓形/多邊形遮罩） | lucide-react |

#### Animations（進場動畫）（1）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ✅ | Blur Fade | `blur-fade` | Blur fade in and out animation. Used to smoothly fade in and | motion |

#### Text Animations（文字動畫）（18）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ✅ | Text Animate | `text-animate` | A text animation component that animates text using a variet | motion |
| ✅ | Typing Animation | `typing-animation` | Characters appearing in typed animation | motion |
| ⬜ | Line Shadow Text | `line-shadow-text` | 線條陰影文字 | motion |
| ✅ | Aurora Text | `aurora-text` | A beautiful aurora text effect | — |
| ⬜ | Video Text | `video-text` | 文字遮罩內播放影片 | — |
| ✅ | Number Ticker | `number-ticker` | Animate numbers to count up or down to a target number | motion |
| ⬜ | Animated Shiny Text | `animated-shiny-text` | 文字上掃過一道微光 | — |
| ✅ | Animated Gradient Text | `animated-gradient-text` | An animated gradient background which transitions between co | — |
| ⬜ | Text Reveal | `text-reveal` | 捲動時逐字顯現段落 | motion |
| ⬜ | Dia Text Reveal | `dia-text-reveal` | 色帶橫掃揭露文字 | motion |
| ✅ | Hyper Text | `hyper-text` | A text animation that scrambles letters before revealing the | motion |
| ✅ | Word Rotate | `word-rotate` | A vertical rotation of words | motion |
| ⬜ | Scroll Based Velocity | `scroll-based-velocity` | 依捲動速度變速的跑馬燈文字 | motion |
| ⬜ | Sparkles Text | `sparkles-text` | 文字周圍持續閃爍星光 | motion |
| ✅ | Morphing Text | `morphing-text` | A dynamic text morphing component for Magic UI. | — |
| ⬜ | Spinning Text | `spinning-text` | 環形旋轉文字 | motion |
| ⬜ | Highlighter | `highlighter` | 手繪螢光筆標記文字（rough-notation） | motion, rough-notation |
| ⬜ | Text 3D Flip | `text-3d-flip` | 逐字 3D 翻轉 | motion |

#### Device Mocks（裝置外框）（3）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ⬜ | Safari | `safari` | Safari 瀏覽器外框 mockup | — |
| ⬜ | iPhone | `iphone` | iPhone 外框 mockup | — |
| ⬜ | Android | `android` | Android 手機外框 mockup | — |

#### Buttons（按鈕）（3）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ✅ | Rainbow Button | `rainbow-button` | An animated button with a rainbow effect. | — |
| ✅ | Shimmer Button | `shimmer-button` | A button with a shimmering light which travels around the pe | — |
| ⬜ | Ripple Button | `ripple-button` | 點擊水波紋按鈕 | — |

#### Backgrounds（背景）（12）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ⬜ | Flickering Grid | `flickering-grid` | 閃爍方格背景（Canvas） | — |
| ⬜ | Animated Grid Pattern | `animated-grid-pattern` | 方格背景隨機閃亮（SVG） | motion |
| ✅ | Retro Grid | `retro-grid` | An animated scrolling retro grid effect | — |
| ✅ | Ripple | `ripple` | An animated ripple effect typically used behind elements to  | — |
| ✅ | Dot Pattern | `dot-pattern` | A background dot pattern made with SVGs, fully customizable  | — |
| ✅ | Grid Pattern | `grid-pattern` | A background grid pattern made with SVGs, fully customizable | — |
| ⬜ | Hexagon Pattern | `hexagon-pattern` | 六角形背景圖樣 | — |
| ⬜ | Striped Pattern | `striped-pattern` | 斜條紋背景 | — |
| ⬜ | Interactive Grid Pattern | `interactive-grid-pattern` | 滑鼠懸停亮格的網格 | — |
| ⬜ | Light Rays | `light-rays` | 由上而下的光束 | motion |
| ⬜ | Noise Texture | `noise-texture` | SVG 噪點紋理疊層 | — |
| ⬜ | Floating 3D Particles | `floating-3d-particles` | 偽 3D 漂浮粒子場（Canvas） | — |

#### Community（社群貢獻）（15）

| 狀態 | 元件 | slug（registry 名稱） | 說明 | 相依套件 |
|---|---|---|---|---|
| ⬜ | Shiny Button | `shiny-button` | 亮面按鈕 | motion |
| ⬜ | File Tree | `file-tree` | 可展開的檔案樹 | — |
| ⬜ | Code Comparison | `code-comparison` | 兩段程式碼比對（shiki） | shiki, next-themes |
| ✅ | Scroll Progress | `scroll-progress` | Animated Scroll Progress for your pages | motion |
| ✅ | Neon Gradient Card | `neon-gradient-card` | A beautiful neon card effect | — |
| ⬜ | Comic Text | `comic-text` | 漫畫風爆炸字 | motion |
| ⬜ | Kinetic Text | `kinetic-text` | hover 時字重變化 | — |
| ⬜ | Cool Mode | `cool-mode` | 點擊噴出粒子/emoji | — |
| ⬜ | Pixel Image | `pixel-image` | 像素化逐步清晰的圖片 | — |
| ✅ | Pulsating Button | `pulsating-button` | An animated pulsating button useful for capturing attention  | — |
| ⬜ | Warp Background | `warp-background` | 時空扭曲格線卡片背景 | motion |
| ⬜ | interactive-hover-button | `interactive-hover-button` | hover 展開箭頭的按鈕 | — |
| ✅ | Animated Circular Progress Bar | `animated-circular-progress-bar` | Animated Circular Progress Bar is a component that displays  | — |
| ⬜ | Backlight | `backlight` | 影片/圖片背後的環境光暈 | — |
| ⬜ | Glyph Matrix | `glyph-matrix` | 字符矩陣微動背景 | — |
## 4. 尚未移植但值得補的 Top 15

| # | 元件 | slug | 用途 | 網頁場景 | 遊戲場景 | 相依套件 |
|---|---|---|---|---|---|---|
| 1 | **Confetti**（skill 標記「待移植」） | `confetti` | 彩帶/煙火/星星/emoji 噴發；提供 `<Confetti>` + `<ConfettiButton>` + ref API | 註冊成功、付款完成、里程碑 | **過關、達成成就、連擊獎勵、抽獎開箱**（最高優先） | `canvas-confetti`、`@types/canvas-confetti`、shadcn `button` |
| 2 | **Animated List** | `animated-list` | 項目依序由下往上滑入並堆疊 | 通知流、活動時間軸、功能展示 | 戰鬥日誌、擊殺訊息、任務完成提示、排行榜更新 | `motion` |
| 3 | **Animated Beam** | `animated-beam` | 兩個 ref 元素之間的 SVG 流動光束 | 整合/架構示意圖（A→B→C） | 技能樹連線、科技樹、節點地圖、能量傳輸 | `motion` |
| 4 | **Terminal** | `terminal` | 終端機逐行輸出，含 `AnimatedSpan`、`TypingAnimation` 子元件 | 開發工具 landing、安裝教學 | 駭客/科幻遊戲 UI、劇情敘事、系統訊息、載入畫面 | 無（原始碼實際匯入 `motion/react`，registry 未列出，需自行安裝 `motion`） |
| 5 | **Bento Grid** | `bento-grid` | `BentoGrid` + `BentoCard`（icon/name/description/href/cta/背景層） | 功能總覽、產品特色 | 遊戲主選單、關卡選擇、角色/道具總覽 | `@radix-ui/react-icons`、shadcn `button` |
| 6 | **Dock** | `dock` | macOS 風格、游標靠近放大的 Dock | 作品集導覽、社群連結列 | **道具列/技能快捷欄**、底部操作列 | `motion`、`class-variance-authority` |
| 7 | **Globe** | `globe` | WebGL 自轉可拖曳地球 | 全球用戶/部署地圖 | 世界地圖選關、太空題材背景 | `cobe@^0.6.4`、`motion` |
| 8 | **Icon Cloud** | `icon-cloud` | 3D 球形旋轉圖示雲（Canvas） | 技術棧展示、合作夥伴 | 收集品/徽章展示、技能球 | `lucide-react`、shadcn `button`（內部用 `react-dom/server` 渲染 icon） |
| 9 | Animated Shiny Text | `animated-shiny-text` | 文字掃光（純 CSS） | 「✨ Introducing」公告膠囊 | 「NEW」標籤、稀有物品名稱 | 無 |
| 10 | Sparkles Text | `sparkles-text` | 文字四周持續星光 | Hero 關鍵字強調 | 傳說級道具、暴擊/完美評價字樣 | `motion` |
| 11 | Flickering Grid | `flickering-grid` | Canvas 閃爍方格背景 | 深色科技背景 | 賽博龐克場景、載入畫面 | 無 |
| 12 | Interactive Grid Pattern | `interactive-grid-pattern` | 滑鼠懸停亮格的網格 | 互動背景 | 棋盤/格子地圖、塔防放置格 | 無 |
| 13 | Safari / iPhone / Android | `safari` `iphone` `android` | 裝置外框 SVG mockup | 產品截圖展示、App 介紹 | 遊戲截圖/預告頁、手機版宣傳 | 無 |
| 14 | Lens | `lens` | 放大鏡局部放大圖片/影片 | 產品細節、設計作品 | 地圖放大、找碴/解謎遊戲、物品檢視 | `motion` |
| 15 | Scroll Based Velocity | `scroll-based-velocity` | 依捲動速度變速的跑馬燈 | 品牌字樣、長頁節奏 | 片頭/片尾滾動名單、速度感 UI | `motion` |

**次佳候補（也在 llms.txt 中）**：`cool-mode`（點擊噴粒子，遊戲按鈕手感極佳、無相依）、`pointer` / `smooth-cursor`（自訂游標）、`avatar-circles`（玩家頭像堆疊）、`file-tree`（文件/技能樹列表）、`video-text`（影片遮罩標題）、`warp-background`（時空扭曲卡片）、`box-reveal` 類效果可用 `text-reveal` / `dia-text-reveal` 替代、`hero-video-dialog`、`animated-theme-toggler`、`highlighter`、`light-rays`、`text-3d-flip`、`dotted-map`、`tweet-card` / `client-tweet-card`（需 `react-tweet`）。

**要求清單中「不存在」於 Magic UI 的名稱**：`ScratchToReveal`、`ScriptCopyBtn`、`BoxReveal` 目前不在 `llms.txt` / `registry.json` 中（可能已下架或從未存在），不要引用。

## 5. Magic UI Pro / Templates 是否付費

- **免費（MIT）**：`magicui.design/docs/components` 下的全部 78 個元件、170 個範例、`registry.json`、MCP server、GitHub 原始碼。
- **付費（Magic UI Pro，https://pro.magicui.design）**：Individual License **US$199 一次付清、終身存取與更新**。內容為「9+ 完整 landing page templates（Codeforge、AI Agent、Dev Tool、Mobile、SaaS、Startup、Portfolio、Changelog、Blog）+ 50+ page sections/blocks（Header、Hero、Social Proof、Feature、Pricing、CTA、FAQ、Footer）」。授權允許個人與商業專案使用，禁止轉售原始碼。
- 官方 docs 側欄的「Templates」區（CodeForge、AI Agent、Dev Tool、Mobile、SaaS、Startup、Portfolio）標 **Pro** 即為付費；Pro 頁面上 Portfolio / Changelog / Blog 三個 template 顯示「Download」按鈕（看起來可免費下載，但未登入驗證，請自行確認）。
- 結論：Arthur 做動畫元件移植只需免費部分，完全不受影響。

## 6. 如何即時取得最新內容

| 方法 | URL / 指令 | 用途 |
|---|---|---|
| LLM 索引 | `curl -sSL https://magicui.design/llms.txt` | 78 個元件名稱、slug、一句話描述、170 個範例檔連結（GitHub `example/*.tsx`） |
| 完整 registry 索引 | `curl -sSL https://magicui.design/r/registry.json` | 所有 items 的 `name / type / dependencies / registryDependencies / files[].path`（110 KB，不含原始碼內容） |
| 單一元件 JSON | `curl -sSL https://magicui.design/r/<slug>.json` | `files[0].content` 即完整 TSX；用 `jq -r '.files[0].content'` 直接落地 |
| 範例檔 | `curl -sSL https://magicui.design/r/<slug>-demo.json`（已驗證 https://magicui.design/r/confetti-demo.json、https://magicui.design/r/animated-list-demo.json → 200） | registry 內 170 個 `registry:example` 項目名稱即 `*-demo*` |
| 原始碼 raw | `https://raw.githubusercontent.com/magicuidesign/magicui/main/registry.json`（200） | 等同站上 registry.json；`registry/magicui/<slug>.tsx` 為原始路徑 |
| MCP | `pnpm dlx @magicuidesign/cli@latest install claude` | 讓 IDE 直接查元件 |

**一鍵抓全部缺少元件的腳本（bash + jq）**：
```bash
for s in confetti animated-list animated-beam terminal bento-grid dock globe icon-cloud; do
  curl -sSL "https://magicui.design/r/$s.json" | jq -r '.files[0].content' > "src/components/magicui/$s.tsx"
done
```

**與 Arthur 既有 skill 的差異重點**
1. skill 的「待移植」只列 Confetti；實際缺 52 個，本報告 §3 已逐列標記。
2. skill 快查表路徑表有筆誤：`AuroraText` 寫在 `text/animated-gradient-text`、`DotPattern/GridPattern` 寫在 `backgrounds/retro-grid`、`PulsatingButton` 寫在 `effects/ripple`、`OrbitingCircles` 寫在 `composite/magic-card` — 若為同檔多匯出屬合理，否則建議更新。
3. Magic UI 已從 `framer-motion` 改為 `motion`（匯入 `motion/react`）；Arthur 的舊移植若仍用 `framer-motion`，新元件需統一。
4. 本次已先行下載 Top 8 原始碼至 `snippets/magicui/`（見 `snippets/magicui/INDEX.md`）。
