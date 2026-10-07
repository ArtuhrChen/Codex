# 交接：雲端新廣播官網改版 → 在本機 Claude 桌面版上線

交接日期：2026-10-07。來源：Claude 雲端對話（session_01RzE6KFgbjdngfwhNRhiw5U）。
讀這份的你（本機 Claude）：先讀完，再讀 `README.md`，再動手。

## 0. 一句話任務

把 `newradio-site/` 這個資料夾用 FTPS 上到 `/public_html/`，讓 https://www.newradio.com.tw/ 換成新版，
然後實際開網站驗證。上傳腳本已經寫好：`tools/deploy_newradio.py`。

## 1. 東西在哪

- GitHub：https://github.com/ArtuhrChen/Codex ，分支 `claude/video-websites-connection-test-1gz8hc`（尚未併入 main）。
- 官網成品：`newradio-site/`（純 HTML/CSS/JS + PHP 後台，無 build）。
- FTP 連線規則：使用者的交接檔「20261007_Codex_請Claude先讀_官網FTP交接.txt」（在使用者 Dropbox，
  本機路徑 `D:\Dropbox\傳送門\冠鳴暫存\XTX\20261007_Codex_雲端新廣播官網FTP交接\`）。**那份是最高規則，先讀它。**
- 密碼：只在本機 FileZilla `%APPDATA%\FileZilla\sitemanager.xml`（Host=newradio.com.tw, User=newradio）。
  腳本會在記憶體裡讀，不要列印、不要寫檔、不要貼進對話。
- 後台密碼：使用者指定 `NEW99.5RADIO`（電台統一給有管理權的員工）。腳本執行時會問，用 getpass 輸入。

## 2. 上線步驟（照順序）

```
cd newradio-site
py -3 tools\deploy_newradio.py          # 演練：連線、比對、列清單，不上傳
py -3 tools\deploy_newradio.py --go     # 正式上傳（會問後台密碼）
```

腳本已內建：明確式 FTPS + 憑證驗證 + PASV；只碰 `/public_html/` 內指定路徑；不刪任何遠端檔；
覆蓋前備份到本機 `backup_newradio_日期時間/`；原版四檔（index.html、css/newradio.css、js/newradio.js、js/ui.js）
核對 2026-10-06 基線雜湊，不同就停（--force 才覆蓋）；先傳資產最後傳 index.html；傳完 HTTPS 實測。

演練若停在「線上已跟基線不一樣」：代表別台電腦改過線上檔。把備份下來的線上版和 repo 版 diff 後合併，不要直接 --force。

## 3. 上線後一定要驗（FTP 成功 ≠ 網站成功）

1. https://www.newradio.com.tw/ 手機開，按紅色播放鍵要有聲音；捲下去要有迷你播放列。
2. 「現在播出」要顯示正確節目與主持人（依台北時間，資料在 `data/schedule.json`）。
3. Podcast 區要有節目卡與集數，點「播放」要能站內播。
4. https://www.newradio.com.tw/news/admin/ 要出現登入畫面（不是「設定密碼」畫面）。登入後寫一則測試消息並發布，
   首頁 `#news` 要出現；不行通常是 `news/data/`、`news/uploads/` 沒寫入權限，用 cPanel 檔案管理員設 755/775。
5. 天氣兩格要有溫度。
6. 原本的 `/Podcast/`、`/ForApp/`、`stream.php`、`game-showcase/`、`aicc-entry/` 都不能受影響，各開一次。

## 4. 這次沒做完、使用者已經提出的

- **節目表後台**：使用者要求節目表也能在 `news/admin/` 後台編輯，讓「現在播出」永遠正確。
  雲端對話開始寫了一半被中斷，**程式沒有寫入**，從零開始做。建議做法：
  `news/data/schedule.json` 由後台維護（時段：start/end/title/hosts/summary/rerun，週一至週六 + 週日兩組），
  `news/schedule.php` 回傳後台版本（沒有就退回 `data/schedule.json`），`js/site.js` 先讀 `news/schedule.php`；
  後台提供「從官方節目表頁面匯入」按鈕（解析邏輯同 `tools/build-data.py`），儲存時依開始時間排序並警告重疊／空檔。
- **視覺換皮**：使用者覺得配色與原版沒差。目前刻意沿用原版 token（紙本色、薄荷綠、蜜桃橘、紅只給播放鍵）。
  如果要換，先出 2–3 個方向的示意圖讓使用者選，不要直接改。
- **多帳號後台**：目前單一密碼。使用者未來要讓官網控制更多事，可考慮每人一組帳密與操作紀錄。
- Apple Podcasts 封面要 1400px 以上，`assets/covers/` 目前是 1024，需要時放大處理。

## 5. 使用者的工作習慣（務必遵守）

- 繁體中文台灣口語回覆。先自我檢核再交付。有選項就直接選最好的並說為何不選其他。
- 已經能動的東西不要重構；只動引起問題的那個變數。
- 付費 API 先問。給連結前先確認能開。說「做不到」必附原因與替代方案。
- 使用者不熟 Git/GitHub，用白話講，不要丟術語；repo、branch、push 都要解釋或避免。
- 使用者是廣播電台負責人，聽眾偏長者：UI 要大字、大按鈕、按鈕上有字、流程短。
- 主持人不露臉是行規，目前用「聲紋卡」（名字生成的波形）代替照片。
- 後台密碼統一 `NEW99.5RADIO`，不要自作主張改成別的機制。

## 6. 檔案地圖（簡版）

```
newradio-site/
├── index.html / listen.html / manifest.webmanifest / podcast-latest.json
├── css/  newradio.css(原版) newradio-kit.css site.css senior.css(長輩版，最後載入)
├── js/   newradio.js(原版，直播 failover，一行沒改) ui.js(原版) newradio-kit.js site.js
├── data/ schedule.json podcast.json episodes/*.json notices.json
├── assets/ logo、icon、shows/(640 封面)、covers/(1024 主檔；raw/ 與 fonts/ 不上傳)
├── news/  api.php schedule(未做) lib.php news.css emoji/(20 個專屬表情) admin/(後台) data/ uploads/
└── tools/ deploy_newradio.py build-data.py compose-covers.py make-password.php
```
