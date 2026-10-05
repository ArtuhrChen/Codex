# Aceternity UI snippets（免費元件原始碼備份）

來源：`https://ui.aceternity.com/registry/<name>.json` 的 `files[0].content`，下載日期 2026-10-05。
授權：Aceternity Licence（免費元件可無限用於個人/商業成品含遊戲；不得轉售或重新打包為元件庫/模板）。詳見 https://ui.aceternity.com/licence

每個檔案都假設專案已有 Tailwind CSS 與 `@/lib/utils` 的 `cn()`（`npm i motion clsx tailwind-merge`）。

| 檔案 | 元件 | npm 相依 | 文件頁 | 大小 |
|---|---|---|---|---|
| `background-beams.tsx` | Background Beams | motion | https://ui.aceternity.com/components/background-beams | 9.8KB |
| `spotlight.tsx` | Spotlight | 無 | https://ui.aceternity.com/components/spotlight | 1.4KB |
| `text-generate-effect.tsx` | Text Generate Effect | motion | https://ui.aceternity.com/components/text-generate-effect | 1.3KB |
| `bento-grid.tsx` | Bento Grid | @tabler/icons-react | https://ui.aceternity.com/components/bento-grid | 1.3KB |
| `3d-card.tsx` | 3d Card | 無 | https://ui.aceternity.com/components/3d-card-effect | 3.9KB |
| `hover-border-gradient.tsx` | Hover Border Gradient | motion | https://ui.aceternity.com/components/hover-border-gradient | 3.2KB |
| `macbook-scroll.tsx` | Macbook Scroll | @tabler/icons-react, motion | https://ui.aceternity.com/components/macbook-scroll | 19.1KB |
| `container-scroll-animation.tsx` | Container Scroll Animation | motion | https://ui.aceternity.com/components/container-scroll-animation | 2.5KB |
| `aurora-background.tsx` | Aurora Background | 無 | https://ui.aceternity.com/components/aurora-background | 2.9KB |
| `lamp.tsx` | Lamp | motion | https://ui.aceternity.com/components/lamp-effect | 4.1KB |
| `meteors.tsx` | Meteors | 無 | https://ui.aceternity.com/components/meteors | 1.5KB |
| `stars-background.tsx` | Stars Background | 無 | https://ui.aceternity.com/components/shooting-stars-and-stars-background | 3.4KB |
| `shooting-stars.tsx` | Shooting Stars | 無 | https://ui.aceternity.com/components/shooting-stars-and-stars-background | 3.7KB |
| `sparkles.tsx` | Sparkles | @tsparticles/react, @tsparticles/engine, @tsparticles/slim, motion | https://ui.aceternity.com/components/sparkles | 11.4KB |
| `glowing-effect.tsx` | Glowing Effect | lucide-react | https://ui.aceternity.com/components/glowing-effect | 6.5KB |

## 需要額外 CSS keyframes 的元件（Tailwind v4 寫法，貼到 globals.css）

```css
@import "tailwindcss";
@theme inline {
  /* aurora-background */
  --animate-aurora: aurora 60s linear infinite;
  @keyframes aurora {
    from { background-position: 50% 50%, 50% 50%; }
    to   { background-position: 350% 50%, 350% 50%; }
  }
  /* meteors */
  --animate-meteor-effect: meteor 5s linear infinite;
  @keyframes meteor {
    0%   { transform: rotate(215deg) translateX(0); opacity: 1; }
    70%  { opacity: 1; }
    100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
  }
}
```

## 使用提示
- `stars-background.tsx` + `shooting-stars.tsx` 是同一個文件頁的兩個元件，疊在一起用（遊戲太空背景首選，零相依）。
- `3d-card.tsx` 匯出 `CardContainer / CardBody / CardItem` 三件組；觸控裝置無 hover，會退化成靜態卡片。
- `macbook-scroll.tsx` 與 `container-scroll-animation.tsx` 內建 `isMobile` 判斷（<768px 自動縮小），但仍是整頁 scroll-driven 動畫，手機上請評估。
- `sparkles.tsx` 依賴 tsparticles 三個套件，是這批最重的；若已裝 MagicUI `Particles` 建議直接沿用。
- 想要更多元件：`npx shadcn@latest add https://ui.aceternity.com/registry/<name>.json`，名稱見 `refs/aceternity.md` 的目錄。
