# 把節目名壓到 GPT Image 生成的底圖下方留白區；輸出 1024 主檔（assets/covers/<id>.jpg，給 SoundOn 等平台）
# 與 640 官網版（assets/shows/<id>.jpg）。用法：python3 tools/compose-covers.py  （需要 pip install pillow）
# 新增節目：把底圖放到 assets/covers/raw/<id>.jpg，在 SHOWS 加一行，再跑一次。
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json, os, sys
SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
HERE = os.path.join(SITE, "assets", "covers")          # raw/<id>.jpg 底圖、fonts/ 字型
FONT_URLS = {
  "NotoSansTC-Black.otf": "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Black.otf",
  "NotoSansTC-Bold.otf":  "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Bold.otf",
}
os.makedirs(os.path.join(HERE, "fonts"), exist_ok=True)
for name, url in FONT_URLS.items():                   # 字型 17MB 不進版控，缺的時候自動下載
    p = os.path.join(HERE, "fonts", name)
    if not os.path.exists(p):
        import urllib.request; print("downloading", name); urllib.request.urlretrieve(url, p)
BLACK = os.path.join(HERE, "fonts", "NotoSansTC-Black.otf"); BOLD = os.path.join(HERE, "fonts", "NotoSansTC-Bold.otf")
INK = (31, 43, 51); MUTED = (100, 113, 122); MINT = (18, 128, 124); RED = (232, 67, 74); CREAM = (250, 246, 239)
SHOWS = {
  "jin-qu": ("金曲悄悄話", "台灣流行音樂的黃金年代"),
  "guan-ming-sanguo": ("冠鳴講古之三國", "說書人冠鳴"),
  "guan-ming-shuihu": ("冠鳴講古之水滸傳", "說書人冠鳴"),
  "guan-ming-liao": ("冠鳴講古之民間傳奇廖添丁", "說書人冠鳴"),
  "she-hui-ren": ("舍會人", "陳冠鳴 × 黃昭翰檢察官"),
  "suddenly-listen": ("突然好想聽", "吳想 × Coody"),
  "dont-line": ("Don't Line To Me", "史考特的防詐真常識"),
  "360-life": ("360°生活家", "食衣住行育樂冷知識"),
}
def fit(draw, text, path, max_w, start, min_size=40):
    size = start
    while size > min_size:
        f = ImageFont.truetype(path, size)
        if draw.textlength(text, font=f) <= max_w: return f
        size -= 4
    return ImageFont.truetype(path, min_size)
def compose(sid, title, sub):
    im = Image.open(os.path.join(HERE, "raw", sid + ".jpg")).convert("RGB").resize((1024, 1024), Image.LANCZOS)
    # 底部柔和奶油漸層，保證字壓得住任何底圖
    grad = Image.new("L", (1, 1024), 0); px = grad.load()
    for y in range(1024): px[0, y] = int(max(0, min(255, (y - 640) / 384 * 230)))
    grad = grad.resize((1024, 1024))
    im = Image.composite(Image.new("RGB", (1024, 1024), CREAM), im, grad)
    d = ImageDraw.Draw(im)
    M = 72
    # 品牌小標
    kick = ImageFont.truetype(BOLD, 24)
    d.text((M, 1024 - M - 30), "雲端新播客", font=kick, fill=MINT)
    kw = d.textlength("雲端新播客", font=kick)
    d.text((M + kw + 14, 1024 - M - 30), "NEW RADIO FM99.5", font=ImageFont.truetype(BOLD, 22), fill=MUTED)
    # 副標
    subf = ImageFont.truetype(BOLD, 30)
    d.text((M, 1024 - M - 30 - 52), sub, font=subf, fill=MUTED)
    # 主標（自動縮到一行塞得下）
    tf = fit(d, title, BLACK, 1024 - 2 * M, 104)
    th = tf.getbbox(title)[3]
    y = 1024 - M - 30 - 52 - 24 - th
    d.text((M, y), title, font=tf, fill=INK)
    # 紅色小橫槓（品牌語彙：紅只給播放/直播/重點）
    d.rounded_rectangle((M, y - 26, M + 56, y - 18), radius=4, fill=RED)
    os.makedirs(os.path.join(SITE, "assets", "covers"), exist_ok=True)
    im.save(os.path.join(SITE, "assets", "covers", sid + ".jpg"), quality=90, optimize=True)
    im.resize((640, 640), Image.LANCZOS).save(os.path.join(SITE, "assets", "shows", sid + ".jpg"), quality=86, optimize=True)
for sid, (t, s) in SHOWS.items():
    if os.path.exists(os.path.join(HERE, "raw", sid + ".jpg")): compose(sid, t, s); print("✓", sid)
