"""雲端新廣播官網上線腳本（在你自己的 Windows 電腦上執行，依 2026-10-07 FTP 交接規則）

用法（在 newradio-site 資料夾裡開命令列）：
  py -3 tools\deploy_newradio.py            # 演練：只檢查、只列清單，不上傳
  py -3 tools\deploy_newradio.py --go       # 正式上傳
  py -3 tools\deploy_newradio.py --go --force   # 線上檔已被別台電腦改過時，確認後仍要覆蓋

規則（全部寫死在程式裡，不是靠自覺）：
  1. 密碼從本機 FileZilla 的 sitemanager.xml 在記憶體裡讀，不列印、不寫檔、不進 Git。
  2. 明確式 FTPS、被動模式、驗證憑證；不退回明碼 FTP。
  3. 只碰 /public_html/ 裡「本次改版的指定路徑」；不在 / 新增任何資料夾；不刪任何遠端檔案。
  4. 要覆蓋的既有檔案，先下載到本機 backup_日期時間/（只存本機）。
  5. 原版四個檔（index.html / css/newradio.css / js/newradio.js / js/ui.js）上傳前核對遠端雜湊，
     跟 2026-10-06 抓回來的基線不同就停下來，除非 --force。
  6. 先傳相依資產，最後才傳 index.html。
  7. 傳完用 HTTPS 實際檢查首頁、資料檔、後台 API。
"""
from __future__ import annotations
import argparse, base64, datetime, ftplib, getpass, hashlib, io, os, ssl, sys, urllib.request, json
import xml.etree.ElementTree as ET
from pathlib import Path

HOST, PORT, USER_EXPECTED = "cp38.g-dns.com", 21, "newradio"
WEB_ROOT = "/public_html"
SITE_URL = "https://www.newradio.com.tw"
LOCAL = Path(__file__).resolve().parent.parent          # newradio-site/

# 2026-10-06 從線上抓回來的原版檔案雜湊（SHA-256）
BASELINE = {
    "index.html":      "b791972cb27d2f4d8468673978eaec48fd664e9776cc4accbe330e35276fb984",
    "css/newradio.css": "ca3ac632581c55dcc8c10e8deedc36ed43a8388fe0efb59788ba1443c24a7530",
    "js/newradio.js":  "a187588793c46d6e951dbcd47076f2414388dd5db784f4bb6dab1d04040a0a7e",
    "js/ui.js":        "c514e64a4ec04dc3c48d236ad05dea879bd6172e228eec9f8d7a4b99786d33df",
}
# 不上傳：工具、說明、原始圖、字型、示範頁、執行時資料
EXCLUDE_DIRS = {"tools", "demo", "assets/covers/raw", "assets/covers/fonts", "news/uploads", ".git"}
EXCLUDE_FILES = {"README.md", "HANDOFF.md", ".gitignore", "news/data/news.json", "news/data/settings.json", "news/data/schedule.json"}

def sha(b: bytes) -> str: return hashlib.sha256(b).hexdigest()

def manifest() -> list[str]:
    out = []
    for p in LOCAL.rglob("*"):
        if not p.is_file(): continue
        rel = p.relative_to(LOCAL).as_posix()
        if any(rel == d or rel.startswith(d + "/") for d in EXCLUDE_DIRS): continue
        if rel in EXCLUDE_FILES or p.name == ".gitignore": continue
        out.append(rel)
    # 相依資產先、index.html 最後
    out.sort(key=lambda r: (r == "index.html", r))
    return out

def filezilla_password() -> tuple[str, str]:
    cfg = Path(os.environ["APPDATA"]) / "FileZilla" / "sitemanager.xml"
    sites = [s for s in ET.parse(cfg).findall(".//Server")
             if s.findtext("Host") == "newradio.com.tw" and s.findtext("User") == USER_EXPECTED]
    if len(sites) != 1: raise SystemExit("FileZilla 裡找不到唯一的 newradio.com.tw / newradio 站台。")
    node = sites[0].find("Pass")
    if node is None or not node.text: raise SystemExit("FileZilla 沒有存密碼；請先在 FileZilla 存好再執行。")
    enc = node.get("encoding", "")
    if enc not in ("", "base64"): raise SystemExit("FileZilla 密碼被主密碼鎖住，請先解鎖；本腳本不會嘗試破解。")
    pw = base64.b64decode(node.text).decode("utf8") if enc == "base64" else node.text
    return sites[0].findtext("User"), pw

def connect() -> ftplib.FTP_TLS:
    user, pw = filezilla_password()
    ftp = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=60)
    ftp.connect(HOST, PORT); ftp.login(user, pw); ftp.prot_p(); ftp.set_pasv(True)
    del pw
    ftp.cwd(WEB_ROOT)
    if ftp.pwd().rstrip("/") != WEB_ROOT: raise SystemExit("遠端工作目錄不是 /public_html，停止。")
    return ftp

def remote_get(ftp: ftplib.FTP_TLS, rel: str) -> bytes | None:
    buf = io.BytesIO()
    try: ftp.retrbinary(f"RETR {rel}", buf.write); return buf.getvalue()
    except ftplib.error_perm: return None

def ensure_dir(ftp: ftplib.FTP_TLS, rel_dir: str, made: set, go: bool):
    parts = [p for p in rel_dir.split("/") if p]
    cur = ""
    for p in parts:
        cur = f"{cur}/{p}" if cur else p
        if cur in made: continue
        try: ftp.cwd(f"{WEB_ROOT}/{cur}"); ftp.cwd(WEB_ROOT)
        except ftplib.error_perm:
            print(f"  建立資料夾 {WEB_ROOT}/{cur}" + ("" if go else "（演練：未建立）"))
            if go: ftp.mkd(f"{WEB_ROOT}/{cur}")
        made.add(cur)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--go", action="store_true", help="正式上傳（預設只演練）")
    ap.add_argument("--force", action="store_true", help="線上檔與基線不同時仍覆蓋")
    args = ap.parse_args()
    go = args.go

    files = manifest()
    print(f"本次清單：{len(files)} 個檔案，全部位於 {WEB_ROOT}/ 之下。")

    # 後台密碼檔：執行時輸入，只產生在本機 news/data/，隨後上傳
    cfg_path = LOCAL / "news" / "data" / "config.php"
    if go and not cfg_path.exists():
        pw = getpass.getpass("後台密碼（輸入時不顯示；按 Enter 跳過則後台會走第一次設定流程）：")
        if pw:
            import subprocess
            r = subprocess.run(["php", str(LOCAL / "tools" / "make-password.php"), pw], capture_output=True, text=True)
            if r.returncode != 0:
                # 沒有 php 就用 Python 產生 bcrypt：需要 pip install bcrypt
                try:
                    import bcrypt
                    h = bcrypt.hashpw(pw.encode(), bcrypt.gensalt(10)).decode()
                    cfg_path.parent.mkdir(parents=True, exist_ok=True)
                    cfg_path.write_text("<?php\nreturn array (\n  'hash' => '" + h + "',\n  'created' => '" + datetime.datetime.now().isoformat() + "',\n);\n", encoding="utf8")
                except ImportError:
                    raise SystemExit("本機沒有 php 也沒有 bcrypt 套件：請先 pip install bcrypt，或跳過密碼讓後台走第一次設定。")
        del pw
    if cfg_path.exists() and "news/data/config.php" not in files: files.insert(len(files) - 1, "news/data/config.php")

    ftp = connect()
    print("FTPS 已連線，位置", ftp.pwd())
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    backup = LOCAL.parent / f"backup_newradio_{stamp}"
    made: set = set(); conflicts = []; to_upload = []

    # 1) 逐一比對遠端
    for rel in files:
        local = (LOCAL / rel).read_bytes()
        remote = remote_get(ftp, rel)
        if remote is None:
            to_upload.append((rel, local, "新檔")); continue
        if sha(remote) == sha(local):
            print(f"  相同，略過  {rel}"); continue
        if rel in BASELINE and sha(remote) != BASELINE[rel]:
            conflicts.append(rel)
        to_upload.append((rel, local, "覆蓋"))
        (backup / rel).parent.mkdir(parents=True, exist_ok=True)
        (backup / rel).write_bytes(remote)

    if conflicts and not args.force:
        print("\n停止：下列原版檔案在線上已經跟 2026-10-06 的基線不一樣，可能是別台電腦改過。")
        for c in conflicts: print("   ", c)
        print(f"線上版本已備份到 {backup}。請先比對合併，確定要覆蓋再加 --force。")
        ftp.close(); sys.exit(2)

    print(f"\n將{'上傳' if go else '（演練）上傳'} {len(to_upload)} 個檔案，備份在 {backup if backup.exists() else '（沒有需要備份的檔）'}")
    for rel, data, kind in to_upload:
        print(f"  {kind}  {rel}  ({len(data):,} bytes)")

    if not go:
        print("\n演練結束，沒有動到主機。確認清單沒問題後加 --go 正式上傳。"); ftp.close(); return

    # 2) 上傳：先建資料夾，再傳檔；index.html 已排在最後
    for rel, data, kind in to_upload:
        if "/" in rel: ensure_dir(ftp, rel.rsplit("/", 1)[0], made, go)
        ftp.storbinary(f"STOR {rel}", io.BytesIO(data))
        print(f"  已上傳  {rel}")
    for d in ("news/data", "news/uploads"):
        try: ftp.sendcmd(f"SITE CHMOD 755 {WEB_ROOT}/{d}")
        except ftplib.all_errors: pass
    ftp.close()

    # 3) HTTPS 實際檢查
    print("\n線上檢查：")
    def get(path):
        with urllib.request.urlopen(SITE_URL + path, timeout=30) as r: return r.status, r.read()
    s, body = get("/"); print(f"  首頁 {s}，與本機 index.html {'相同' if body == (LOCAL / 'index.html').read_bytes() else '不同！'}")
    s, body = get("/data/schedule.json"); print(f"  節目表資料 {s}，{len(body):,} bytes")
    try:
        s, body = get("/news/api.php"); j = json.loads(body); print(f"  後台 API {s}，目前消息 {j.get('total', 0)} 則")
    except Exception as e:
        print(f"  後台 API 讀取失敗：{e}（常見原因：news/data 或 news/uploads 沒有寫入權限，請在 cPanel 檔案管理員把這兩個資料夾權限設 755 或 775）")
    print("完成。請用手機實際開 https://www.newradio.com.tw/ 按播放鍵聽一次。")

if __name__ == "__main__":
    main()
