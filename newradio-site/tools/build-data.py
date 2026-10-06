#!/usr/bin/env python3
"""
雲端新廣播官網 — 資料產生器（零第三方套件，Python 3.8+）
產出：
  data/schedule.json   ← 從 WordPress「雲端新節目表」頁面裡的 JSON 區塊抽出
  data/podcast.json    ← 從 SoundOn RSS 解析，依標題關鍵字分到 8 個節目
用法：python3 tools/build-data.py        （在 newradio-site/ 目錄下執行）
建議每天跑一次（cron 或 GitHub Actions），失敗時保留舊檔不覆寫。
"""
import json, re, sys, html, urllib.request, datetime, os
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
UA = {"User-Agent": "Mozilla/5.0 (newradio-site build-data)"}
SCHEDULE_URL = "https://www.newradio.com.tw/ForApp/%E7%AF%80%E7%9B%AE%E5%96%AE/%E9%9B%B2%E7%AB%AF%E6%96%B0%E7%AF%80%E7%9B%AE%E8%A1%A8/"
RSS_URL = "https://feeds.soundon.fm/podcasts/049a45ff-4d3f-484a-9ee8-34ab791e17e9.xml"
SOUNDON_PLAYER = "https://player.soundon.fm/p/049a45ff-4d3f-484a-9ee8-34ab791e17e9"

# 節目定義（與 newradio-podcast/src/data/shows.ts 同步）
SHOWS = [
  {"id":"jin-qu","title":"金曲悄悄話","category":"音樂娛樂","host":"雲端新廣播","cover":"assets/shows/jin-qu.jpg",
   "description":"深入挖掘台灣流行音樂的黃金年代，每集聚焦一位傳奇歌手，說出那些你不知道的幕後故事。"},
  {"id":"guan-ming-sanguo","title":"冠鳴講古之三國","category":"故事","host":"冠鳴","cover":"assets/shows/guan-ming-sanguo.jpg",
   "description":"說書人帶你穿越時空，重返三國亂世。從黃巾起義到三分天下，每集近一小時的精彩歷史說書。"},
  {"id":"guan-ming-shuihu","title":"冠鳴講古之水滸傳","category":"故事","host":"冠鳴","cover":"assets/shows/guan-ming-shuihu.jpg",
   "description":"一百零八條好漢的江湖傳奇。忠義堂上聚英雄，一集一回帶你走進水滸的快意恩仇世界。"},
  {"id":"guan-ming-liao","title":"冠鳴講古之民間傳奇廖添丁","category":"故事","host":"冠鳴","cover":"assets/shows/guan-ming-liao.jpg",
   "description":"台灣民間傳奇人物廖添丁的故事，用經典說書口吻帶你重溫日治時期的義賊傳說。"},
  {"id":"she-hui-ren","title":"舍會人","category":"生活風格","host":"陳冠鳴 & 黃昭翰","cover":"assets/shows/she-hui-ren.jpg",
   "description":"台長陳冠鳴與高雄地檢署黃昭翰檢察官聯手主持，聚焦社會議題、防詐知識與普法教育。"},
  {"id":"suddenly-listen","title":"突然好想聽","category":"音樂娛樂","host":"吳想 & Coody","cover":"assets/shows/suddenly-listen.jpg",
   "description":"質感音樂 Podcast，暢聊華語流行音樂大小事。那些突然在腦海響起的旋律，每一首都藏著一段故事。"},
  {"id":"dont-line","title":"Don't Line To Me","category":"生活風格","host":"史考特","cover":"assets/shows/dont-line.jpg",
   "description":"破解假新聞與假消息的實用型 Podcast。分享生活「真」常識，排除「偽」訊息，讓你不再上當。"},
  {"id":"360-life","title":"360°生活家","category":"生活風格","host":"雲端新廣播","cover":"assets/shows/360-life.jpg",
   "description":"每集 8–13 分鐘，探索食衣住行育樂的冷知識與生活智慧。"},
]

def detect_series(title):
    t = title
    if "廖添丁" in t: return "guan-ming-liao"
    if "冠鳴講古" in t and "水滸" in t: return "guan-ming-shuihu"
    if "冠鳴講古" in t: return "guan-ming-sanguo"
    if "金曲悄悄話" in t: return "jin-qu"
    if "360°" in t or "360度" in t or "生活家" in t: return "360-life"
    if "舍會人" in t: return "she-hui-ren"
    if "突然好想聽" in t: return "suddenly-listen"
    if re.search(r"don.?t\s*line", t, re.I): return "dont-line"
    return "other"

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

def write_json(name, obj):
    path = os.path.join(DATA, name)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)
    print("✓", name)

# ---------------------------------------------------------------- schedule
def build_schedule():
    page = fetch(SCHEDULE_URL)
    text = re.sub(r"<[^>]+>", "\n", page)
    text = html.unescape(text)
    m = re.search(r"\{\s*\"周一至周六\".*?\"圖片對應表\"\s*:\s*\{.*?\}\s*\}", text, re.S)
    if not m:
        raise RuntimeError("節目表頁面找不到 JSON 區塊")
    raw = json.loads(m.group(0))
    def norm(items):
        out = []
        for it in items:
            a, b = [x.strip() for x in it["時間"].split("-")]
            out.append({"start": a, "end": b, "title": it["節目"].strip(), "hosts": [h.strip() for h in re.split(r"[、,，/]", it["主持人"]) if h.strip()], "summary": it.get("主旨", "").strip(), "rerun": "重播" in it["節目"]})
        return out
    hosts = {}
    for day in ("周一至周六", "週日"):
        for it in norm(raw[day]):
            for h in it["hosts"]:
                hosts.setdefault(h, {"name": h, "shows": []})
                label = it["title"].replace("-重播", "")
                if label not in hosts[h]["shows"]: hosts[h]["shows"].append(label)
    order = list(raw.get("圖片對應表", {}).values())
    host_list = sorted(hosts.values(), key=lambda h: order.index(h["name"]) if h["name"] in order else 999)
    write_json("schedule.json", {
        "source": SCHEDULE_URL, "generatedAt": datetime.datetime.now().isoformat(timespec="seconds"),
        "timezone": "Asia/Taipei",
        "weekday": norm(raw["周一至周六"]), "sunday": norm(raw["週日"]), "hosts": host_list})

# ---------------------------------------------------------------- podcast
def parse_duration(s):
    if not s: return 0
    s = s.strip()
    if s.isdigit(): return int(s)
    parts = [int(p) for p in s.split(":") if p.strip().isdigit()]
    sec = 0
    for p in parts: sec = sec * 60 + p
    return sec

def build_podcast():
    xml = fetch(RSS_URL)
    root = ET.fromstring(xml.encode("utf-8"))
    ns = {"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"}
    ch = root.find("channel")
    episodes = []
    for item in ch.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        enc = item.find("enclosure")
        audio = enc.get("url") if enc is not None else ""
        pub = (item.findtext("pubDate") or "").strip()
        try:
            dt = datetime.datetime.strptime(pub[:25].strip(), "%a, %d %b %Y %H:%M:%S")
            date = dt.strftime("%Y.%m.%d"); iso = dt.strftime("%Y-%m-%d")
        except Exception:
            date = pub; iso = ""
        desc = html.unescape(re.sub(r"<[^>]+>", "", item.findtext("description") or "")).strip()
        desc = re.sub(r"\s+", " ", desc)[:160]
        dur = parse_duration(item.findtext("itunes:duration", default="", namespaces=ns))
        img = item.find("itunes:image", ns)
        episodes.append({
            "id": (item.findtext("guid") or link or title).strip(),
            "show": detect_series(title), "title": title, "date": date, "iso": iso,
            "durationSec": dur, "durationText": (f"{dur//60} 分" if dur else ""),
            "description": desc, "url": link, "audio": audio,
            "cover": img.get("href") if img is not None else ""
        })
    episodes.sort(key=lambda e: e["iso"], reverse=True)
    # 不屬於八大節目的集數：依標題前綴自動歸成「系列」（例：吃人公寓-4 → 吃人公寓）
    def series_key(t):
        t = re.sub(r"[《〈\[【(（].*?[》〉\]】)）]", lambda m: m.group(0).strip("《〈[【(（》〉]】)）"), t)  # 去括號保留內文
        t = re.split(r"\s*(?:[-_|｜:：]|EP\s*\d|ep\s*\d|第[0-9一二三四五六七八九十百零〇]+[回集話]|之[0-9一二三四五六七八九十百零〇]+)", t, maxsplit=1)[0]
        return re.sub(r"\s+", " ", t).strip(" -_|｜:：")
    groups, names = {}, {}
    for e in episodes:
        if e["show"] != "other": continue
        k = series_key(e["title"]) or "其他"
        nk = re.sub(r"\s+", "", k).lower()          # 「晚安Do Re Mi」與「晚安DoReMi」視為同一系列
        names.setdefault(nk, k)
        groups.setdefault(names[nk], []).append(e)
    # 只有 1 集的零星標題併成「其他單集」
    singles = [k for k, eps in groups.items() if len(eps) < 2]
    if singles:
        merged = []
        for k in singles: merged.extend(groups.pop(k))
        merged.sort(key=lambda e: e["iso"], reverse=True)
        groups["其他單集"] = merged
    collections = []
    for k, eps in groups.items():
        sid = "c-" + re.sub(r"[^0-9a-zA-Z\u4e00-\u9fff]+", "-", k).strip("-").lower()
        for e in eps: e["show"] = sid
        cover_file = os.path.join(ROOT, "assets", "shows", sid + ".jpg")   # 有做封面就用，沒有前端用字母色塊
        collections.append({"id": sid, "title": k, "category": "更多系列", "host": "雲端新廣播", "cover": ("assets/shows/" + sid + ".jpg") if os.path.exists(cover_file) else "",
                            "description": "", "episodeCount": len(eps), "latest": eps[0]["iso"], "totalMin": sum(x["durationSec"] for x in eps)//60, "auto": True})
    collections.sort(key=lambda c: c["latest"], reverse=True)
    shows = []
    for s in SHOWS:
        eps = [e for e in episodes if e["show"] == s["id"]]
        shows.append(dict(s, episodeCount=len(eps), latest=eps[0]["iso"] if eps else "",
                          totalMin=sum(e["durationSec"] for e in eps)//60,
                          soundonUrl=SOUNDON_PLAYER))
    chan_img = ch.find("itunes:image", ns)
    # 每個節目/系列一個檔，首頁只載入摘要
    os.makedirs(os.path.join(DATA, "episodes"), exist_ok=True)
    for sid in set(e["show"] for e in episodes):
        write_json(os.path.join("episodes", sid + ".json"), [e for e in episodes if e["show"] == sid])
    # 舊版首頁相容：根目錄 podcast-latest.json（newradio.js 讀這個）
    idx = {x["id"]: x for x in shows + collections}
    with open(os.path.join(ROOT, "podcast-latest.json"), "w", encoding="utf-8") as f:
        json.dump({"source": RSS_URL, "generatedAt": datetime.datetime.now().isoformat(timespec="seconds"),
                   "episodes": [{"title": e["title"], "date": e["date"], "duration": e["durationText"], "url": e["url"],
                                 "show": idx.get(e["show"], {}).get("title", "")} for e in episodes[:10]]}, f, ensure_ascii=False, indent=1)
    print("✓ podcast-latest.json")
    for e in episodes: e.pop("description", None)
    write_json("podcast.json", {
        "source": RSS_URL, "generatedAt": datetime.datetime.now().isoformat(timespec="seconds"),
        "channel": {"title": (ch.findtext("title") or "").strip(), "player": SOUNDON_PLAYER,
                     "spotify": "https://open.spotify.com/show/3bbpPQCgpPt67Ynnyu1zrX",
                     "kkbox": "https://podcast.kkbox.com/tw/channel/KtAdo76NqwOGIryURY",
                     "cover": chan_img.get("href") if chan_img is not None else ""},
        "shows": shows, "collections": collections,
        "latest": [dict(e) for e in episodes[:40]],
        "latestByShow": {sid: [e["id"] for e in episodes if e["show"] == sid][:4] for sid in set(e["show"] for e in episodes)}})
    print(f"  episodes: {len(episodes)}; shows:", {s['id']: s['episodeCount'] for s in shows})
    print("  auto collections:", [(c['title'], c['episodeCount']) for c in collections[:25]])

if __name__ == "__main__":
    os.makedirs(DATA, exist_ok=True)
    ok = True
    for fn in (build_schedule, build_podcast):
        try: fn()
        except Exception as e:
            ok = False; print("✗", fn.__name__, e, file=sys.stderr)
    sys.exit(0 if ok else 1)
