# React Bits 參考手冊（reactbits.dev）

> 📁 文中提到的 `raw/…` 原始資料不進版控；執行 `bash skills/vibe-ui-arsenal/scripts/update-sources.sh` 會重新抓到 `skills/vibe-ui-arsenal/.cache/`。

> 整理日期：2026-10-05。資料來源全部取自 `https://reactbits.dev/llms.txt`、`https://reactbits.dev/sitemap.xml`、
> `https://reactbits.dev/r/registry.json` 與各元件 registry JSON；文中所有 URL 皆於整理當日 curl 回 200。
> 原始檔副本：`raw/reactbits.llms.txt`、`raw/reactbits.sitemap.xml`、`raw/reactbits.LICENSE`、`raw/rb-registry/`。
> 已抽出的 8 個元件原始碼：`snippets/reactbits/`（見該資料夾 INDEX.md）。

## 1. 一句話定位

React Bits 是「最大、最有創意的 React 動畫元件庫」：**213 個免費元件**（文字動畫 33、動畫 40、UI 元件 47、
Micro 微互動 34、背景 59），每個元件都有 **JS-CSS / JS-TW / TS-CSS / TS-TW 四種變體**，複製貼上或 CLI 安裝即可用。
它不是 UI kit（沒有 Button/Form 這類基礎元件），而是「讓頁面出彩的特效層」——非常適合疊在 shadcn/ui 或 MagicUI 之上。
作者 David Haz；另有付費的 React Bits Pro（頁面區塊、App UI、模板），**本文件只涵蓋免費庫**。

## 2. 授權：MIT + Commons Clause（可以商用，但不能轉賣元件）

LICENSE 原文（`raw/reactbits.LICENSE`，上游 `https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md`）重點：

- 以 MIT 為基礎：可自由使用、複製、修改、合併、發布、散佈，**前提是「作為應用程式、網站或產品的一部分」**。
- Commons Clause 限制：「可用於任何商業用途，**只要你不出售、再授權或重新散佈元件本身**——無論是單獨、打包，或移植版」。
- 無擔保條款（AS IS）。

**對 Arthur 的實際意義：**

| 用途 | 可否 |
|---|---|
| 放進自己的商業網站、SaaS、客戶案子 | 可以 |
| 放進販售的網頁遊戲 / Steam / itch.io 遊戲（元件是遊戲的一部分） | 可以 |
| 修改原始碼後用在產品裡 | 可以（保留版權聲明） |
| 把 React Bits 元件拆出來當「元件包 / 模板 / UI kit」販賣或免費重新散佈 | **不可以** |
| 移植成 Vue/Svelte 版本後散佈 | **不可以**（官方已有 vue-bits.dev / sveltebits.xyz） |
| 放在 GitHub 公開專案的 `components/` 裡（作為應用的一部分） | 可以，但建議保留檔頭的授權註解 |

注意：它**不是** OSI 認可的開源授權（Commons Clause 使其不符合 OSI 定義），若專案要求「純 MIT 相依」要留意。

## 3. 安裝方式

### 3.1 CLI 指令（來自 llms.txt，已驗證 registry URL 回 200）

命名規則：`<Component>-<LANG>-<STYLE>`，`LANG = JS | TS`，`STYLE = CSS | TW`（Tailwind）。元件名是 PascalCase（如 `SplitText`）。

```bash
# shadcn CLI（推薦，專案需有 components.json；Tailwind 專案用 -TW 變體）
npx shadcn@latest add https://reactbits.dev/r/SplitText-TS-TW

# jsrepo CLI（同一個 URL）
npx jsrepo@latest add https://reactbits.dev/r/SplitText-TS-TW

# README 另給的 namespace 寫法（需在 components.json 的 registries 設定 @react-bits）
npx shadcn@latest add @react-bits/BlurText-TS-TW
```

驗證結果：

| URL | 狀態 | 說明 |
|---|---|---|
| `https://reactbits.dev/r/SplitText-TS-TW.json` | 200 application/json | shadcn registry-item 格式 |
| `https://reactbits.dev/r/SplitText-TS-TW`（無 .json） | 200 application/json | 同上，CLI 用這個 |
| `https://reactbits.dev/r/SplitText-JS-CSS.json` | 200 | 四種變體皆可 |
| `https://reactbits.dev/r/registry.json` | 200 | **全庫索引**：852 個 item（213 × 4），含 description 與 dependencies |
| `https://reactbits.dev/r/jsrepo-manifest.json` | 200 | jsrepo 清單 |
| `https://reactbits.dev/get-started/installation` | 200 | 安裝頁（SPA，內容需瀏覽器渲染） |
| `https://reactbits.dev/get-started/mcp` | 200 | MCP 設定頁（SPA） |

Registry JSON 結構（以 SplitText-TS-TW 為例）：`name / title / description / type: registry:component /
dependencies: ["gsap@^3.13.0","@gsap/react@^2.1.2"] / registryDependencies: [] / files[{path:"SplitText/SplitText.tsx", content}]`。
**`files[].content` 就是完整原始碼**，所以不用 CLI 也能 curl 下來手動放進專案。

### 3.2 手動安裝（AI coding tool 最常用）

1. 在 reactbits.dev 元件頁切換 TS / Tailwind，複製程式碼；或 curl `https://reactbits.dev/r/<Name>-TS-TW.json` 取 `files[0].content`。
2. 放到 `src/components/reactbits/<Name>.tsx`。
3. `npm i` registry JSON 裡列的 `dependencies`（見第 4 節表格最右欄）。
4. 多數元件有 `'use client'`，Next.js App Router 可直接用；Vite 專案無影響。

### 3.3 相依套件總覽（TS-TW 變體，213 個元件統計）

| 套件 | 使用元件數 | 備註 |
|---|---|---|
| ogl | 52 | 輕量 WebGL，幾乎所有 shader 背景都用它 |
| motion（Framer Motion v12） | 40 | 文字/UI 動畫 |
| gsap（^3.13） | 36 | 含 ScrollTrigger、SplitText 外掛（3.13 起全部免費） |
| three（^0.180） | 24 | 3D 背景 |
| @hugeicons/react + core-free-icons | 15–17 | 多數 Micro 元件 |
| @react-three/fiber / drei | 7 / 4 | Silk、Beams、Dither、ModelViewer 等 |
| postprocessing | 4 | Hyperspeed、PixelBlast、Dither、GridScan |
| matter-js | 2 | FallingText、FolderFloat（2D 物理） |
| vgpu（WebGPU） | 2 | ShapeWaves、AeroShards |
| 無相依 | 約 50 | ClickSpark、Magnet、SpotlightCard、GlitchText、Lightning、ElectricBorder… |

## 4. 完整元件目錄（213 個，依分類）

格式：`CLI 名稱`：中文用途 —（相依）。文件頁 URL = `https://reactbits.dev/<分類路徑>/<kebab-case>`，例如 `https://reactbits.dev/text-animations/split-text`。

### 4.1 Text Animations（33）路徑 `/text-animations/`

- `ASCIIText`：文字配上動態 ASCII 背景，復古感 —（three）
- `BlurText`：文字從模糊逐詞/逐字變清晰 —（motion）
- `CircularText`：字元排成圓圈並可旋轉 —（motion）
- `CountUp`：數字滾動計數，支援小數與千分位 —（motion）
- `CurvedLoop`：文字沿曲線循環流動，可拖曳 —（無）
- `DecryptedText`：駭客風亂碼解密成真實文字 —（motion）
- `DepthText`：多層擠出立體字，隨指標視差 —（無）
- `EchoText`：殘影跟著文字最後收攏 —（無）
- `FallingText`：字元受重力掉落彈跳 —（matter-js）
- `FoldText`：行文字像摺紙攤開 —（gsap）
- `FuzzyText`：抖動毛邊文字，hover 可調強度 —（無）
- `GlitchText`：RGB 錯位故障效果 —（無）
- `GradientText`：漸層色掃過文字 —（motion）
- `MaskedHeading`：大標題透出流動色塊或圖片，逐詞顯示 —（gsap）
- `ParticleText`：粒子聚合成文字，可散開重組 —（無）
- `RotatingText`：多句輪播，3D 翻轉切換 —（motion）
- `ScrambledText`：游標靠近處文字擾動 —（gsap）
- `ScrollFloat`：捲動時文字漂浮/視差 —（gsap）
- `ScrollReveal`：捲動時文字去模糊顯現 —（gsap）
- `ScrollVelocity`：跑馬燈速度隨捲動速度變化 —（motion）
- `ShinyText`：金屬光澤掃過文字 —（motion）
- `Shuffle`：字元洗牌後定格 —（gsap, @gsap/react）
- `SplitFlapText`：機場翻板式切換文字 —（無）
- `SplitText`：拆成字/詞/行的交錯進場 —（gsap, @gsap/react）
- `StrokeText`：描邊先畫出再填色 —（gsap）
- `TechText`：字母變虛線路徑，可拖曳回彈 —（無）
- `TextCursor`：文字跟隨游標並留下殘影 —（motion）
- `TextLoop`：沿 SVG 路徑的無縫文字跑馬燈 —（gsap）
- `TextPressure`：依指標距離改變字重/寬度（可變字型） —（無）
- `TextType`：打字機效果含游標 —（gsap）
- `TrueFocus`：逐詞聚焦/失焦 —（motion）
- `VariableProximity`：字型屬性隨指標距離連續變化 —（motion）
- `WarpText`：WebGL 扭曲折射文字 —（ogl）

### 4.2 Animations（40）路徑 `/animations/`

- `AnimatedContent`：通用進場包裝器（方向/距離/縮放/消失） —（gsap）
- `Antigravity`：3D 反重力粒子場，排斥游標 —（three, @react-three/fiber）
- `BlobCursor`：有慣性的果凍游標 —（gsap）
- `ClickSpark`：點擊處爆出火花 —（無）
- `Crosshair`：十字瞄準線游標，hover 連結有效果 —（gsap）
- `Cubes`：3D 旋轉方塊群 —（gsap）
- `CursorGrid`：Canvas 格子隨游標點亮、點擊脈衝 —（無）
- `DitherVeil`：1-bit 抖動照片被游標燒出彩色 —（ogl）
- `ElasticMesh`：彈簧網格被指標拉伸回彈 —（ogl）
- `ElectricBorder`：抖動電流邊框 —（無）
- `ElectricLogo`：把 SVG/PNG 變成閃電輪廓 —（ogl）
- `FadeContent`：簡單淡入/滑入包裝器 —（gsap）
- `GhostCursor`：半透明幽靈游標拖尾 —（three）
- `GlareHover`：hover 時掃過反光 —（無）
- `GlowCursor`：shader 光束游標尾跡 —（ogl）
- `GradualBlur`：邊緣漸進模糊 —（無）
- `HalftoneReveal`：半色調網點在游標處變清晰 —（ogl）
- `ImageTrail`：游標拖出圖片軌跡 —（gsap）
- `LaserFlow`：雷射光流到表面 —（three）
- `LogoLoop`：品牌 logo 無縫跑馬燈 —（無）
- `MagicRings`：互動魔法光環 —（three）
- `Magnet`：元素被游標磁吸再彈回 —（無）
- `MagnetLines`：線條場指向游標 —（無）
- `MetaBalls`：液態金屬球融合分離 —（ogl）
- `MetallicPaint`：SVG 套用液態金屬漆 shader —（無）
- `Noise`：動態膠片顆粒覆蓋層 —（無）
- `OrbitImages`：圖片沿 SVG 路徑環繞 —（motion）
- `PixelSwap`：像素碎片覆蓋、換內容、再溶解 —（無）
- `PixelTrail`：像素方塊游標尾跡 —（three, r3f, drei）
- `PixelTransition`：hover 時像素溶解切換內容 —（gsap）
- `Ribbons`：物理驅動的飄帶游標尾跡 —（ogl）
- `RippleDistortion`：指標水波扭曲內容 —（ogl）
- `ScrollExpand`：媒體框捲動時長到滿版 —（無）
- `ShapeBlur`：hover 時模糊幾何形變形 —（three）
- `SplashCursor`：游標液體飛濺 —（無）
- `StarBorder`：星光沿邊框繞行 —（無）
- `StickerPeel`：貼紙掀角撕起 —（gsap）
- `Strands`：發光絲線飄動（透明畫布） —（ogl）
- `SwarmCursor`：粒子群追逐游標 —（ogl）
- `TargetCursor`：四角鎖定目標的游標 —（gsap, react-dom）

### 4.3 Components（47）路徑 `/components/`

- `AccordionGallery`：hover 展開面板顯示視差圖片 —（gsap）
- `AnimatedList`：清單項目交錯進場 —（motion）
- `BorderGlow`：隨游標方向的發光網格邊框 —（無）
- `BounceCards`：卡片彈跳進場 —（gsap）
- `BubbleMenu`：圓形展開式浮動選單 —（gsap）
- `CardNav`：可展開卡片面板的導覽列 —（gsap, react-icons）
- `CardSwap`：卡片位置交換動畫 —（gsap）
- `Carousel`：支援觸控/循環的輪播 —（motion, react-icons）
- `ChromaGrid`：灰階格子 hover 顯色 —（gsap）
- `CircularCarousel`：3D 環形圖片輪播，可拖曳慣性 —（無）
- `CircularGallery`：圓形軌道旋轉畫廊 —（ogl）
- `Counter`：拉霸式數字滾輪計數器 —（motion）
- `CurvedInput`：弧形輸入框 —（無）
- `DecayCard`：hover 視差並崩解卡片內容 —（gsap）
- `DepthCarousel`：3D 深度軌道卡片輪播 —（gsap）
- `Dock`：macOS 風放大 Dock —（motion）
- `DomeGallery`：3D 半球面沉浸畫廊 —（@use-gesture/react）
- `DriftWall`：無盡透視磁磚牆 —（無）
- `ElasticSlider`：彈性拉伸滑桿 —（motion）
- `FlexCarousel`：邊緣液態玻璃折射的無限圖片列 —（ogl）
- `FlowingMenu`：液態指示器在選單間滑動 —（gsap）
- `FluidGlass`：液態扭曲玻璃容器 —（three, r3f, drei, maath）
- `FlyingPosters`：3D 海報隨捲動旋轉 —（ogl）
- `Folder`：互動資料夾開啟顯示內容 —（無）
- `GlassIcons`：毛玻璃風圖示 —（無）
- `GlassSurface`：Apple 風即時扭曲玻璃表面 —（無）
- `GooeyNav`：黏液狀導覽指示器 —（無）
- `InfiniteMenu`：無限循環選單 —（gl-matrix）
- `InfiniteSpiral`：無限 3D 螺旋圖片 —（無）
- `Lanyard`：3D 掛繩吊牌物理擺動 —（registry 標記無相依，**但原始碼實際 import three、@react-three/fiber、drei、@react-three/rapier、meshline**，另需 card.glb/lanyard.png） 
- `LineSidebar`：游標靠近時位移高亮的側欄 —（無）
- `MagicBento`：互動 Bento 格子 —（gsap）
- `Masonry`：動畫重排的瀑布流 —（gsap）
- `ModelViewer`：Three.js 模型檢視器 —（three, r3f, drei）
- `MorphSlider`：WebGL 圖片融化切換 —（ogl, gsap）
- `OptionWheel`：弧形轉輪選項選擇器 —（無）
- `PillNav`：膠囊導覽，滑動高亮 —（gsap, react-router-dom）
- `PixelCard`：像素擴散顯示卡片 —（無）
- `ProfileCard`：3D hover 反光個人卡 —（無）
- `ReflectiveCard`：用 webcam 做動態反射的卡片 —（lucide-react）
- `ScrollStack`：捲動堆疊卡片 —（lenis）
- `SpecularButton`：shader 鏡面邊光玻璃按鈕 —（ogl）
- `SpotlightCard`：游標聚光燈卡片 —（無）
- `Stack`：可滑動的卡片堆 —（motion）
- `StaggeredMenu`：交錯動畫的全螢幕選單 —（gsap）
- `Stepper`：多步驟進度指示 —（motion）
- `TiltedCard`：3D 透視傾斜卡片 —（motion）

### 4.4 Micro（34）路徑 `/micro/`（小型微互動：按鈕、開關、載入器）

- `BellToggle`：鈴鐺響動的通知開關 —（motion, hugeicons）
- `BranchedMenu`：樹狀分支展開選單 —（hugeicons）
- `CallChip`：工具呼叫狀態晶片（計時/成功/失敗） —（hugeicons）
- `CodeSlots`：OTP 驗證碼輸入格 —（motion, hugeicons）
- `CometDial`：甩動式刻度轉盤，帶彗星尾 —（motion）
- `DodgeField`：子元素躲避指標幾次後回家 —（motion）
- `FlipCard`：可點擊/拖曳翻轉的雙面卡 —（motion）
- `FolderFloat`：資料夾彈出便條雲 —（matter-js）
- `FuseButton`：完成後帶可撤銷導火線的按鈕 —（hugeicons）
- `GlideSelect`：高亮滑動的下拉選擇 —（hugeicons）
- `HoldButton`：長按確認液體填充按鈕 —（無）
- `JellyRadio`：果凍擠壓的單選晶片 —（motion）
- `LatticeLoader`：3x3 格子波動載入器 + 計時 —（無）
- `PaperCrumple`：圖片被捏成 3D 紙團 —（three）
- `PeekRating`：預覽式星星評分 —（hugeicons）
- `PromptBar`：AI 聊天輸入列（@ / 指令 / 模型選擇） —（motion, hugeicons）
- `PulseHeart`：按讚心跳按鈕 —（hugeicons）
- `RefineFrame`：媒體生成階段框（排隊/生成/完成） —（hugeicons）
- `RubberSegment`：橡皮拇指的分段控制 —（motion）
- `ScrubField`：拖曳刷動數值欄位 —（motion）
- `Shredder`：把清單項目拖進碎紙機 —（react-dom）
- `SlideCommit`：滑動確認把手 —（motion, hugeicons）
- `SlingButton`：彈弓拉放送出按鈕 —（motion, hugeicons）
- `SloshGauge`：液體晃動的量表/滑桿 —（無）
- `SpringCheck`：彈簧勾選框 —（motion, hugeicons）
- `SquishSwitch`：拉伸擠壓的開關 —（motion）
- `StatusMark`：20px 任務狀態符號（閒置→進行→勾/叉） —（motion）
- `SwipeRow`：滑開顯示動作的清單列 —（motion, hugeicons）
- `SwipeToast`：可滑動關閉、帶倒數導火線的 Toast —（motion, hugeicons）
- `TearTicket`：可手撕票根的票券 —（motion）
- `ThoughtLine`：AI 推理軌跡標頭（Thought for 4.2s） —（motion, hugeicons）
- `VoicePill`：麥克風膠囊等化器 —（hugeicons）
- `WakeSlider`：無拇指細條滑桿帶尾浪 —（motion）
- `WarmTooltip`：共享延遲的工具提示群 —（motion, react-dom）

### 4.5 Backgrounds（59）路徑 `/backgrounds/`（除標註外多為全畫布 WebGL）

- `AcidSquares`：方塊走廊深邃退去 —（ogl）
- `AeroShards`：GPU 風吹鋁箔碎片 —（vgpu, WebGPU）
- `Aurora`：流動極光漸層 —（ogl）
- `Balatro`：Balatro 遊戲同款旋渦 shader —（ogl）
- `Ballpit`：彩色球池物理模擬 —（gsap, three）
- `Beams`：交錯動態光帶 —（three, r3f, drei）
- `ColorBends`：流動色彩彎折 —（three）
- `CRTWarp`：CRT 弧面電漿掃描線 —（three）
- `DarkVeil`：低調深色動態背景 —（ogl）
- `Dither`：復古抖動雜訊 —（three, r3f, postprocessing）
- `DotField`：游標凸起/發光的點陣 —（無，Canvas）
- `DotGrid`：游標互動點陣 —（gsap）
- `EvilEye`：程序化邪眼（虹膜、裂瞳、火焰） —（ogl）
- `FaultyTerminal`：故障終端機掃描方塊 —（ogl）
- `Ferrofluid`：磁流體等高線，游標當磁鐵 —（ogl）
- `FloatingLines`：3D 浮動線條隨游標 —（three）
- `Galaxy`：視差真實星空，可排斥游標 —（ogl）
- `GhostFibers`：深藍遞迴纖維場 —（ogl）
- `GradientBlinds`：漸層百葉窗加聚光燈 —（ogl）
- `GradientWaves`：光線行進正弦波地平線 —（ogl）
- `Grainient`：顆粒感漸層旋渦 —（ogl）
- `GridDistortion`：網格隨游標扭曲 —（three）
- `GridMotion`：透視移動網格 —（gsap）
- `GridScan`：3D 房間掃描網格 —（three, postprocessing, face-api.js） 
- `Hyperspeed`：超空間飆車光線，按住加速 —（three, postprocessing；兩個檔案含 presets）
- `Iridescence`：虹彩波動 shader —（ogl）
- `LetterGlitch`：駭客任務字母雨 —（無，Canvas）
- `Lightfall`：彩色光線落入隧道 —（ogl）
- `Lightning`：程序化閃電分叉 —（無，WebGL 內建）
- `LightPillar`：垂直光柱 —（three）
- `LightRays`：體積光束 —（ogl）
- `LightTunnel`：光纖隧道脈衝 —（ogl）
- `LineWaves`：彩色扭曲線波 —（ogl）
- `LiquidChrome`：液態鍍鉻反射 —（ogl）
- `LiquidEther`：互動液態流動 shader —（three）
- `MicroSlats`：微型板條變成透視海面 —（ogl）
- `MoltenMetal`：熔融金屬電漿絲 —（ogl）
- `Orb`：漂浮能量球 —（ogl）
- `Particles`：可設定粒子系統 —（ogl）
- `PatternWaves`：半色調點/線/符號像絲綢起伏 —（ogl）
- `PixelBlast`：像素爆裂粒子，可加液態後處理 —（three, postprocessing）
- `PixelSnow`：像素雪花飄落 —（three）
- `Plasma`：有機電漿漸層 —（ogl）
- `PlasmaWave`：雙波干涉電漿 —（ogl）
- `Prism`：旋轉稜鏡 —（ogl）
- `PrismaticBurst`：光線爆發 —（ogl）
- `Radar`：雷達掃描環 —（ogl）
- `RippleGrid`：漣漪網格 —（ogl）
- `Scanner`：示波器式干涉帶 —（ogl）
- `ShapeGrid`：形狀格子（方/六角/圓/三角）動畫 —（無）
- `ShapeWaves`：WebGPU 形狀波浪，可挖文字 —（vgpu, WebGPU）
- `SideRays`：側面射出的光線 —（ogl）
- `Silk`：柔光絲綢波浪 —（three, r3f）
- `SlicedWaves`：等化器式發光條 —（ogl）
- `SoftAurora`：柔和極光（Perlin noise） —（ogl）
- `Threads`：織物般線條 —（ogl）
- `Topography`：發光等高線地形圖 —（ogl）
- `Waves`：分層線條波浪 —（無，Canvas）
- `WebThreads`：匯聚點發光正弦線 —（ogl）

## 5. 網頁開發精選 Top 12

| # | 元件 | 用途 | 適用場景 | 相依 | 行動裝置 |
|---|---|---|---|---|---|
| 1 | `SplitText` | 字/詞/行交錯進場 | Hero 標題、Section 標題 | gsap, @gsap/react | 佳 |
| 2 | `BlurText` | 模糊→清晰逐詞浮現 | 副標、段落、見證語 | motion | 佳 |
| 3 | `ShinyText` | 光澤掃過文字 | CTA、徽章、「NEW」標籤 | motion | 佳（CSS） |
| 4 | `CountUp` | 數字滾動 | 統計區（用戶數、下載數） | motion | 佳 |
| 5 | `TextType` | 打字機多句輪播 | Hero 副標、Terminal 風 | gsap | 佳 |
| 6 | `AnimatedContent` / `FadeContent` | 通用捲動進場包裝器 | 任何區塊 reveal | gsap | 佳 |
| 7 | `SpotlightCard` | 游標聚光燈卡片 | 功能卡、定價卡 | 無 | 佳（觸控無 hover） |
| 8 | `TiltedCard` | 3D 傾斜卡片 | 作品集、產品圖 | motion | 元件自帶「手機未最佳化」警示 |
| 9 | `Dock` | macOS Dock | 導覽列、工具列、作品集底欄 | motion | 中 |
| 10 | `Aurora` | 極光背景 | Hero / 全頁背景 | ogl | 中（WebGL） |
| 11 | `StarBorder` / `ElectricBorder` | 動態邊框 | 按鈕、重點卡片 | 無 | 佳 |
| 12 | `Magnet` | 磁吸 hover | CTA 按鈕、Icon | 無 | 觸控無效（純裝飾） |

備選：`GradientText`（漸層標題）、`RotatingText`（輪播關鍵字）、`DecryptedText`（科技感）、`LogoLoop`（客戶 logo 牆）、
`Stepper`（onboarding）、`MagicBento`（功能 Bento 格）、`Silk` / `LightRays` / `Threads`（背景）。

## 6. 遊戲開發精選 Top 10

| # | 元件 | 用途 | 遊戲場景 | 相依 | 備註 |
|---|---|---|---|---|---|
| 1 | `SplitText` | 標題字元交錯進場 | 遊戲標題畫面、「LEVEL 1」進場、BOSS 名 | gsap | `from/to` 可自訂 gsap TweenVars（例如縮放+旋轉） |
| 2 | `CountUp` / `Counter` | 數字滾動 | 分數結算、金幣增加、Combo 計數 | motion | `Counter` 是拉霸滾輪式，更有街機感 |
| 3 | `ClickSpark` | 點擊火花 | 點擊/攻擊回饋、按鈕 juice | 無（Canvas 2D） | 包住整個遊戲容器即可全域生效 |
| 4 | `SloshGauge` | 液體晃動量表 | 血條、魔力條、體力/氧氣 | 無 | `value` 0–100，`liquidColor` 換色，可 `interactive` |
| 5 | `GlitchText` / `DecryptedText` | 故障字 / 解密字 | 受傷畫面、駭客/科幻 UI、對話解鎖 | 無 / motion | GlitchText 純 CSS 動畫 |
| 6 | `PixelTransition` | 像素溶解切換 | 關卡轉場、卡片翻面、場景切換 | gsap | `gridSize` 控制像素粗細 |
| 7 | `TiltedCard` / `FlipCard` | 3D 卡片 | 卡牌遊戲手牌、角色卡、道具卡 | motion | FlipCard 支援拖曳翻面 |
| 8 | `Galaxy` / `Particles` / `Hyperspeed` | 太空/速度感背景 | 太空射擊、賽車、主選單 | ogl / ogl / three+postprocessing | Hyperspeed 按住加速可當 boost 回饋 |
| 9 | `Lightning` / `PixelBlast` / `LetterGlitch` | 氛圍背景 | 雷電魔法、像素風爆炸、駭客終端 | 無 / three / 無 | Lightning、LetterGlitch 零相依 |
| 10 | `ElectricBorder` / `StarBorder` | 能量邊框 | 選中道具框、稀有度邊框、技能冷卻 | 無 | ElectricBorder `chaos`/`speed` 調強度 |

備選：`Shuffle`（洗牌文字，適合抽獎/轉蛋）、`FallingText`（matter-js 物理掉字，Game Over 畫面）、`Balatro`（Balatro 同款旋渦背景）、
`DotGrid`/`CursorGrid`（網格隨指標反應，可當棋盤底）、`Dock`（技能欄/物品欄）、`Stepper`（教學流程）、`HoldButton`（長按確認）。

## 7. 精選元件 Props 重點（從 registry 原始碼抽出，含預設值）

### SplitText（gsap）
`text`*；`splitType` `'chars'|'words'|'lines'|'words, chars'`=chars；`delay`=50（ms，交錯間隔）；`duration`=1.25；`ease`='power3.out'；
`from`={opacity:0,y:40}、`to`={opacity:1,y:0}（gsap TweenVars，可自訂 scale/rotate）；`threshold`=0.1、`rootMargin`='-100px'（ScrollTrigger 進場）；
`tag`='p'；`textAlign`='center'；`onLetterAnimationComplete`。會等 `document.fonts.ready` 再量測。只動畫一次。

### BlurText（motion）
`text`；`animateBy` `'words'|'letters'`=words；`direction` `'top'|'bottom'`=top；`delay`=200（ms/段）；`stepDuration`=0.35；`threshold`=0.1；
`rootMargin`='0px'；`animationFrom`/`animationTo`（自訂關鍵影格）；`easing`；`onAnimationComplete`。

### ShinyText（motion）
`text`*；`speed`=2（秒/循環）；`color`='#b5b5b5'；`shineColor`='#ffffff'；`spread`=120；`direction` `'left'|'right'`；`yoyo`；`pauseOnHover`；`delay`；`disabled`。

### CountUp（motion）
`to`*；`from`=0；`direction` `'up'|'down'`；`duration`=2；`delay`=0；`separator`=''（傳 ',' 得千分位）；`startWhen`=true（可綁 inView/事件）；`onStart`/`onEnd`。

### Counter（motion）
`value`*；`fontSize`；`places`（如 `[100,10,1]`，含 `'.'` 可顯示小數）；`gap`、`padding`、`borderRadius`、`textColor`、`fontWeight`；`gradientFrom/To`（上下漸隱遮罩）。

### TextType（gsap）
`text` string | string[]*；`typingSpeed`=50；`deletingSpeed`=30；`pauseDuration`=2000；`loop`=true；`showCursor`=true；`cursorCharacter`='|'；
`textColors`[]；`variableSpeed` {min,max}；`startOnVisible`；`reverseMode`；`onSentenceComplete(sentence,index)`；`as`。

### AnimatedContent / FadeContent（gsap）
共同：`children`*、`duration`、`ease`、`delay`、`threshold`=0.1、`initialOpacity`=0、`disappearAfter`（秒後自動消失）、`onComplete`。
AnimatedContent 另有 `distance`=100、`direction` `'vertical'|'horizontal'`、`reverse`、`scale`=1、`animateOpacity`；FadeContent 另有 `blur`。

### ClickSpark（無相依）
`sparkColor`='#fff'；`sparkSize`=10；`sparkRadius`=15；`sparkCount`=8；`duration`=400（ms）；`easing`；`extraScale`=1；`children`（包住要有效果的區域）。

### SloshGauge（無相依）
`value`/`defaultValue`=60；`onChange`；`interactive`=false；`showValue`=true；`liquidColor`='#f5f5f5'；`glassColor`='#27272a'；`width`=88、`height`=180；
`ticks`=4；`viscosity`=0.15；`tilt`=0.45；`splash`=0.42；`unit`='%'；`ariaLabel`。

### GlitchText（無相依）
`children` string*；`speed`=0.5；`enableShadows`=true；`enableOnHover`=false（true 時只在 hover 故障）。

### DecryptedText（motion）
`text`*；`speed`=50；`maxIterations`=10；`sequential`；`revealDirection` `'start'|'end'|'center'`；`characters`；`animateOn` `'view'|'hover'|'inViewHover'|'click'`=hover；
`clickMode` `'once'|'toggle'`；`encryptedClassName`（亂碼期間樣式）。

### PixelTransition（gsap）
`firstContent`*、`secondContent`*；`gridSize`=7；`pixelColor`='currentColor'；`animationStepDuration`=0.3；`once`=false；`aspectRatio`='100%'。

### TiltedCard（motion）
`imageSrc`*；`captionText`；`containerHeight`='300px'、`containerWidth`='100%'、`imageHeight`/`imageWidth`='300px'；`scaleOnHover`=1.1；`rotateAmplitude`=14；
`showMobileWarning`=true（**預設會在手機顯示英文警告，遊戲用請關掉**）；`showTooltip`；`overlayContent` + `displayOverlayContent`（疊 HUD/文字）。

### SpotlightCard（無相依）
`children`；`className`；`spotlightColor`='rgba(255, 255, 255, 0.25)'（型別限制必須是 rgba 字串）。

### Magnet（無相依）
`children`*；`padding`=100（感應範圍 px）；`magnetStrength`=2（越大位移越小）；`activeTransition`/`inactiveTransition`；`disabled`。

### Dock（motion）
`items`* `{icon, label, onClick, className?}[]`；`magnification`=70；`distance`=200；`panelHeight`=68；`dockHeight`=256；`baseItemSize`=50；`spring`。

### StarBorder / ElectricBorder（無相依）
StarBorder：`as`、`color`='white'、`speed`='6s'、`thickness`=1、`backgroundColor`、`textColor`、`borderColor`。
ElectricBorder：`color`='#5227FF'、`speed`=1、`chaos`=0.12、`borderRadius`=24。

### Aurora（ogl）
`colorStops`=['#5227FF','#7cff67','#5227FF']；`amplitude`=1.0；`blend`=0.5；`speed`=1.0；`lightMode`；`time`。

### Particles（ogl）
`particleCount`=200；`particleSpread`=10；`speed`=0.1；`particleColors`[]；`moveParticlesOnHover`；`particleHoverFactor`=1；`alphaParticles`；
`particleBaseSize`=100；`sizeRandomness`=1；`cameraDistance`=20；`disableRotation`；`pixelRatio`=1（**手機效能關鍵，保持 1**）。

### Galaxy（ogl）
`density`=1；`starSpeed`=0.5；`speed`=1；`hueShift`=140；`saturation`=0；`glowIntensity`=0.3；`twinkleIntensity`=0.3；`rotationSpeed`=0.1；
`mouseInteraction`=true、`mouseRepulsion`=true、`repulsionStrength`=2；`transparent`=true；`disableAnimation`；`lightMode`。

### Hyperspeed（three + postprocessing）
`effectOptions` Partial<HyperspeedOptions>（`distortion`、`length`、`roadWidth`、`lanesPerRoad`、`fov`/`fovSpeedUp`、`speedUp`、`colors{roadColor,…,leftCars[],rightCars[]}`、
`onSpeedUp`/`onSlowDown` 事件）；`lightMode`。附 `HyperSpeedPresets.ts` 多組預設。

### Lightning（無相依）
`hue`=230；`xOffset`=0；`speed`=1；`intensity`=1；`size`=1。

### PixelBlast（three + postprocessing）
`variant`；`pixelSize`=3；`color`；`patternScale`=2、`patternDensity`=1；`liquid`、`liquidStrength`、`liquidRadius`；`enableRipples`=true（點擊漣漪）；
`speed`=0.5；`transparent`=true；`edgeFade`=0.5；`autoPauseOffscreen`=true（離開畫面自動暫停，省電）。

### Shuffle（gsap）
`text`*；`shuffleDirection`；`duration`=0.35；`shuffleTimes`=1；`stagger`=0.03；`scrambleCharset`；`colorFrom`/`colorTo`；`loop`、`loopDelay`；`triggerOnHover`=true；
`respectReducedMotion`=true；`onShuffleComplete`。

## 8. 效能注意事項

1. **WebGL 背景（ogl / three，共 76 個）在手機上是最大風險。** 每個都是全畫布持續 requestAnimationFrame 的 fragment shader；中階 Android 容易掉幀、發熱、吃電。
   - 一頁只放 **一個** WebGL 背景；遊戲中若已有 Canvas/WebGL 遊戲畫布，**不要**再疊 WebGL 背景（兩個 GL context 爭 GPU）。
   - 有 `pixelRatio` / `dpr` prop 的（Particles）保持 1；沒有的可自行在原始碼把 `renderer.dpr` 或 `setPixelRatio` 限制為 `Math.min(devicePixelRatio, 1.5)`。
   - 用 `matchMedia('(pointer: coarse)')` 或寬度判斷，手機改成靜態漸層/CSS 背景或較輕的 Canvas 2D 元件（`Waves`、`DotField`、`LetterGlitch`、`ShapeGrid`、`Lightning`）。
   - `PixelBlast` 內建 `autoPauseOffscreen`；其他元件不在畫面時不會自動停，可用 IntersectionObserver 控制掛載/卸載。
   - WebGPU 元件（`ShapeWaves`、`AeroShards`，相依 vgpu）目前 Safari/iOS 支援有限，需 fallback。
   - 大型相依：three ≈ 600KB+（未 tree-shake）、postprocessing、r3f/drei 會明顯增加 bundle；ogl 相對輕（≈ 100KB 內）。
2. **游標類動畫（Cursor / Trail / Magnet / Hover）在觸控裝置沒有意義**，純裝飾即可，必要時在手機不渲染。`TiltedCard` 預設會顯示「not optimized for mobile」提示，記得 `showMobileWarning={false}`。
3. **文字動畫**：SplitText 會把每個字拆成 span，長段落（>300 字）會產生大量 DOM；只用在標題。多數 gsap 元件註冊 ScrollTrigger，SPA 路由切換時記得卸載（元件內已 cleanup）。
4. **Reduced motion**：只有少數元件（如 Shuffle `respectReducedMotion`）內建支援；全站建議自行用 `prefers-reduced-motion` 包一層。
5. **Lanyard** 需要 `card.glb` 與 `lanyard.png` 靜態資源，且 registry 的 dependencies 欄位是空的（實際需要 three / r3f / drei / @react-three/rapier / meshline），AI 工具自動安裝時會漏裝。
6. **GridScan** 相依 face-api.js（臉部偵測模型，很大），非必要勿用。
7. 遊戲迴圈建議：React Bits 元件適合 **UI 層 / 標題 / 結算 / 選單**，不要放進每幀更新的遊戲實體（例如用 CountUp 顯示每幀變動的分數會不斷重新觸發動畫；改成在「結算時」才渲染，或用 `startWhen`）。

## 9. 與 MagicUI 的重疊與互補（Arthur 已有 MagicUI）

| MagicUI 既有 | React Bits 對應 | 判斷 |
|---|---|---|
| BlurFade | `FadeContent`（blur 選項）/ `AnimatedContent` / `BlurText` | 重疊。BlurFade 包任何元素；BlurText 專做文字逐詞模糊，效果更細。 |
| TextAnimate | `SplitText`、`BlurText`、`Shuffle`、`DecryptedText`、`TextType`、`RotatingText`、`ScrollReveal` | 部分重疊。TextAnimate 走 motion variants；React Bits 文字動畫數量多 33 種、風格更「炫」（GSAP SplitText 外掛可拆行）。 |
| NumberTicker | `CountUp`（同類）、`Counter`（拉霸滾輪，MagicUI 沒有） | CountUp 幾乎等同；Counter 是新花樣，遊戲分數更適合。 |
| Particles | `Particles`（ogl 3D）、`Galaxy`、`DotGrid`、`PixelBlast` | MagicUI Particles 是 Canvas 2D、輕量、手機友善；React Bits 是 WebGL 3D 粒子，更華麗但更重。手機首選 MagicUI。 |
| Meteors | `Lightfall`、`LightRays`、`Hyperspeed`、`PixelSnow` | 互補。Meteors 是 CSS 流星；React Bits 這些是 WebGL 全畫布。 |
| BorderBeam | `StarBorder`、`ElectricBorder`、`BorderGlow` | 重疊。BorderBeam 是沿邊的光點；ElectricBorder 的電流感是 MagicUI 沒有的。 |
| MagicCard | `SpotlightCard`（幾乎相同：游標聚光）、`TiltedCard`（3D）、`GlareHover`、`ProfileCard` | SpotlightCard 與 MagicCard 高度重疊，擇一；TiltedCard / GlareHover 是加分項。 |
| ShimmerButton | `ShinyText`（文字光澤）、`StarBorder`（可當按鈕）、`SpecularButton`（WebGL 玻璃）、`HoldButton` / `SlingButton` / `FuseButton`（Micro） | 互補。ShimmerButton 是整顆按鈕；ShinyText 只掃文字，可套在任何按鈕內。 |
| （MagicUI 無） | 59 個 WebGL 背景、游標特效（ClickSpark, Ribbons, SplashCursor…）、SloshGauge、PixelTransition、Dock、34 個 Micro | **React Bits 真正的增量**：背景與 game-feel 類。 |

**建議分工：** 基礎互動與手機優先的動效用 MagicUI（更輕、純 MIT、shadcn 原生）；需要「哇」的 Hero 背景、標題進場、點擊火花、血條量表、像素轉場用 React Bits。
兩者都走 shadcn registry，可在同一專案共存；注意 React Bits 使用 `motion` 套件（Framer Motion v12 新名），MagicUI 也用 `motion`，不會重複安裝兩套。

## 10. 如何即時取得最新內容

| 資源 | URL（皆已驗證 200） | 用途 |
|---|---|---|
| llms.txt | `https://reactbits.dev/llms.txt`（www 亦可） | 全元件一句話說明 + CLI 名稱 + 分類；每次 build 自動產生，**最權威的清單** |
| Sitemap | `https://reactbits.dev/sitemap.xml` | 213 個元件頁 URL + lastmod（本次最新 2026-10-03），diff 可知新增元件 |
| 全庫 registry 索引 | `https://reactbits.dev/r/registry.json` | 852 item：name / description / **dependencies** / files path，不含原始碼 |
| 單一元件 registry | `https://reactbits.dev/r/<Component>-<JS\|TS>-<CSS\|TW>.json` | 含 `files[].content` 完整原始碼，可直接 curl 取用 |
| jsrepo manifest | `https://reactbits.dev/r/jsrepo-manifest.json` | jsrepo 用清單 |
| RSS | `https://reactbits.dev/rss.xml`、`https://reactbits.dev/feed.xml` | 更新訂閱 |
| Changelog | `https://reactbits.dev/get-started/changelog` | 版本紀錄（SPA 頁） |
| MCP | `https://reactbits.dev/get-started/mcp` | 官方 MCP server 設定說明，讓 Claude Code / Cursor 直接搜尋元件 |
| 原始碼 | `https://raw.githubusercontent.com/DavidHDev/react-bits/main/<path>`（如 `LICENSE.md`、`package.json`、`CONTRIBUTING.md`） | github.com 網頁被擋時用 raw |
| Pro 目錄（付費，勿誤裝） | `https://reactbits.dev/pro-manifest.json` | Pro 清單；免費 registry 不含 Pro 元件 |

快速檢查新元件的腳本思路：

```bash
curl -sS -L -A "Mozilla/5.0" https://reactbits.dev/sitemap.xml \
  | grep -oE "reactbits.dev/(text-animations|animations|components|micro|backgrounds)/[a-z0-9-]+" | sort > now.txt
diff raw/reactbits.sitemap.urls.txt now.txt   # 新增的即為新元件
# 取某元件原始碼
curl -sS -L -A "Mozilla/5.0" https://reactbits.dev/r/ClickSpark-TS-TW.json | python3 -c "import sys,json;print(json.load(sys.stdin)['files'][0]['content'])"
```

## 11. 給 AI coding tool 的提示詞片段

```
使用 React Bits（https://reactbits.dev）的 <Component> 元件，TypeScript + Tailwind 變體。
安裝：npx shadcn@latest add https://reactbits.dev/r/<Component>-TS-TW
（或讀取該 JSON 的 files[0].content 直接建立 src/components/reactbits/<Component>.tsx）
安裝 registry JSON 中 dependencies 列出的套件。手機裝置請關閉 WebGL 背景並改用 CSS 漸層；
TiltedCard 請設 showMobileWarning={false}。保留檔頭的 MIT + Commons Clause 授權註解。
```
