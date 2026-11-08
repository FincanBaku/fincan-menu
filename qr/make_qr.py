"""Генерирует QR-коды меню. Запуск: python3 qr/make_qr.py (нужны: pip install qrcode pillow)"""
import os, qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw, ImageFont, ImageOps

URL = "https://fincanbaku.github.io/menu/"
HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, "..", "docs", "img", "logo-round.webp")  # круглый, с прозрачными углами
DARK, ACCENT = (26, 58, 48), (242, 78, 30)
B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def make_qr(size, color, logo=True):
    q = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=20, border=2)
    q.add_data(URL); q.make(fit=True)
    img = q.make_image(fill_color=color, back_color="white").convert("RGB").resize((size, size), Image.NEAREST)
    if logo:
        s = int(size * 0.22); pad = int(s * 0.08)
        lg = Image.open(LOGO).convert("RGBA").resize((s, s), Image.LANCZOS)
        d = s + 2 * pad; x0 = (size - d) // 2
        ImageDraw.Draw(img).ellipse((x0, x0, x0 + d, x0 + d), fill="white")  # белый круг-подложка
        img.paste(lg, (x0 + pad, x0 + pad), lg)
    return img

out = lambda n: os.path.join(HERE, n)
make_qr(2000, (0, 0, 0), logo=False).save(out("qr-menu.png"))
make_qr(2000, DARK).save(out("qr-menu-logo.png"))

W, H = 1240, 1748  # A6 @ 300 dpi
card = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(card)
def ctext(y, t, f, fill=DARK):
    d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill)
d.rounded_rectangle((30, 30, W - 30, H - 30), radius=60, outline=DARK, width=8)
lg = Image.open(LOGO).convert("RGBA").resize((220, 220), Image.LANCZOS)
card.paste(lg, ((W - 220) // 2, 120), lg)
ctext(370, "Fincan Çay Evi", ImageFont.truetype(B, 92))
ctext(490, "MENYU", ImageFont.truetype(B, 64), ACCENT)
card.paste(make_qr(860, DARK), ((W - 860) // 2, 620))
f3 = ImageFont.truetype(R, 40)
ctext(1530, "Telefonun kamerasını QR koda tutun", f3, (60, 60, 60))
ctext(1600, "Наведите камеру телефона на QR-код", f3, (60, 60, 60))
card.save(out("qr-card-A6.png"), dpi=(300, 300))
card.save(out("qr-card-A6.pdf"), resolution=300)
print("QR ->", URL)
