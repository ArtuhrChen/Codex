# snippets/magicui — Magic UI 尚未移植元件原始碼（Top 8）

來源：shadcn registry `https://magicui.design/r/<slug>.json` 的 `files[0].content`，2026-10-05 下載，未修改。
授權：MIT（Copyright (c) Magic UI）— https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md
每個檔案開頭有 4 行註解（來源 URL、相依套件、授權）。

| 檔案 | 匯出 | npm 相依 | shadcn 相依 | 內部匯入 | 備註 |
|---|---|---|---|---|---|
| `confetti.tsx` | `Confetti`, `ConfettiButton`, `ConfettiRef` | `canvas-confetti`, `@types/canvas-confetti` | `button` | `@/components/ui/button` | 遊戲過關/成就首選 |
| `animated-list.tsx` | `AnimatedList`, `AnimatedListItem` | `motion` | — | `@/lib/utils` | 通知流 / 戰鬥日誌 |
| `animated-beam.tsx` | `AnimatedBeam` | `motion` | — | `@/lib/utils` | 需 containerRef + fromRef/toRef |
| `terminal.tsx` | `Terminal`, `AnimatedSpan`, `TypingAnimation` | `motion`（registry 未列，原始碼有用） | — | `@/lib/utils` | 內含同名 `TypingAnimation`，與 Arthur 既有元件衝突時請改名 |
| `bento-grid.tsx` | `BentoGrid`, `BentoCard` | `@radix-ui/react-icons` | `button` | `@/components/ui/button`, `@/lib/utils` | 版面元件 |
| `dock.tsx` | `Dock`, `DockIcon`, `dockVariants` | `motion`, `class-variance-authority` | — | `@/lib/utils` | 道具列 / 快捷欄 |
| `globe.tsx` | `Globe`, `GLOBE_CONFIG` | `cobe@^0.6.4`, `motion` | — | `@/lib/utils` | WebGL，手機請降 `devicePixelRatio` |
| `icon-cloud.tsx` | `IconCloud` | `lucide-react` | `button` | `@/components/ui/button`, `react-dom/server` | Canvas 3D 球形雲 |

## 移植到 Arthur 專案的步驟
1. `npm i motion canvas-confetti @types/canvas-confetti cobe class-variance-authority @radix-ui/react-icons lucide-react`
2. 確認有 `@/lib/utils` 的 `cn()`，以及 shadcn `button`（`npx shadcn@latest add button`）。
3. 複製 `.tsx` 到 Arthur 的目錄結構，調整匯入路徑（例如 `components/effects/confetti.tsx`）。
4. 更新 `magicui-design-assistant` skill 的元件表與 `design-cheatsheet.md`。

## 其他 44 個尚未移植元件
直接用 `curl -sSL https://magicui.design/r/<slug>.json | jq -r '.files[0].content'`，slug 清單見 `refs/magicui-delta.md` §3。
