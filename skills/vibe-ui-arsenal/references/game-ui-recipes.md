# 遊戲 UI 配方：七站元件 × game-dev-assistant

> 原則不變：遊戲迴圈交給 Canvas / Phaser / PixiJS；下面全是 **DOM 層**（主選單、HUD、結算、過場），疊在 canvas 上方。
> 同一畫面最多一個 WebGL 背景；手機上 ogl / three 類全部降級成 CSS 背景或關掉。

## 1. 標題畫面（Title Screen）

```
背景   RB Aurora（ogl）或 AC stars-background + shooting-stars；手機改 CSS 動態漸層
標題   RB SplitText（chars, from scale 1.4 → 1）或 MU AuroraText（已有）
提示   「PRESS ANY KEY」用 RB ShinyText 或 CSS blink
音效   howler：confirm；按任意鍵 → 白閃 120ms → AnimatePresence 切到選單
```
prompt 直接用 `prompt-templates.md` 模板 B 的 SCREEN 1。

## 2. 主選單 / 設定

```
選單項  stagger 進場用 MU BlurFade（已有）；選中用 RB ElectricBorder 或 StarBorder
預覽卡  AC 3d-card 或 RB TiltedCard（showMobileWarning={false}）
開關    音效/音樂：UV Toggle-switches/vinodjangid07_quick-moth-22（電源鍵霓虹）
快捷欄  RB Dock（技能欄/物品欄，游標靠近放大）
按鈕    UV Buttons/TanimMahbub_selfish-goat-90（卡通 3D）或 carlosepcc_heavy-emu-25（Tailwind 一行）
```

## 3. 角色 / 關卡選擇

```
格子    AC bento-grid 或 MU bento-grid；關卡地圖可用 MU animated-beam 連線
卡片    RB FlipCard（翻面看屬性）或 AC draggable-card
屬性條  RB SloshGauge（液體）或 21st 8bitcn XP Bar（像素）
鎖定    grayscale + lucide Lock + tooltip（UV Tooltips/MohamedAboSeada_bitter-skunk-14）
確認    screen-shake（game-dev-assistant）+ RB ClickSpark + howler confirm
```

## 4. 遊戲中 HUD

```
血/魔   21st 8bitcn Health Bar / Mana Bar（像素風）；RB SloshGauge（寫實液體）；UV 電池 loader（充能）
分數    RB CountUp 或 MU NumberTicker（已有）；Combo 用 RB Counter（拉霸滾輪）
通知    MU animated-list（戰鬥日誌 / 擊殺訊息）；升級用 UV Notifications/alexruix_gentle-octopus-87
對話    MU terminal（科幻）或 MU TypingAnimation（已有）；AC typewriter-effect
受傷    RB GlitchText 閃一下 + 螢幕紅邊 CSS
點擊    RB ClickSpark 包住整個遊戲容器（全域火花）
```

## 5. 過場與載入

```
關卡切換  RB PixelTransition（像素溶解）或 MU BlurFade（已有）
載入      AC multi-step-loader（「生成地圖… 載入音效…」）或 UV loaders/adamgiebl_thin-lionfish-5
關卡標題  RB SplitText「STAGE 3」+ MU TextAnimate rollIn（已有）
```

## 6. 結算 / 通關 / Game Over

```
通關      MU confetti（canvas-confetti，fireworks 模式）+ RB CountUp 分數加總 + howler 勝利音
評價字    MU sparkles-text「PERFECT!」；RB ShinyText「NEW RECORD」
背景      AC meteors（≤20 顆）或 MU Meteors（已有）
Game Over RB FallingText（matter-js 掉字）+ RB GlitchText + UV Buttons/Cevorob_serious-shrimp-82「GAME ON」再來一局
```

## 7. 風格套餐（一頁只選一套，避免 Aceternity 式風格打架）

| 風格 | 字體 | 背景 | 按鈕 | 文字 |
|---|---|---|---|---|
| 霓虹賽博 | Orbitron / Share Tech Mono | RB LetterGlitch 或 MU flickering-grid | UV zjssun_tidy-sloth-40（霓虹）/ namecho（glitch） | RB DecryptedText |
| 8-bit 像素 | Press Start 2P | CSS scanline + MU RetroGrid（已有） | 21st 8bitcn / UV barisdogansutcu（Win95） | RB GlitchText |
| 太空科幻 | Exo 2 / Inter | AC stars + shooting-stars 或 RB Galaxy | AC hover-border-gradient | MU terminal |
| 奇幻 RPG | Cinzel | RB Aurora（低飽和） | UV SelfMadeSystem_terrible-rat-80（插畫 3D） | RB SplitText |
| 休閒卡通 | Fredoka / Nunito | CSS 漸層 + MU DotPattern（已有） | UV TanimMahbub_selfish-goat-90 | RB BlurText |

## 8. 效能守則（來自七站實測）

- React Bits 背景類 52 個用 ogl、24 個用 three：手機同時最多 1 個，或用 `matchMedia('(max-width: 768px)')` 換成 CSS。
- Aceternity `sparkles` 拖三包 tsparticles，遊戲已有粒子系統時不要用；`canvas-reveal-effect` / `card-spotlight` 會再開一個 three.js context 跟遊戲 canvas 搶 GPU。
- Aceternity 元件 0 個內建 `prefers-reduced-motion`；用 `motion/react` 的 `useReducedMotion()` 包一層。
- Uiverse 很多 CSS 用裸 `button {}` / `input {}` 選擇器，進 React 前一定改成 class，不然整頁被染色。
- MagicUI `terminal` 自帶一個 `TypingAnimation`，和 Arthur 已移植的同名，import 時取別名。
