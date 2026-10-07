# newradio-site — 雲端新廣播官網 2026-10 改版

一個資料夾就是整個官網。純 HTML / CSS / 原生 JS，Apache 直接放就能跑，沒有 build、沒有 npm。

## 三個主軸怎麼落地

| 主軸 | 在哪裡 | 說明 |
|---|---|---|
| NCC 公開資訊 | `#notices` 區塊，資料在 `data/notices.json` | 電台基本資料 + 公告列表。**執照字號與有效期間兩欄要請電台填寫**（檔案裡標「請填寫」的地方）。新增公告：在 `items` 最前面加一筆 `{date, type, title, body}`。 |
| 線上收聽暢通 | `js/newradio.js` **一行未改** | 直播 → 備援 `stream.php` 的 failover 邏輯原封不動。新增：真實頻譜、捲動後的迷你播放列、鎖定畫面顯示「現在播出」節目名。 |
| Podcast Hub | `#podcast` 區塊，資料在 `data/podcast.json` + `data/episodes/*.json` | 8 個正式節目 + 16 個自動歸類系列（共 1,691 集）全部在首頁，可站內直接播放、記住聽到哪、聽完自動接下一集。Podcast 子站可以保留，也可以之後把 `/Podcast/` 導回首頁 `#podcast`。 |

| 電台消息報恁知 | `#news` 區塊；後台在 `news/admin/` | 員工用密碼登入後台發消息：有所見即所得編輯器、圖片上傳（自動縮到 1600px）、20 個雲端新廣播專屬表情（雲雲 × 音符各 10 種）＋常用表情、草稿／發布／置頂、**首頁顯示幾則由後台設定**（1–10）。純 PHP + JSON 檔，不用資料庫。第一次打開 `news/admin/` 會要求設定密碼。 |

另外新增：**現在播出**（讀 `data/schedule.json` 依台北時間判斷，含進度與下一檔）、**今日節目帶**、**主持人聲紋卡**（不露臉：波形由名字生成，正在播出的會動）、PWA（可加到手機主畫面）。

### 「電台消息報恁知」上線注意
- 主機要能跑 PHP（備援音源 `stream.php` 就是 PHP，所以可以）。
- `news/data/` 與 `news/uploads/` 兩個資料夾要讓 PHP 可以寫入（權限 755 或 775，擁有者是網站程式的帳號）。
- 兩個資料夾都放了 `.htaccess`：`data/` 外部不能讀、`uploads/` 不能執行程式。若主機不是 Apache，請用等效設定。
- 後台網址：`https://www.newradio.com.tw/news/admin/`。第一次打開設定密碼，之後把密碼交給要發消息的同事。
- 長輩友善：後台按鈕都 44px 以上、字 17px，流程只有「寫一則新消息 → 寫 → 勾發布 → 儲存」。

## 上線步驟（兩種擇一）

**A. 檔案總管 / FTP 手動上傳**
1. 把這個資料夾裡的所有東西（`index.html`、`listen.html`、`manifest.webmanifest`、`podcast-latest.json`、`css/`、`js/`、`data/`、`assets/`）上傳到官網根目錄，覆蓋舊的 `index.html`。
2. 既有的 `stream.php` 不要動，它是備援音源。
3. 開 https://www.newradio.com.tw/ 確認：播放鍵能聽、「現在播出」有節目名、Podcast 區有集數。

**B. 交給 Claude 自動上傳**
在 Claude 雲端環境的 secrets 設定 `NEWRADIO_FTP_HOST / USER / PASS`，告訴我一聲，我寫一支部署腳本，之後每次改版一句話就上線。

## 資料怎麼保持最新

`tools/build-data.py` 會抓兩個來源並產生 JSON：
- 節目表：WordPress 頁面「雲端新節目表」裡的 JSON 區塊（之後改節目表，還是改那一頁就好）
- Podcast：SoundOn RSS（頻道 `049a45ff…`）

GitHub 上已設好每天台北時間 05:10 自動跑一次（`.github/workflows/newradio-data.yml`），有變動就 commit。
如果官網主機能跑 Python，也可以直接在主機 cron：`10 5 * * * cd /path/to/site && python3 tools/build-data.py`。

## 檔案地圖

```
index.html                首頁（新版）
listen.html               簡易收聽頁（原樣）
manifest.webmanifest      PWA
podcast-latest.json       舊版相容（newradio.js 讀）
css/newradio.css          原站樣式（原樣）
css/newradio-kit.css      頻譜 / 迷你播放列 / 逐字進場 / 跑馬燈
css/site.css              新區塊樣式
js/newradio.js            直播播放器（原樣，含 failover）
js/ui.js                  原站進場動畫（原樣）
js/newradio-kit.js        套件（見 ../newradio-kit/README.md）
js/site.js                現在播出 / 節目帶 / 主持人 / Podcast Hub / 公開資訊
data/schedule.json        節目表（自動產生）
data/podcast.json         Podcast 摘要（自動產生）
data/episodes/<id>.json   各節目全部集數（自動產生）
data/notices.json         公開資訊與公告（人工維護）
assets/                   logo、favicon、PWA icon、節目封面
news/                     電台消息報恁知（api.php 公開 JSON、admin/ 後台、emoji/ 專屬表情、data/ 與 uploads/ 執行時產生）
tools/build-data.py       資料產生器
```

## 已驗證（headless Chromium，桌機 1280 + 手機 390）

- 0 個 JS 錯誤；手機無橫向捲動。
- 現在播出依台北時間正確落在時段，進度條與「接下來」正確；主持人卡與節目帶同步標「直播中」。
- 14 + 14 個時段、21 位主持人、24 張節目卡、集數分頁、站內播放、換節目、週日切換都正常。
- 所有互動在 prefers-reduced-motion / reduced-transparency / contrast 下有對應降級。

未驗證：真實直播頻譜手感（沙箱連不到音源）、iOS 鎖定畫面顯示。上線後請用手機實聽一次。
