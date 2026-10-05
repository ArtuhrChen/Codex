# Prompt 模板：MotionSites 等級的網頁 / 遊戲畫面規格書

> 這份是自己逆向整理的寫法，不是 MotionSites 的 prompt 本文，可自由使用、修改、商用。
> 核心觀念：**好的 AI 建站 prompt 是一份工程師能照做的規格書，不是形容詞**。十個區塊缺一不可：
> 任務+技術棧 → SETUP → 色票/Tailwind → 材質 token → 結構樹（z-index）→ 逐元件規格（含文案原文）→ 動畫數值 → 媒體 URL → 響應式 → 依賴 / DO NOT / ACCEPTANCE。

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


## 模板 A：網頁 Hero + Navbar（直接貼給 Claude Code / Lovable / Bolt / Cursor）

把 ⟨⟩ 換掉；SETUP、結構樹、MOTION、DO NOT、ACCEPTANCE 五段不要刪。

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

## 模板 B：遊戲標題畫面 + 主選單 + 角色選擇

同一骨架，多了三樣遊戲必備：狀態機、鍵盤/手把/觸控輸入、音效與 game feel 數值。搭配 `game-dev-assistant` skill 的 howler / 粒子 / screen-shake 一起用。

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

## 後續微調（refine）句型

先讓 AI 完整生出第一版，再**一次只改一件事**：

- `Reduce the headline size by 15%.`
- `Make the background video darker so the text is easier to read.`
- `Make the mobile navigation animation smoother.`
- `Keep the current layout, typography, colors, animations, and responsive behavior. Rewrite the content for ⟨my business / my game⟩.`
- 3D 模型暗掉：`Apply tone mapping — without it, the model renders dark and muddy.`
- 先 UI 後 3D：`Just build the UI for now. We will build the 3D interaction as a second step.`

## 把七站元件塞進 prompt 的寫法

在 DEPENDENCIES 區塊直接指定來源與安裝指令，AI 就不會自己亂造輪子：

```text
## DEPENDENCIES
- React Bits SplitText (TS + Tailwind): npx shadcn@latest add https://reactbits.dev/r/SplitText-TS-TW  → use for the H1 entrance
- Magic UI Confetti: npx shadcn@latest add "https://magicui.design/r/confetti.json" → fire on level clear
- Aceternity Spotlight: npx shadcn@latest add https://ui.aceternity.com/registry/spotlight.json → hero top-left light
- 8bitcn Health Bar (via 21st): see https://21st.dev/@theorcdev/library/8bitcn
No other UI libraries.
```
