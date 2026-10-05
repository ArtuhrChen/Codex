# snippets/reactbits — React Bits 元件原始碼快照

來源：https://reactbits.dev/r/<Component>-TS-TW.json（TypeScript + Tailwind 變體），抓取日期 2026-10-05。
授權：MIT + Commons Clause（可商用於網站/遊戲，不可轉售/重新散佈元件本身）。
每個 `.tsx` 檔頭都有來源 URL、文件 URL、授權與相依套件註解；同名 `-TS-TW.json` 是原始 registry 回應（含 description / dependencies / files）。

| 元件 | 檔案 | 行數 | 相依套件 | 一句話用途 | 建議場景 |
|---|---|---|---|---|---|
| SplitText | SplitText.tsx | 188 | gsap, @gsap/react（用到 gsap/SplitText 外掛，GSAP 3.13 起免費） | 字/詞/行拆開逐個進場 | 遊戲標題進場、Hero 標題 |
| BlurText | BlurText.tsx | 134 | motion | 文字由模糊變清晰逐詞/逐字浮現 | 段落進場、關卡名稱顯示 |
| ShinyText | ShinyText.tsx | 142 | motion | 金屬光澤掃過文字 | CTA、稀有道具名稱、按鈕文字 |
| CountUp | CountUp.tsx | 126 | motion | 數字滾動到目標值，支援千分位 | 分數結算、統計數字 |
| Aurora | Aurora.tsx | 233 | ogl（WebGL） | 流動極光漸層背景 | 主選單/Hero 背景 |
| Particles | Particles.tsx | 266 | ogl（WebGL） | 可設定的 3D 粒子雲，可跟隨滑鼠 | 太空/魔法風背景 |
| ClickSpark | ClickSpark.tsx | 172 | （無；Canvas 2D） | 點擊處爆出線條火花 | 遊戲點擊回饋、按鈕 juice |
| TiltedCard | TiltedCard.tsx | 162 | motion | 3D 透視傾斜卡片，可疊 overlay | 卡牌遊戲、角色/道具卡 |

使用方式：把 `.tsx` 複製進專案（例如 `src/components/reactbits/`），`npm i <相依套件>`，Tailwind v4 專案可直接用；
或改用 CLI 取得最新版：`npx shadcn@latest add https://reactbits.dev/r/SplitText-TS-TW`。

其他已在研究時下載但未展開成 .tsx 的 registry JSON（可向 Claude 索取或自行 curl）：Magnet, SpotlightCard, Dock, Hyperspeed, Galaxy,
SloshGauge, GlitchText, DecryptedText, StarBorder, ElectricBorder, Counter, PixelTransition, TextType, Lightning, LetterGlitch,
PixelBlast, GlareHover, AnimatedContent, FadeContent, Shuffle, TextPressure, Noise, Silk, DotGrid, GradientText, RotatingText,
StrokeText, FallingText, PixelSnow, Balatro, Lanyard, Stepper。
