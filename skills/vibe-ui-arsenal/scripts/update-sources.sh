#!/usr/bin/env bash
# 重新抓取七個網站的機器可讀來源（llms.txt / sitemap / registry 範例 / Uiverse galaxy）
# 用法： bash skills/vibe-ui-arsenal/scripts/update-sources.sh [輸出目錄]
# 預設輸出到 skills/vibe-ui-arsenal/.cache/ （已加入 .gitignore，不進版控）
set -euo pipefail
OUT="${1:-$(cd "$(dirname "$0")/.." && pwd)/.cache}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"
mkdir -p "$OUT"
fetch() { # fetch <url> <file>
  if curl -sS -L --max-time 30 -A "$UA" -o "$OUT/$2" "$1"; then echo "✓ $2"; else echo "✗ $2  ($1)"; fi
}
echo "== llms.txt =="
fetch https://reactbits.dev/llms.txt        reactbits.llms.txt
fetch https://magicui.design/llms.txt       magicui.llms.txt
fetch https://ui.aceternity.com/llms.txt    aceternity.llms.txt
fetch https://21st.dev/llms.txt             21st.llms.txt
fetch https://motionsites.ai/llms.txt       motionsites.llms.txt
echo "== sitemaps =="
fetch https://reactbits.dev/sitemap.xml     reactbits.sitemap.xml
fetch https://ui.aceternity.com/sitemap.xml aceternity.sitemap.xml
fetch https://motionsites.ai/sitemap.xml    motionsites.sitemap.xml
fetch https://21st.dev/sitemap.xml          21st.sitemap.xml
echo "== 21st agent endpoints =="
fetch https://21st.dev/.well-known/skills/index.json 21st.skills.index.json
fetch https://21st.dev/openapi.json          21st.openapi.json
echo "== Uiverse galaxy (MIT, 3800+ 元素) =="
if [ -d "$OUT/galaxy/.git" ]; then git -C "$OUT/galaxy" pull -q --ff-only && echo "✓ galaxy updated"; 
else git clone -q --depth 1 https://github.com/uiverse-io/galaxy.git "$OUT/galaxy" && echo "✓ galaxy cloned"; fi
echo "完成：$OUT"
