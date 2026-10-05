# 決策矩陣：效果 → 元件 → 站 → 安裝

> 安裝指令前綴：RB = `npx shadcn@latest add https://reactbits.dev/r/<Name>-TS-TW`；
> MU = `npx shadcn@latest add "https://magicui.design/r/<slug>.json"`；
> AC = `npx shadcn@latest add https://ui.aceternity.com/registry/<name>.json`；
> UV = `snippets/uiverse/<分類>/<作者_slug>/`；21 = 21st.dev 頁面。
> 手機風險：低 = CSS/少量 motion；中 = rAF 或 scroll-driven；高 = WebGL/Canvas 持續繪製。

## A. 文字

| 效果 | 首選 | 備選 | 相依 | 手機 |
|---|---|---|---|---|
| 標題逐字/逐詞進場 | RB `SplitText` | MU TextAnimate（已有）、AC `text-generate-effect` | gsap | 低 |
| 模糊→清晰浮現 | RB `BlurText` | MU BlurFade（已有） | motion | 低 |
| 打字機 / 多句輪播 | RB `TextType` | AC `typewriter-effect`、MU TypingAnimation（已有） | gsap / motion | 低 |
| 光澤掃過文字 | RB `ShinyText` | MU `animated-shiny-text` | 無 | 低 |
| 漸層流動標題 | MU AuroraText（已有） | RB `GradientText` | 無 | 低 |
| 關鍵字輪播 | MU WordRotate（已有） | RB `RotatingText`、AC `flip-words` | motion | 低 |
| 駭客解碼 / 故障字 | RB `DecryptedText` / `GlitchText` | MU HyperText（已有）、AC `encrypted-text` | 無 | 低 |
| 數字滾動 | RB `CountUp` | MU NumberTicker（已有）、RB `Counter`（拉霸式） | motion | 低 |
| 文字周圍星光 | MU `sparkles-text` | — | motion | 低 |

## B. 背景

| 效果 | 首選 | 備選 | 相依 | 手機 |
|---|---|---|---|---|
| 極光 | RB `Aurora` | AC `aurora-background`（CSS，較輕） | ogl / 無 | 中 / 低 |
| 星空 + 流星 | AC `stars-background` + `shooting-stars` | MU Meteors（已有） | 無 | 中 |
| 漂浮粒子 | RB `Particles` | MU Particles（已有） | ogl | 中 |
| 一道聚光燈（零成本） | AC `spotlight` | — | 無 | 低 |
| 細線光束 | AC `background-beams` | — | motion | 低–中 |
| 絲綢 / 光線 / 線條 shader | RB `Silk` / `LightRays` / `Threads` | — | ogl, r3f | 高 |
| 超空間 / 速度感 | RB `Hyperspeed` | — | three + postprocessing | 高 |
| 閃爍方格 / 互動網格 | MU `flickering-grid` / `interactive-grid-pattern` | RB `DotGrid`、AC `grid` | 無 | 中 / 低 |
| 復古透視網格 | MU RetroGrid（已有） | UV `Patterns/adamgiebl_curvy-earwig-79` | 無 | 低 |
| 雷電 / 像素爆炸 / 字母雨 | RB `Lightning` / `PixelBlast` / `LetterGlitch` | — | 無 / three / 無 | 中–高 |

## C. 卡片與容器

| 效果 | 首選 | 備選 | 相依 | 手機 |
|---|---|---|---|---|
| 3D 傾斜卡 | AC `3d-card` | RB `TiltedCard`（手機要 `showMobileWarning={false}`） | 無 / motion | 低 |
| 游標聚光卡 | RB `SpotlightCard` | MU MagicCard（已有） | 無 | 低 |
| Bento 格 | AC `bento-grid` | MU `bento-grid`、RB `MagicBento` | 無 | 低 |
| 流動邊框 / 能量框 | RB `ElectricBorder` / `StarBorder` | MU BorderBeam / ShineBorder（已有）、AC `moving-border`、`glowing-effect` | 無 | 低 |
| 翻牌 / 拖曳卡 | RB `FlipCard` | AC `draggable-card` | motion | 低 |
| 產品截圖立起 / Macbook | AC `container-scroll-animation` / `macbook-scroll` | MU `safari` / `iphone` mockup | motion | 中–高 |
| 放大鏡 | MU `lens` | — | motion | 低 |

## D. 導覽與互動

| 效果 | 首選 | 備選 | 相依 | 手機 |
|---|---|---|---|---|
| macOS Dock（技能欄 / 物品欄） | RB `Dock` | MU `dock` | motion | 中 |
| 捲動感知導覽列 | AC `floating-navbar` / `resizable-navbar` | — | motion | 低 |
| 磁吸 hover | RB `Magnet` | — | 無 | 觸控無效 |
| 點擊火花 | RB `ClickSpark` | MU `cool-mode` | 無 | 低 |
| 長按確認 | RB `HoldButton` | — | 無 | 低 |
| 分步流程 | RB `Stepper` | AC `multi-step-loader` | motion | 低 |
| 依序滑入清單（通知流 / 戰鬥日誌） | MU `animated-list` | — | motion | 低 |
| 節點連線光束（技能樹） | MU `animated-beam` | — | motion | 低 |
| 終端機輸出 | MU `terminal` | — | motion | 低 |

## E. 按鈕與小控件（Uiverse 主場）

| 效果 | 首選 | 備選 |
|---|---|---|
| 主 CTA（光澤 / 脈衝） | MU ShimmerButton / PulsatingButton（已有） | AC `hover-border-gradient`、UV `Buttons/elijahgummer_short-bird-25` |
| 卡通 3D 按鈕（遊戲 Start） | UV `Buttons/TanimMahbub_selfish-goat-90` | UV `Buttons/carlosepcc_heavy-emu-25`（Tailwind 一行） |
| 霓虹 / 賽博 / glitch 按鈕 | UV `Buttons/zjssun_tidy-sloth-40` / `namecho_slippery-moth-23` | — |
| 復古 Win95 / 像素按鈕 | UV `Buttons/barisdogansutcu_heavy-dragon-15` | 21 8bitcn Button |
| 主題切換開關 | UV `Toggle-switches/JkHuger_itchy-turtle-45` | MU `animated-theme-toggler` |
| 電源鍵開關（音效開關） | UV `Toggle-switches/vinodjangid07_quick-moth-22` | — |
| Loading | UV `loaders/adamgiebl_thin-lionfish-5` | UV `loaders/Cybercom682_happy-mole-82`（Tailwind） |
| Toast / 通知 | UV `Cards/PriyanshuGupta28_sour-rat-57` | UV `Notifications/alexruix_gentle-octopus-87`（升級通知） |
| 搜尋框 / 表單 | UV `Inputs/garerim_rare-moth-56` / `Forms/Yaya12085_massive-warthog-99` | 21 login 25 個 |

## F. 慶祝與結算

| 效果 | 首選 | 備選 |
|---|---|---|
| 彩帶 / 煙火 / emoji 噴發 | MU `confetti`（canvas-confetti） | — |
| 分數結算滾動 | RB `CountUp` / `Counter` | MU NumberTicker（已有） |
| 像素溶解過場 | RB `PixelTransition` | MU BlurFade（已有） |
| Game Over 掉字 | RB `FallingText`（matter-js） | — |
| 液體量表（血 / 魔 / 氧氣） | RB `SloshGauge` | 21 8bitcn Health/Mana/XP Bar、UV `loaders/JaydipPrajapati1910_strong-zebra-9` |

## G. 整段 section（21st 主場）

| 需求 | 去哪 |
|---|---|
| Hero（284 個） | https://21st.dev/community/components/s/hero |
| Pricing（49）/ Testimonials（42）/ Login（25） | `https://21st.dev/community/components/s/<tag>` |
| 遊戲 UI（36）/ HUD（9） | https://21st.dev/community/components/s/game-ui 、 https://21st.dev/community/components/s/hud |
| 8-bit 全套（104 個 shadcn 風） | https://21st.dev/@theorcdev/library/8bitcn |
| 科幻 HUD（Energy Meter、Waveform） | 21st 搜 "The Gridcn" |
| Aceternity 免費 sections | https://ui.aceternity.com/components （hero-sections-free 等三頁，手動複製） |
