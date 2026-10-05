# MotionSites 免費 prompt 來源（只放連結，不放全文）

MotionSites 的使用條款禁止再散佈 prompt 文字，本 repo 公開，所以這裡只記錄「去哪裡拿」。
以下 4 個 Academy 課程頁**不用登入**就 server-render 了完整 prompt（頁面上的「Show full prompt」區塊），2026-10-05 實測全部 HTTP 200。

| # | 設計 | 類型 | 課程頁 |
|---|---|---|---|
| 1 | Aether Lane（奢華房產） | 固定 Navbar + 視差 Hero | https://motionsites.ai/lesson/build-animated-website-with-ai |
| 2 | DE</HELPERS | sticky 背景影片 Hero + liquid glass | https://motionsites.ai/lesson/build-animated-website-with-motionsites |
| 3 | NovaAI | 捲動刷影片時間軸的兩段式落地頁 | https://motionsites.ai/lesson/build-scroll-animated-website-with-ai |
| 4 | 3D Character Studio（retrofuturist） | 滑鼠位移刷影片 + 打字機 Hero | https://motionsites.ai/lesson/cursor-tracking-website-with-motionsites |

抓法（給 agent）：
```bash
curl -sS -L -A "Mozilla/5.0" "<課程頁 URL>" | grep -o '<span class="sr-only">[^<]*' | sed 's/<span class="sr-only">//' | head -c 20000
```
拆解後的結構與可直接套用的模板在 `../../references/prompt-templates.md`。
