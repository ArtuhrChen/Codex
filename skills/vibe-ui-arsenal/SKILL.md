---
name: vibe-ui-arsenal
description: |
  Arthur 的七站 UI 武器庫：React Bits、Aceternity UI、Magic UI、21st.dev、Uiverse、CodePen、
  MotionSites 的元件目錄、安裝指令、授權邊界、精選原始碼與「MotionSites 等級」prompt 模板。
  目的：寫網頁或網頁遊戲時，不用重新 Google，直接查「我要的效果在哪一站、怎麼一行裝好、
  能不能商用」，並用規格書式 prompt 一次生出高品質畫面。

  當使用者提到以下任何一項時，必須啟用此 Skill：
  - 做網站、landing page、hero、作品集、定價頁、dashboard、簡報頁
  - 做網頁遊戲的標題畫面、主選單、角色選擇、HUD、血條、結算畫面、過場
  - 要「動畫效果」「特效」「背景」「文字動畫」「卡片 hover」「按鈕特效」「粒子」「3D」
  - 點名 React Bits / Aceternity / Magic UI / 21st / Uiverse / CodePen / MotionSites / shadcn registry
  - 要寫給 Lovable / Bolt / Cursor / Claude Code 的建站 prompt、要「看起來不要那麼 AI 感」
  與 `magicui-design-assistant`（MagicUI 已移植庫）和 `game-dev-assistant`（遊戲手感）並用：
  那兩個 skill 負責「怎麼配」，本 skill 負責「去哪拿、怎麼裝、能不能用」。
---

# vibe-ui-arsenal：七站 UI 武器庫

來源影片（2026-09-29 的「Vibe Coding 網站排行榜」）給的評級：
S = MotionSites、React Bits；A = CodePen、Aceternity UI；B = Uiverse、21st.dev；C = Magic UI。
本 skill 在 2026-10-05 把七站全部實測一輪（連線、授權、安裝、機器可讀入口），
結論和影片略有出入，見下方「一句話定位」。

## 第一步：先決定「去哪一站」

| 你需要的是… | 首選 | 次選 | 為什麼 |
|---|---|---|---|
| 文字進場 / 標題動畫 | **React Bits**（SplitText、BlurText、TextType） | MagicUI TextAnimate（Arthur 已有） | React Bits 文字類 33 個最齊，gsap 品質最好 |
| 全幅背景（極光、星空、粒子、shader） | **React Bits**（59 個背景） | Aceternity（beams、aurora、stars） | React Bits 用 ogl 輕量 WebGL；Aceternity 的 spotlight / beams 最克制 |
| 整段 section（hero、pricing、testimonials、login） | **21st.dev**（hero 284 個） | Aceternity 免費 sections | React Bits / MagicUI 不做 section |
| 小控件（按鈕、開關、checkbox、loader、tooltip） | **Uiverse**（3,802 個，單檔 CSS 零依賴） | 21st | 換一顆按鈕不值得拖一個動畫庫 |
| 遊戲 HUD（血條、魔力條、Game Over、暫停選單、8-bit） | **21st 的 8bitcn / The Gridcn** | React Bits SloshGauge、Uiverse 電池 loader | 其他站完全沒有遊戲 HUD |
| 慶祝 / 回饋（彩帶、點擊火花、數字滾動） | **MagicUI Confetti + React Bits ClickSpark / CountUp** | — | 見 `references/game-ui-recipes.md` |
| 產品展示（Macbook、Bento、3D 卡片、Globe） | **Aceternity**（macbook-scroll、bento-grid、3d-card） | MagicUI Globe / BentoGrid | Aceternity 這類「表演型」最強，一頁只放一個 |
| 有 JS 邏輯的互動範例（canvas、物理、小遊戲） | **CodePen**（site:codepen.io 搜尋） | — | 唯一能 fork、即時改、看 JS 的站 |
| 寫給 AI 的建站 prompt | **MotionSites 的寫法**（規格書式） | — | 用 `references/prompt-templates.md`，不用買 |

更細的「效果 → 元件 → 站」對照表在 `references/decision-matrix.md`。

## 第二步：一行裝好（全部已實測）

```bash
# React Bits（213 個；<Component>-<JS|TS>-<CSS|TW>）
npx shadcn@latest add https://reactbits.dev/r/SplitText-TS-TW

# Magic UI（78 個，MIT）
npx shadcn@latest add "https://magicui.design/r/confetti.json"

# Aceternity UI（112 個免費；registry 名 ≠ 文件 slug，打錯回 401 不是 404）
npx shadcn@latest add https://ui.aceternity.com/registry/spotlight.json

# 21st.dev：裝 MCP 讓 Claude Code 自己搜（免費帳號每天 2 次取碼）
npx @21st-dev/cli@latest init --client claude --write
# 不用 key 也能看目錄：任何頁面 URL 加 .md
curl -sS -A "Mozilla/5.0" https://21st.dev/community/components/s/game-ui.md

# Uiverse：整庫 clone（MIT）
git clone --depth 1 https://github.com/uiverse-io/galaxy.git
```

前置共用：`npm i motion clsx tailwind-merge` + `lib/utils.ts` 的 `cn()`；新版元件 import `motion/react`，不是 `framer-motion`。

## 第三步：授權邊界（寫商業案 / 遊戲前先看）

| 站 | 授權 | 商用成品 | 把元件原始碼放進公開 repo |
|---|---|---|---|
| React Bits | MIT + Commons Clause | ✅ | ✅（不能拿元件本身去賣） |
| Magic UI | MIT | ✅ | ✅ |
| Uiverse | MIT（建議署名） | ✅ | ✅ |
| CodePen 公開 pen | MIT（預設） | ✅ | ✅（私有 pen 無授權） |
| Aceternity 免費元件 | 自訂 Licence | ✅（Games 明列為合法 End Product） | ❌ 不得重新打包散佈 → 本 repo 只留安裝指令 |
| 21st 社群元件 | 各自標示，不少是 unknown | 看單一元件 | 特效類回原站拿，授權才明確 |
| MotionSites | 付費 prompt 庫 | ✅ 做出的網站是你的 | ❌ prompt 文字不得轉載 → 本 repo 只留連結與結構拆解 |

## 第四步：寫 prompt 時用規格書格式

MotionSites 之所以是 S 級，不是因為設計檔，而是它的 prompt 是**工程師能照做的規格書**：
任務+技術棧 → SETUP → 色票 → 材質 token → 結構樹 → 逐元件規格（含文案原文）→ 動畫數值 → 媒體 URL → 響應式 → DO NOT / ACCEPTANCE。
`references/prompt-templates.md` 有兩份可直接貼的模板（網頁 Hero、遊戲標題/選單/角色選擇），
以及把七站元件寫進 DEPENDENCIES 的寫法。

## 第五步：主動建議，不要等 Arthur 問

和另外兩個 skill 一樣，提案時講到元件層級：

> 「標題用 React Bits `SplitText`（gsap，chars 進場），背景用 Aceternity `spotlight`（純 Tailwind 零成本），
> 過關用 MagicUI `Confetti`，血條直接拿 21st 的 8bitcn Health Bar，按鈕拿 Uiverse 的 3D 卡通按鈕改色。」

一頁最多 1 個 hero 級動畫 + 1 種微互動；手機上 WebGL 類（ogl / three）要降級或關掉；
Aceternity 沒有內建 `prefers-reduced-motion`，要自己包 `useReducedMotion`。

## 資料夾地圖

```
skills/vibe-ui-arsenal/
├── SKILL.md                      ← 你在這
├── references/
│   ├── decision-matrix.md        效果 → 元件 → 站 → 安裝指令，一張表
│   ├── game-ui-recipes.md        遊戲畫面配方（標題、HUD、結算、過場）
│   ├── prompt-templates.md       規格書式 prompt 模板（網頁 / 遊戲）
│   ├── reactbits.md              213 個元件目錄 + props + 相依統計
│   ├── aceternity.md             112 個免費元件 + 何時克制
│   ├── magicui-delta.md          78 個 vs Arthur 已有 26 個，缺 52 個的補完清單
│   ├── 21st.md                   MCP / CLI / markdown twin / 遊戲 UI tag
│   ├── uiverse-codepen.md        3,802 個元素統計 + CodePen 搜尋法
│   └── motionsites.md            定價、授權、prompt 結構逆向工程、Academy 工作流
├── snippets/
│   ├── reactbits/  8 個 .tsx（MIT+CC）      ├── magicui/   8 個 .tsx（MIT）
│   ├── uiverse/    25 個 .html（MIT）        ├── 21st/      目錄 .md 範例 + skills-index.json
│   ├── aceternity/ INDEX.md（只有指令）      └── motionsites/ INDEX.md（只有連結）
└── scripts/update-sources.sh     重新抓 llms.txt / sitemap / registry / galaxy 到 .cache/
```

## 保鮮

目錄會過期，但入口不會：五站有 `llms.txt`（React Bits、Magic UI、Aceternity、21st、MotionSites），
三站有 registry JSON，Uiverse 有 git repo。每季跑一次 `scripts/update-sources.sh`，
diff `.cache/` 裡的 sitemap 就知道新增了什麼。
