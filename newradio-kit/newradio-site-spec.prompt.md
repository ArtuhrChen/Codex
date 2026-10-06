# 雲端新廣播官網 — 給 AI 的站點規格書（MotionSites 手法）

> 用途：之後要 AI（Claude Code / Lovable / Bolt / Cursor）改版或新增頁面時，把這份整段貼上去，
> 它就不會把官網做成「藍色 SaaS 樣板」。寫法沿用 MotionSites 的十區塊規格書結構；內容全是本站既有事實
> （從 newradio.css / newradio.js 抽出），不是別人的 prompt。
> 使用時把 ⟨⟩ 改成當次任務。

```text
You are extending the official website of 雲端新廣播 New Radio FM99.5 (https://www.newradio.com.tw), a licensed commercial FM radio station in Kaohsiung, Taiwan. Task: ⟨e.g. add a 節目表 page / redesign the Podcast highlight block⟩. Build ONLY that; do not restructure other sections. Stack: static HTML + vanilla CSS + vanilla JS, no framework, no build step, no UI kits (the live site runs on Apache and must keep working with JS disabled). Match the existing design system exactly — do not invent new colors, fonts, radii, shadows or motion curves.

## SETUP (existing — reuse, do not redefine)
- Font: "Noto Sans TC" 400/500/600/700/800 via Google Fonts (preconnect already present). Fallback "PingFang TC", "Microsoft JhengHei", system-ui.
- Body: 17px / line-height 1.7, color var(--ink), antialiased. html { scroll-behavior: smooth; scroll-padding-top: 104px }.
- Page background: paper var(--paper) with two soft radial tints (peach top-right, mint top-left). Never a flat white page, never a dark page.
- Language: zh-Hant-TW, Traditional Chinese copy, full-width punctuation 「・」 for slogans.

## TOKENS (from newradio.css — use these variables, never raw hex)
| Token | Value | Use |
| --paper | #faf6ef | page background |
| --surface | #ffffff | cards, player |
| --ink / --ink-soft / --muted | #1f2b33 / #44535c / #64717a | text hierarchy (muted passes AA on paper) |
| --mint / --mint-dark / --mint-tint | #39bdb7 / #12807c / rgba(57,189,183,.10) | brand accent, links hover, slogan |
| --peach / --peach-tint | #f8ae78 / rgba(248,174,120,.16) | warm accent, card variant |
| --red | #e8434a | play button, ON AIR only — never for decoration |
| --line / --line-strong | rgba(31,43,51,.10 / .16) | 1px borders |
| --shadow-sm / -md / -lg | layered soft shadows | cards / player / floating UI |
| --ease-spring | cubic-bezier(.22,1,.36,1) | every transition |
| --radius-lg / --radius-md | 24px / 16px | cards / inner items |

## MATERIAL (reuse consistently)
- Paper card: border 1px var(--line), radius var(--radius-lg), background var(--surface), shadow var(--shadow-sm); hover lifts to var(--shadow-md) with transform over .5s var(--ease-spring). Variants .mint / .peach use the tint as background.
- Glass panel (editorial-panel, sticky header): rgba(255,255,255,.55–.78) + backdrop-filter blur(16–20px) saturate(160–180%); must have a solid fallback under prefers-reduced-transparency.
- Kicker label: 12–13px, letter-spacing .06–.1em, uppercase for Latin ("LOCAL WEATHER", "Latest Podcasts"), weight 600–700, color var(--muted) or var(--mint-dark).
- Pill button / nav link: radius 999px, hover background rgba(57,189,183,.12) + color var(--mint-dark), :active scale(.95).

## PAGE STRUCTURE (existing, keep)
.site-header (sticky, glass, logo left / pill nav right)
main#top
  .hero.section-shell  — grid 1fr 400px: copy + .radio-player left, .editorial-panel (glass) right
  .entry-strip         — 4 quick links
  .feature-grid#schedule — paper cards (Podcast latest, Podcast, Facebook, 節目表)
  .about-section#about — two-column: statement + <dl> facts
.site-footer
Width: .section-shell = min(1120px, 100% - 48px). Breakpoints: 980px (stack to 1 column), 640px (2-col grids, static header, 16px gutters).

## COMPONENT SPECS
- Radio player (.radio-player): grid 76px 1fr auto; 72px round red gradient play button (linear-gradient(160deg,#f0555b,var(--red) 55%,#d63038)) with layered red shadow; title "FM99.5 現場直播" + live status text (aria-live); 16 equaliser bars (6px wide, radius 3px, mint/peach/red mix) that only animate while .is-playing; "直播中" pill with pulsing dot. Keep the <audio data-audio preload="none"> + the native fallback player + the backup links — the failover logic in newradio.js depends on them.
- Headings: h1 clamp(46px,6vw,82px) weight 800 letter-spacing -.03em line-height 1.04; slogan clamp(22px,2.6vw,33px) weight 700 color var(--mint-dark); h2 in cards ~26px weight 700 letter-spacing -.02em.
- Lists (story-list / podcast-latest): two-column grid with a 2-digit index ("01"), title <strong>, meta <small>; hover translateX(4px) or translateY(-3px), :active opacity .6 / scale(.98) with .1s duration.

## MOTION (exact values — calm editorial rhythm, never showy)
- Entrance: opacity 0→1, translateY 22px→0, .7s var(--ease-spring), stagger (index % 4) × 60ms; applied only to elements below the fold via IntersectionObserver (ui.js); first-screen content is never hidden; a 4s fallback forces visibility.
- Hover: .35–.5s var(--ease-spring) on transform / box-shadow only. Press feedback on :active (.1s), not on click.
- Allowed signature motion: equaliser bars (scaleY .55↔1, 1.35s) only while playing; ON AIR dot pulse 2.2s.
- Optional kit (newradio-kit.js): real Web Audio spectrum on the 16 bars, floating mini player after scrolling past #listen, per-character headline entrance (60ms stagger, blur 4px→0), programme marquee 45s linear.
- Forbidden: parallax video heroes, particles, 3D tilt, neon glows, auto-playing audio, more than one large animated element per viewport.

## RESPONSIVE & A11Y (non-negotiable)
- Works with JS disabled (content visible, native <audio controls> fallback).
- prefers-reduced-motion: all entrances/marquee/spectrum off, states still shown. prefers-reduced-transparency: solid backgrounds. prefers-contrast: more → stronger borders.
- Skip link to #listen; every interactive element has a visible :focus-visible ring; aria-live for player status; images have width/height.
- Touch targets ≥ 44px; env(safe-area-inset-bottom) for floating UI; test at 375px, 768px, 1280px.

## DEPENDENCIES
None. Google Fonts only. No npm, no framework, no icon font (inline SVG only).

## DO NOT
- Do not change the palette, font, logo treatment, copy tone, or the red-only-for-play rule.
- Do not touch newradio.js playback/failover logic or the <audio> markup.
- Do not add dark mode, hero videos, gradients other than the two paper tints, or any component that needs a build step.
- Do not use English UI copy except established kickers (Live, Podcast, Latest Podcasts, LOCAL WEATHER).

## ACCEPTANCE
Page renders identically in tone to https://www.newradio.com.tw: paper background, white rounded cards, mint/peach accents, red only on the play button and ON AIR. New section follows the grid, breakpoints and motion values above, passes reduced-motion and keyboard navigation, and the live player still plays and fails over. Generate the complete first version before asking questions.
```
