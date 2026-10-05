# MotionSites（motionsites.ai）研究筆記：AI 網站 Prompt 的結構逆向工程

> 📁 文中提到的 `raw/…` 原始資料不進版控；執行 `bash skills/vibe-ui-arsenal/scripts/update-sources.sh` 會重新抓到 `skills/vibe-ui-arsenal/.cache/`。

> 調查日期：2026-10-05。所有引用 URL 皆以 `curl -sS -L -A "Mozilla/5.0"` 實測回傳 HTTP 200。
> 原始資料：`snippets/motionsites/INDEX.md`（免費 prompt 來源連結）。
> 目的：學習免費/公開 prompt 的寫法，讓 Arthur 自己寫出同等級的 prompt；不是搬運付費內容。

---

## 1. 一句話定位、定價、授權

**定位**：「Beautiful Website Prompts for Lovable, Bolt, Cursor, and Claude」— 一個付費的 *AI 網站 prompt 庫*。每個作品是一張有預覽影片/圖片的卡片，點 Copy 拿到一段超詳細的英文 prompt，貼進 AI builder 就能重建那個設計。範圍：Hero / Landing Page / Sections（Features、Footer、CTA、Pricing、Social Media、Blog、Dashboard）/ Apps（web & mobile app 設計）/ 動態背景影片 / 漸層 / 40+ Lovable 模板 / Academy 教學影片 / MCP server。作者 Viktor Oddy（@viktoroddy），由 Lovable（gpt-engineer）生成的 Vite+React SSR 站，後端 Supabase。

**定價**（https://motionsites.ai/unlimited，USD）：

| 方案 | 價格 | 內容 |
|---|---|---|
| Free | $0 | 每個免費帳號可開 3 個免費 prompt（MCP 頁明示）；Academy 課程頁上另有 4 份完整 prompt 不用登入就看得到（見第 3 節） |
| Yearly Access | $279/年 | 全部 prompt、Apps、動態背景、Sections、40+ Lovable 模板、MCP、社群、「For personal & client work」、優先支援 |
| Lifetime Access（最熱門） | 原價 $759，現價 $399 一次付清 | 同上 + 終身更新 + early access |
| Prompt packs | $49 起（2 / 5 / 10 個下載） | 一次性專案用，不需訂閱，點數不過期 |

**授權重點**（https://motionsites.ai/terms，2026-09-30 版）：
- 可以：把 prompt 文字與原始碼複製到自己的專案、修改、用它建站，**並且發佈或銷售用它做出的網站與 app**。「Websites and apps you build with our prompts are yours.」→ 商業專案 OK，含客戶案（pricing 頁寫明 personal & client work）。
- 不可以：轉售／再散佈／分享 prompt 文字或原始碼本身；把 prompt 庫重新發佈到網路上；共用帳號；爬蟲、批量自動存取、繞過付費牆。
- 結果不保證：prompt 搭配第三方 AI 工具使用，產出品質不由他們負責。
- 退款（/refund-policy）：數位商品原則上不退；EU/UK 結帳時放棄 14 天冷靜期；重複扣款等情況 14 天內可申請。

> 對 Arthur 的實務意義：用他們的 prompt 做出的網站可以商用；但本筆記中的 prompt 全文只能自己研究，不能再貼到公開 repo／文章。

---

## 2. 目錄盤點（能從公開頁面確認的部分）

MotionSites 的卡片目錄是前端從 Supabase 動態載入，公開 HTML 只 server-render 第一批卡片；我沒有去呼叫他們的資料庫端點（見第 7 節的說明），所以下面是**下限數字 + 官方文案數字**。

| 分類 | 頁面 | 數量線索 | 常見風格標籤（從卡片標題/分類觀察） |
|---|---|---|---|
| Prompts（Hero / Landing Page / SaaS / Agency…） | https://motionsites.ai/ | 官方：「500+ Premium Website Design Prompts」。首頁 SSR 可見 24 張卡 | Hero Section、Landing Page、SaaS、Agency、Footer、Pricing、CTA、Features、Social Media；題材：fintech/DeFi（RIVR DeFi、Finlytic AI Agent）、biotech（Bionova）、太空/工程（NOVA Space Systems、Orbit Engineers）、房產（Zenith Realty）、資安（AKOR Security）、運動（Slam Dunk）、私人飛機（SkyElite） |
| Apps | https://motionsites.ai/apps | 「premium app design prompts」（web & mobile） | 與首頁同一資料表，用 Apps 分頁篩選 |
| Sections | https://motionsites.ai/sections | 類別 slug（來自前端程式碼）：hero、landing-page、features、footer、cta、pricing、social-media、blog、dashboard | SSR 可見 Velorah Focus、Social Media Posts |
| Backgrounds | https://motionsites.ai/backgrounds | SSR 可見 22 個「Copy URL」卡片（影片 URL，分 free / premium） | 「handcrafted Animated Backgrounds」，每日新增 |
| Gradients | https://motionsites.ai/gradients | motion_videos 表中 category=gradient，前端取 12 個 | 動態漸層影片 |
| Templates | https://motionsites.ai/templates | 定價頁：「40+ Lovable Templates」（會員限定） | 完整網站模板 |
| Academy | https://motionsites.ai/academy | 6 篇 lesson + 9 支 YouTube 教學 | 3D / scroll / cursor-tracking / Claude Code / Three.js |
| MCP | https://motionsites.ai/mcp | 付費方案含；`claude mcp add motionsites --scope user --transport http <supabase functions>/mcp` | 讓 Claude Code / Cursor / Codex 直接拉 prompt |

首頁篩選 UI：All / Popular / Apps / Sections / Recent / Pricing；Type 下拉：All / Hero Section / Landing Page。

資料欄位（從前端 bundle 讀到的 `prompts` 表公開欄位）：`id, title, category, sort_order, type, types, created_at, page_type, row_span, is_free, image_preview_url, video_preview_url, has_assets, natural_ratio, github_url`。**prompt 本文不在這張表**，而是由 Edge Function `get-prompt`（body `{prompt_id}`，回傳 `prompt_text / code / asset_download_url`）在伺服器端判斷權限後才給 → 所以沒登入看不到 is_free 以外的任何 prompt 文字，這是他們的付費牆設計。

---

## 3. 免費、不用登入即可取得的 prompt 全文

Academy 的 lesson 頁把「Copy full prompt / Show full prompt」的內容直接 server-render 在 HTML 裡，所以以下 4 份是真正公開的。第 5 份（Astra 課的「Sky Estate / SkyElite Private Jets」）在 SSR 中是空的 `<span class="sr-only">`，需前端登入後載入，**未取得**，不在此列。

| # | 設計名 | 類型 | 來源（200） | 檔案 |
|---|---|---|---|---|
| 1 | Aether Lane（Lumenvox Atelier 課） | 奢華房產 Navbar + 視差 Hero | https://motionsites.ai/lesson/build-animated-website-with-ai | prompts/01-… |
| 2 | DE</HELPERS | 固定 Navbar + sticky 背景影片 Hero + liquid glass | https://motionsites.ai/lesson/build-animated-website-with-motionsites | prompts/02-… |
| 3 | NovaAI landing page | 捲動刷影片（scroll-scrubbed video）兩段式落地頁 | https://motionsites.ai/lesson/build-scroll-animated-website-with-ai | prompts/03-… |
| 4 | 3D Character Studio（搜 "retrofuturist"）／Mainframe | 滑鼠左右刷影片 + 打字機 Hero | https://motionsites.ai/lesson/cursor-tracking-website-with-motionsites | prompts/04-… |

> **本 repo 不收錄 prompt 全文**（MotionSites Terms 禁止再散佈 prompt 文字，而本 repo 公開）。上表四個 lesson 頁面不用登入就看得到完整 prompt，要用時直接開連結複製。
> 真正可重用的是 §4 的結構拆解與模板（那是我們自己寫的，可自由使用）。

## 4. Prompt 結構逆向工程

### 4.1 四份 prompt 的共同骨架

把 4 份攤開比對，MotionSites 等級的 prompt 其實是「**可以直接被工程師照著實作的規格書**」，不是形容詞堆疊。固定出現的 10 個區塊：

| 區塊 | 他們怎麼寫 | 範例片語 |
|---|---|---|
| ① 一句話任務 + 範圍 + 技術棧 | 第一句就講清楚做什麼、只做哪幾個區塊、用什麼 stack | 「Build a luxury real estate landing page — only the navbar and hero section. Use Vite + React + TypeScript + Tailwind CSS + Framer Motion + lucide-react.」 |
| ② SETUP / 全域 | 字體（Google Fonts 或指定 stylesheet URL + 權重 + preconnect）、`<title>`、CSS reset、`scroll-behavior: smooth`、`overflow-x: hidden`、antialiased、`::selection` 顏色、頁面底色 hex | 「Body font-family 'Inter Tight', system-ui, sans-serif… Page background black.」 |
| ③ Tailwind config / 色票 | 直接列 `fontFamily.sans`、`brand.*` hex；或聲明「Default config, no extensions」 | 「brand.blue: #8F9EFF, brand.navy: #271C40, brand.dark: #020319」 |
| ④ 材質系統 | liquid glass / frosted glass 以**完整 CSS** 或 **token 表格**給出，要求「Reuse these consistently」 | `.liquid-glass { backdrop-filter: blur(18px) saturate(1.4) brightness(1.05); box-shadow: inset 0 0 12px rgba(255,255,255,0.15) … }` |
| ⑤ 頁面結構樹 | 用 ASCII 樹或「outermost wrapper → …」寫 z-index 分層 | `ScrollVideo (fixed inset-0 z-0) / relative z-10 wrapper / Navbar / main / SectionOne / spacer h-[80vh] / SectionTwo` |
| ⑥ 逐元件規格 | 每個元件：位置、z-index、padding（含 sm/md/lg 斷點）、字級、字重、顏色（rgba 或 white/70）、hover、文案**原文** | 「Links: "Labs", "Studio", "Openings", "Shop"… `hover:opacity-60 transition-opacity`」 |
| ⑦ 動畫規格 | 每個動畫寫：觸發（load / scroll / hover / mousemove）、起點與終點值、duration、easing 曲線、stagger 與 delay、library API 名稱 | 「from {opacity:0, y:20, filter:'blur(4px)'} to {opacity:1, y:0, filter:'blur(0px)'}, stagger 0.06s with 0.1s initial delay, duration:0.35」、「easing [0.25, 0.1, 0.25, 1]」、「useScroll… useTransform [0,1] -> ['0%','8%']」 |
| ⑧ 媒體資產 | 影片/圖片給**確切 URL**（CloudFront、Pexels、figma.site），加 `autoPlay muted loop playsInline`、`object-fit`、`object-position`、漸層遮罩；要求「use these exact URLs」 | 「Video source URL: https://d8j0ntlcm91z4.cloudfront.net/…mp4 … does NOT autoplay」 |
| ⑨ 響應式 | 明寫 mobile 行為：hamburger 三條線的旋轉/位移數值、全螢幕 overlay、`100svh`、`hidden md:flex`、鎖 body scroll | 「bar 1 rotates 45deg and moves to center (17px), bar 2 fades + scales to 0, bar 3 rotates -45deg」 |
| ⑩ 依賴、禁止、驗收 | DEPENDENCIES 清單（並說「No other UI libraries」）、`## Do not`（不換字體、不換影片、不加不透明底、不刪 spacer）、`## Acceptance`（頁面各處應看到什麼） | 「Do not put opaque solid backgrounds over the video (only glass / transparent wrappers)」 |

### 4.2 他們的「風格 DNA」

- **暗底 + 白字 + 玻璃**：`#000 / #0a0a0a / #0A061A / #020319` 背景；白字用 `/70 /85 /90` 透明度分層；`drop-shadow-md` 保證文字壓在影片上可讀。
- **影片是主角**：hero 背景幾乎都是一支 mp4，三種操控法：(a) autoplay loop + sticky（DE</HELPERS）；(b) scroll 刷時間軸（NovaAI，不 autoplay）；(c) 滑鼠 X 位移刷時間軸（Mainframe，不 autoplay）。
- **編輯式排版**：超大標題 `clamp(3rem, 14vw, 14rem)` 或 `text-5xl sm:text-6xl lg:text-7xl`，`leading-[1.05] tracking-tight font-light/normal`；搭配 `font-mono text-[10px] uppercase tracking-[0.15em]` 的小標籤。
- **動效克制、數值明確**：進場 = fade + y 20px（或 translate-y-8）+ 偶爾 blur(4px)→0；700ms ease-out 或 0.35s；stagger 0.05–0.12s。hover 只做 opacity/color/scale(1.05)/translate-x-0.5。
- **Framer Motion 用法固定**：`AnimatePresence` 做 menu 開合、`useScroll + useTransform` 做視差、`motion.div animate` 做 hamburger。
- **文案是設計的一部分**：每段文字都給原文，不讓 AI 自創（NovaAI 明寫「Do not invent alternate copy」）。

### 4.3 MotionSites 等級 Hero Prompt 模板（可直接貼）

中文說明：把 ⟨⟩ 內換成你的內容；不需要的區塊整段刪掉，但 **SETUP、結構樹、動畫數值、Do not、Acceptance 五段不要刪**，那是品質來源。

```text
Build ⟨a full-screen hero section + fixed navbar⟩ for ⟨brand name⟩, a ⟨industry/one-line positioning⟩. Build ONLY these sections; do not add others. Stack: Vite + React + TypeScript + Tailwind CSS + Framer Motion + lucide-react. Recreate the spec below faithfully — do not invent alternate copy, layout, fonts, colors, or effects.

## SETUP
- Fonts: load Google Fonts ⟨"Inter Tight"⟩ weights 400, 500, 600, 700 with preconnect. body font-family '⟨Inter Tight⟩', system-ui, sans-serif.
- Global CSS: * { margin:0; padding:0; box-sizing:border-box } · html { scroll-behavior: smooth } · body { background: ⟨#0a0a0a⟩; color: #fff; overflow-x: hidden; -webkit-font-smoothing: antialiased } · ::selection { background: rgba(255,255,255,0.2) }
- Page <title>: "⟨Brand — Tagline⟩".
- Tailwind: extend fontFamily.sans and colors.brand = { accent: ⟨#8F9EFF⟩, deep: ⟨#271C40⟩, bg: ⟨#0a0a0a⟩ }.

## MATERIAL TOKENS (reuse consistently)
| Token | Classes |
| Glass panel | bg-white/10 backdrop-blur-md border border-white/15 |
| Primary CTA | rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium hover:bg-white/85 transition-colors duration-300 |
| Secondary CTA | rounded-full border border-white/25 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 |
| Mono label | font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 |
| Text over media | text-white drop-shadow-md |

## PAGE STRUCTURE (z-index layers, bottom → top)
relative root (bg brand.bg)
  Background layer (z-0): ⟨fixed inset-0 <video> autoPlay muted loop playsInline, object-cover, src="⟨exact URL⟩"⟩ + overlay div bottom 40% with linear-gradient(to bottom, transparent, ⟨#0a0a0a⟩)
  Content wrapper (relative z-10)
    Navbar (fixed top, z-50)
    Hero <section> (min-h-screen, supports-[height:100svh]:min-h-[100svh], px-5 sm:px-8 md:px-12, pt-24 sm:pt-28)

## NAVBAR (fixed, z-50)
- Row: logo left | links center (hidden md:flex, gap-8) | CTA right. padding px-6 md:px-12 py-5.
- Logo: "⟨Brand⟩" text-lg font-medium tracking-tight white (+ lucide ⟨Hexagon⟩ size 24 strokeWidth 1.5).
- Links (exact labels): "⟨Home⟩", "⟨Work⟩", "⟨About⟩", "⟨Contact⟩" — text-sm text-white/70 hover:text-white transition-colors duration-300; each links to #<lowercase>.
- CTA: "⟨Get in touch⟩" using Primary CTA token.
- Mobile hamburger (md:hidden): 36x36 button, three bars w-5 h-[2px] bg-white rounded at offsets 10/17/24px. Open state: bar1 rotate 45deg → y 17px, bar2 opacity 0 + scale 0, bar3 rotate -45deg → y 17px. Framer Motion animate, duration 0.3, ease [0.25, 0.1, 0.25, 1].
- Mobile overlay (AnimatePresence): fixed inset-0 z-[55] bg-black/95 backdrop-blur-xl; links centered, text-3xl font-medium text-white/90; stagger in from {opacity:0, y:20, filter:'blur(4px)'} to {opacity:1, y:0, filter:'blur(0px)'}, stagger 0.06s, initial delay 0.1s, duration 0.35; exit reverses. Lock body scroll while open.

## HERO CONTENT
- Layout: max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end; on mobile justify-end pb-12.
- Badge (left-accent): "⟨WE AUTOMATE 100+ BUSINESSES⟩" — border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md + Mono label.
- H1 (exact copy, use <br/>): "⟨Clear. Precise.⟩ / ⟨Automated.⟩" — text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] tracking-tight text-white drop-shadow-lg.
- Subtitle: "⟨One sentence of value.⟩" — mt-6 max-w-md text-base text-white/80.
- CTAs (mt-8 flex flex-wrap gap-3): Primary "⟨Run the demo⟩" + lucide ChevronRight 14; Secondary "⟨Free consultation⟩".
- Right column: ⟨glass card: avatar row of 4 images w-8 h-8 rounded-full -space-x-2 + testimonial text-sm text-white/90⟩.

## MOTION (exact values)
1. Entrance reveals: every text/UI block starts {opacity:0, y:24}; animates to {opacity:1, y:0}, 700ms ease-out; delays — badge 150ms, H1 280ms, subtitle 320ms, CTAs 420ms, right card 500ms, nav links 100 + i*100ms.
2. Parallax: Framer Motion useScroll on the hero (offset ['start start','end start']) + useTransform [0,1] → ['0%','8%'] applied as y on the background layer. Title stays fixed.
3. Hover: links/buttons transition-colors duration-300; CTA hover scale(1.05); chevrons translate-x-0.5.
4. ⟨Optional signature interaction, e.g. typewriter 38ms/char after 600ms delay with blinking 2px cursor⟩
5. No layout shift: reserve min-height for animated text.

## RESPONSIVE
- Nav links hidden below md; hamburger + overlay below md.
- Hero stacks vertically on mobile (text first), side-by-side from md.
- Video: muted + playsInline for iOS; use 100svh.
- Test at 375px, 768px, 1440px.

## DEPENDENCIES
framer-motion, lucide-react, tailwindcss + postcss + autoprefixer. No other UI libraries.

## DO NOT
- Do not change the fonts, colors, copy, or media URLs given above.
- Do not add sections, icon card grids, or purple/cream gradients.
- Do not place opaque backgrounds over the video; only glass/transparent wrappers.
- Do not autoplay sound; do not use external UI kits.

## ACCEPTANCE
Top of page shows fixed glass navbar, badge, H1 "⟨…⟩", subtitle, two CTAs and ⟨right card⟩ over the ⟨video⟩. Entrances stagger in within 1s. Scrolling moves the background 8%. Mobile shows hamburger that opens the blurred overlay menu. Generate the complete first version before asking questions.
```

### 4.4 遊戲用變體：遊戲首頁 / 標題畫面 / 角色選擇

中文說明：MotionSites 骨架照搬，只把「落地頁元件」換成遊戲 UI 元件，並加三件遊戲特有的規格：(1) **狀態機**（Title → Menu → Character Select → Game）；(2) **輸入**（鍵盤/手把/觸控同時支援、focus ring）；(3) **音效與 game feel 數值**（hover tick、confirm、screen shake、粒子）。配合 Arthur 的 `game-dev-assistant` skill 可再加 howler / 粒子庫。

```text
Build the TITLE SCREEN + MAIN MENU + CHARACTER SELECT screens for a browser game called "⟨GAME NAME⟩", a ⟨genre, e.g. neon-retro arcade shooter⟩. Build ONLY these three screens as a React state machine (screen: 'title' | 'menu' | 'select'); the actual game canvas is out of scope — expose an onStart(selectedCharacter) callback. Stack: Vite + React + TypeScript + Tailwind CSS + Framer Motion (+ ⟨howler⟩ for SFX, ⟨@react-three/fiber⟩ only if a 3D element is specified). Follow this spec exactly — do not invent alternate copy, fonts, colors, or effects.

## SETUP
- Fonts: Google Fonts "⟨Press Start 2P⟩" (display) + "⟨Inter⟩" 400/600 (UI). CSS vars --font-display / --font-ui.
- Global CSS: body { background: ⟨#05030f⟩; color: #fff; overflow: hidden; user-select: none } · image-rendering: pixelated on sprites.
- Palette: bg ⟨#05030f⟩, primary ⟨#ff2bd6⟩, secondary ⟨#19e6ff⟩, accent ⟨#ffd23f⟩, danger ⟨#ff4d4d⟩. Glow = drop-shadow(0 0 12px currentColor).

## TOKENS
| Menu button | font-display text-sm sm:text-base tracking-widest uppercase px-6 py-3 border-2 border-white/30 bg-black/40 backdrop-blur-sm; hover/focus: border-primary text-primary glow, translate-x-2 |
| Panel | bg-white/5 border border-white/15 backdrop-blur-md rounded-xl |
| HUD label | font-ui text-[11px] uppercase tracking-[0.2em] text-white/60 |

## SCREEN 1 — TITLE (full viewport)
- Background (z-0): ⟨fixed <video> autoPlay muted loop playsInline src="⟨exact URL⟩" object-cover⟩ OR ⟨CSS animated gradient: linear-gradient(120deg, #05030f, #2b0a4a, #05030f) background-size 300% animating background-position 0%→100% over 12s linear infinite⟩ + optional scanline overlay (repeating-linear-gradient 0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px).
- Logo: "⟨GAME NAME⟩" font-display, font-size clamp(2.5rem, 10vw, 8rem), text-center, background-clip text gradient (primary → secondary), glow. Entrance: scale 1.4 → 1, opacity 0 → 1, 900ms cubic-bezier(0.16,1,0.3,1), then a continuous subtle float y ±6px 4s ease-in-out infinite.
- Tagline under logo: "⟨One line of flavor text⟩" font-ui text-white/70, enters at 500ms delay (y 16 → 0, 600ms).
- Prompt: "PRESS ANY KEY / TAP TO START" font-display text-xs tracking-[0.3em], blinking opacity 1↔0.2 at 1.2s step-end. Any keydown / click / gamepad button → play sfx "confirm", flash white overlay 120ms, go to 'menu'.
- Corner HUD: version "v⟨0.1⟩" bottom-left, "⟨Studio⟩ © 2026" bottom-right, HUD label style.

## SCREEN 2 — MAIN MENU
- Left column (max-w-sm, pl-8 md:pl-20): small logo (font-display text-xl) then menu items in order: "Start Game", "Characters", "Options", "Credits". Items stagger in from {opacity:0, x:-24} to {opacity:1, x:0}, 60ms stagger, 350ms ease-out.
- Keyboard: ArrowUp/Down or W/S moves selection, Enter/Space confirms, Esc goes back; mouse hover also selects. Selected item shows a "▸" cursor glyph with the item translated x +8px and glow; play sfx "tick" (volume 0.3) on change, "confirm" on select.
- Right side: a Panel preview card 320×420 showing ⟨character/key art image URL⟩ with a 3D tilt on mouse move (rotateX/rotateY ±8deg via Framer Motion useMotionValue + spring stiffness 150 damping 15) and a specular highlight following the pointer.

## SCREEN 3 — CHARACTER SELECT
- Grid: grid-cols-2 md:grid-cols-4 gap-4, max-w-5xl centered. Characters (exact names/stats): ⟨Name A — role, HP 100, SPD 7, color #…⟩, ⟨Name B…⟩, ⟨Name C…⟩, ⟨Name D…⟩. Each card: Panel token, portrait image `aspect-[3/4] object-cover` (src "⟨exact URL⟩"), name in font-display text-sm, role in HUD label.
- Selection: hover/focus/arrow-keys highlight (border → character color, scale 1.04, glow); selecting plays "confirm" and shows a detail panel on the right (slide in x 40 → 0, 300ms) with stat bars animating width 0 → value over 500ms ease-out, 80ms stagger.
- Locked characters: grayscale + lock icon (lucide Lock) + tooltip "Unlock at level ⟨5⟩".
- Confirm button "ENTER THE ARENA" (Menu button token, primary filled) bottom-right; on click: screen shake on the whole root (x ±4px, 4 cycles, 250ms), burst of 24 radial particles in character color (CSS/Canvas, 600ms, ease-out, fade), then call onStart(character) after 400ms.
- Back button top-left (Esc also works).

## MOTION & FEEL (exact values)
- Screen transitions: AnimatePresence mode="wait"; exit {opacity:0, scale:0.98, filter:'blur(6px)'} 250ms; enter {opacity:1, scale:1, filter:'blur(0px)'} 400ms with 100ms delay.
- All focusable elements have a visible focus ring (ring-2 ring-primary ring-offset-2 ring-offset-black).
- SFX: preload "tick", "confirm", "back" (URLs ⟨…⟩ or synthesize with WebAudio oscillator if none); global mute toggle in the top-right; respect prefers-reduced-motion (disable float/shake/particles).

## RESPONSIVE
- Title/menu readable at 375px; menu becomes full-width stacked list; character grid 2 columns on mobile with detail panel as a bottom sheet (slide y 100% → 0).
- Touch: tap = select, second tap = confirm; swipe left/right changes character.
- Gamepad API: poll with requestAnimationFrame; D-pad/left stick navigates, A/Cross confirms, B/Circle backs.

## DEPENDENCIES
framer-motion, lucide-react, howler (optional), tailwindcss. No UI kits.

## DO NOT
- Do not render the actual game loop; stop at onStart.
- Do not use autoplaying audio before the first user gesture.
- Do not change fonts/palette/copy; do not use generic blue SaaS styling or rounded white cards.
- Do not block keyboard navigation with mouse-only handlers.

## ACCEPTANCE
Load → animated title with blinking prompt → any key goes to menu with staggered items and tilt card → "Characters" shows 4 cards with keyboard + mouse + gamepad selection, animated stat bars, lock state → "ENTER THE ARENA" shakes, bursts particles and fires onStart(character). Works at 375px and 1440px; reduced-motion disables shake/particles.
```

---

## 5. Academy lesson 的工作流程重點

官方公式（出現在每篇 lesson 結尾）：**Choose a design → copy the prompt → paste it into an AI builder → refine the result.**

1. **Choose**：在 motionsites.ai 挑「字體、版面、動畫、整體風格」都接近目標的設計；教學強調用參考當方向，不要照抄現有網站。cursor-tracking 課教你用搜尋關鍵字（"retrofuturist"）找模板。
2. **Copy**：點 `Copy Full Prompt`。他們強調 prompt 已含「layout, styling, fonts, animations, responsive behavior, dependencies, and exact content」。
3. **Paste**：貼進 Claude Code / Cursor / Bolt / Lovable / Google AI Studio / v0 / Replit；「Let the builder generate the complete first version before making changes.」（先讓它完整生一版再改）。
4. **Preview 檢查清單**：影片有沒有播、文字動畫順不順、字體載入、導覽與 CTA 能用、手機版面。即使 prompt 已寫 desktop/tablet/mobile，仍要每個尺寸測。
5. **Refine — 他們建議的追加指令（原文）**：
   - `Reduce the headline size by 15%.`
   - `Make the background video darker so the text is easier to read.`
   - `Improve the spacing between the hero content and the bottom information bar.`
   - `Make the mobile navigation animation smoother.`
   - `Keep the video at full opacity, do not add a dark overlay, and make the animation progress smoothly as the user scrolls through the page.`
   - `Move the hero content closer to the bottom of the screen.` / `Keep the center of the second section empty so the animation remains visible.` / `Increase all text to full opacity.` / `Add more navigation links without changing the overall visual style.` / `Update the typography while keeping the existing layout and animation.`
   - 換成自己的生意（保留設計、改內容）：`Keep the current layout, typography, colors, animations, and responsive behavior. Rewrite the website for my business and add services, case studies, FAQs, and a final call to action.`
   - 原則：「Small, specific instructions usually work better than asking the AI to redesign the entire page.」一次只改一件事。
6. **媒體資產工作流**（3D/scroll 課）：ChatGPT/GPT Image 生角色圖（「character looking at the camera, 16:9」+「same character looking to the side」）→ Kling Image-to-Video Multi-shot 首尾幀、prompt 只打 "animate"、4 秒 → 替換 prompt 裡的影片 URL。3D 課：一張圖 → 「Create an image like this, but from the front, back, left, and right. This is for my 3D model.」→ image-to-3D 多視角 → GLB 1K–2K 貼圖 → Claude Code：「Use this GLB file and animate it in the website as shown in the reference video. Implement it with Three.js.」→ 暗掉就補一句 **「Apply tone mapping — without it, the model renders dark and muddy.」**
7. **先 UI、後 3D**（Astra 課）：「Match this as closely as possible. Just build the UI for now. We will build the 3D interaction as a second step.」→ 再「Turn this site into an actual 3D site. The background is currently just a video; rebuild it with WebGL shaders, good lighting, a real 3D plane, and clouds.」→ 互動不夠就「Make it more interactive. Dragging should change the view…」。生成影片當**動作參考**而非最終背景。
8. **Publish**：下載 ZIP → Vercel 拖放（或 GitHub → Vercel / Bolt / AI Studio 直接 publish）。

---

## 6. 「如何即時取得最新內容」

| 管道 | URL（200） | 內容 / 欄位 |
|---|---|---|
| llms.txt | https://motionsites.ai/llms.txt | 站點定位 + 8 個頁面連結（Home/Sections/Backgrounds/Gradients/Templates/Pricing/Contact/Affiliates）。沒有單篇 prompt 的連結。 |
| sitemap.xml | https://motionsites.ai/sitemap.xml | 16 個 URL；lesson 只列 2 篇，但 /academy 頁實際連到 6 篇（slug 見 `catalog-ssr-snapshot.json`）。新教學會先出現在 /academy 的 href。 |
| Academy 頁 | https://motionsites.ai/academy | 列出 lesson + YouTube（@ViktorOddy）影片標題；lesson HTML 會 server-render 完整 prompt（這是免費內容的真正來源） |
| 首頁 / sections / backgrounds SSR | https://motionsites.ai/ 等 | 只渲染第一批卡片（標題 + 分類 + 預覽圖 URL）；完整列表需前端 JS |
| 後端資料 | Supabase 後端（REST / Edge Function / MCP 端點，細節略） | **本研究沒有呼叫這些端點**：客戶端 anon key 雖然嵌在 bundle 裡，但 Terms 明文禁止「scrape, automate bulk access」，而且這等於用別人的憑證存取其資料庫；正規做法是付費後用 MCP。 |
| MCP（付費） | https://motionsites.ai/mcp | `claude mcp add motionsites --scope user --transport http <MCP endpoint，見 https://motionsites.ai/mcp>` → 瀏覽器 OAuth 登入 → agent 可直接拉 prompt；免費帳號 3 個 |
| 社群 | https://x.com/viktoroddy 、 https://www.youtube.com/@ViktorOddy | 新設計與教學先在這裡發；投稿設計被收錄可拿 lifetime access |

建議的輕量監看腳本：每週 `curl` 一次 `/sitemap.xml` 與 `/academy`，diff `href="/lesson/…"`；新 lesson 出現就抓 HTML，取 `Show full prompt</button></div></div><span class="sr-only">…</span>` 內容（這就是本次抽取的方法，見 `snippets/motionsites/prompts/INDEX.md`）。

---

## 7. 研究限制與備註

- 未執行的部分：Supabase REST / Edge Function 查詢（理由同上）；因此「每類確切數量」「哪些是 is_free」無法給出精確值，只有官方文案的 500+ / 40+ / 3 free。
- Astra 課的 Sky Estate prompt 未能取得（SSR 空白）。
- 四份免費 prompt 都是「Hero / 兩段式落地頁」規格，沒有 Pricing / Footer / Features 類的免費樣本，這些分類的寫法只能從同骨架推論。
- 站內教學大量引用 2026 年的新工具（Claude Fable 5、GPT-6 Astra、Grok 4.5、Kimi K3、Seedance 2.5、Kling），prompt 本體卻只依賴 React + Tailwind + Framer Motion（+ Three.js 在 3D 課），非常穩定，值得直接沿用。
