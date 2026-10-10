"""
Build every optimized image the site uses from the raw assets folder.

Usage:  python3 tools/process_assets.py <raw assets dir> <site root> [<cutout png>]
  - crops browser chrome / taskbar / scrollbar off the website screenshots
  - exports WebP + JPG/PNG fallbacks in several widths
  - slices the Telegram screenshots into animatable layers (pixels untouched -
    the blur on customer data is kept exactly as it is)
"""
import sys, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
CUTOUT = sys.argv[3] if len(sys.argv) > 3 else None
VIEWPORT = (0, 87, 1265, 984)          # measured: chrome ends y=86, taskbar starts y=984, scrollbar x>=1265


def resize_w(im, w):
    return im if im.width == w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def save_variants(im, outdir, name, widths, q=80, alpha=False):
    os.makedirs(outdir, exist_ok=True)
    for w in widths:
        r = resize_w(im, w)
        r.save(f'{outdir}/{name}-{w}.webp', 'WEBP', quality=q, method=6)
        if alpha:
            r.save(f'{outdir}/{name}-{w}.png', optimize=True)
        else:
            r.convert('RGB').save(f'{outdir}/{name}-{w}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)


# ---------------------------------------------------------------- websites
SITES = [
    ('01-sedrastores-com-live.png', 'sedra-store'),
    ('02-sedra-store-luxury-concept.png', 'sedra-luxury'),
    ('03-yours-beauty-treatment.png', 'yours-beauty'),
    ('04-om-nour-herbs.png', 'om-nour'),
    ('05-27-juniors-zmls.png', '27-juniors'),
    ('06-yousef-x-venom.png', 'yousef-venom'),
    ('07-old-portfolio-1-gold.png', 'portfolio-v1'),
    ('08-old-portfolio-3-neon.png', 'portfolio-v3'),
]
for fn, slug in SITES:
    im = Image.open(f'{SRC}/websites/{fn}').convert('RGB').crop(VIEWPORT)
    save_variants(im, f'{OUT}/public/work', slug, [1265, 960, 640])
    print('work', slug, im.size)

# ---------------------------------------------------------------- dashboard
dash = Image.open(f'{SRC}/systems/11-sedra-admin-dashboard-analytics.png').convert('RGB').crop(VIEWPORT)
save_variants(dash, f'{OUT}/public/systems', 'sedra-dashboard', [1265, 800])
print('dashboard', dash.size)


# ---------------------------------------------------------------- helpers for layers
def rounded_mask(size, box, r, ss=4):
    """anti-aliased rounded-rect mask; box in pixel coords of `size`"""
    W, H = size
    big = Image.new('L', (W * ss, H * ss), 0)
    ImageDraw.Draw(big).rounded_rectangle([box[0] * ss, box[1] * ss, (box[2] + 1) * ss - 1, (box[3] + 1) * ss - 1],
                                          radius=r * ss, fill=255)
    return big.resize((W, H), Image.LANCZOS)


def component_mask(arr, seed, tol, ymin=0):
    seed_c = arr[seed[1], seed[0]].astype(int)
    m = (np.abs(arr.astype(int) - seed_c).max(axis=2) <= tol).astype(np.uint8)
    m[:ymin] = 0
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    comp = (lab == lab[seed[1], seed[0]]).astype(np.uint8)
    # fill holes (text, emoji, images inside the bubble)
    h, w = comp.shape
    ff = comp.copy() * 255
    pad = np.zeros((h + 2, w + 2), np.uint8)
    inv = 255 - ff
    cv2.floodFill(inv, pad, (0, 0), 0)
    filled = np.clip(ff + inv, 0, 255)
    return filled


def save_layer(im_rgba, outdir, name, q=86):
    os.makedirs(outdir, exist_ok=True)
    im_rgba.save(f'{outdir}/{name}.webp', 'WEBP', quality=q, method=6)
    im_rgba.save(f'{outdir}/{name}.png', optimize=True)


def mirror_tile(patch, horiz=True, vert=True):
    w, h = patch.size
    tw, th = w * (2 if horiz else 1), h * (2 if vert else 1)
    t = Image.new('RGB', (tw, th))
    t.paste(patch, (0, 0))
    if horiz:
        t.paste(patch.transpose(Image.FLIP_LEFT_RIGHT), (w, 0))
    if vert:
        t.paste(patch.transpose(Image.FLIP_TOP_BOTTOM), (0, h))
        if horiz:
            t.paste(patch.transpose(Image.ROTATE_180), (w, h))
    return t


SYS = f'{OUT}/public/systems'

# ---------------------------------------------------------------- 09 Sedra (desktop Telegram)
s9 = Image.open(f'{SRC}/systems/09-telegram-order-bot-sedra.png').convert('RGB')
W9, H9 = s9.size
# window crop used by the mockup (centred on the chat column 167..767)
WIN = (96, 0, 838, 886)
layers9 = {
    'header': ((167, 10, 767, 54), 22),
    'input': ((171, 835, 767, 878), 22),
    'bubble': ((173, 64, 590, 822), 12),
}
meta = {}
for name, (box, r) in layers9.items():
    pad = 2
    cb = (box[0] - pad, box[1] - pad, box[2] + pad + 1, box[3] + pad + 1)
    crop = s9.crop(cb).convert('RGBA')
    mask = rounded_mask(crop.size, (pad, pad, crop.size[0] - pad - 1, crop.size[1] - pad - 1), r)
    crop.putalpha(mask)
    save_layer(crop, SYS, f'tg-sedra-{name}')
    meta[name] = (cb[0] - WIN[0], cb[1] - WIN[1], crop.size[0], crop.size[1])
patch9 = s9.crop((598, 62, 940, 826))
tile9 = mirror_tile(patch9)
tile9.save(f'{SYS}/tg-sedra-bg.webp', 'WEBP', quality=72, method=6)
tile9.save(f'{SYS}/tg-sedra-bg.jpg', 'JPEG', quality=74, optimize=True, progressive=True)
print('tg-sedra window', (WIN[2] - WIN[0], WIN[3] - WIN[1]), 'layers', meta, 'tile', tile9.size)

# ---------------------------------------------------------------- 10 Om Nour (phone Telegram)
s10 = Image.open(f'{SRC}/systems/10-telegram-order-bot-omnour.jpg').convert('RGB')
a10 = np.asarray(s10)
meta10 = {}
# header = full-width bar
hdr = s10.crop((0, 0, 603, 88)).convert('RGBA')
save_layer(hdr, SYS, 'tg-omnour-header')
meta10['header'] = (0, 0, 603, 88)
# bubble (with tail) - colour component + filled holes
bm = component_mask(a10, (300, 880), 7)
ys, xs = np.where(bm > 0)
bb = (xs.min(), ys.min(), xs.max(), ys.max())
bm_img = Image.fromarray(bm).filter(ImageFilter.GaussianBlur(0.6))
pad = 2
cb = (max(bb[0] - pad, 0), bb[1] - pad, bb[2] + pad + 1, bb[3] + pad + 1)
bub = s10.crop(cb).convert('RGBA')
bub.putalpha(bm_img.crop(cb))
save_layer(bub, SYS, 'tg-omnour-bubble')
meta10['bubble'] = (cb[0], cb[1], bub.size[0], bub.size[1])
# date chip
cm = component_mask(a10, (300, 598), 9)
ys, xs = np.where(cm > 0)
cbb = (xs.min(), ys.min(), xs.max(), ys.max())
ch_box = (cbb[0] - 2, cbb[1] - 2, cbb[2] + 3, cbb[3] + 3)
chip = s10.crop(ch_box).convert('RGBA')
chip.putalpha(rounded_mask(chip.size, (2, 2, chip.size[0] - 3, chip.size[1] - 3), (cbb[3] - cbb[1]) // 2))
save_layer(chip, SYS, 'tg-omnour-chip')
meta10['chip'] = (ch_box[0], ch_box[1], chip.size[0], chip.size[1])
# input pill + mic button
pm = component_mask(a10, (300, 1230), 9, ymin=1185)
mm = component_mask(a10, (540, 1229), 45, ymin=1185)
um = np.clip(pm.astype(int) + mm.astype(int), 0, 255).astype(np.uint8)
um = cv2.dilate(um, np.ones((3, 3), np.uint8))
ys, xs = np.where(um > 0)
ib = (max(xs.min() - 2, 0), ys.min() - 2, min(xs.max() + 3, 603), min(ys.max() + 3, 1280))
inp = s10.crop(ib).convert('RGBA')
inp.putalpha(Image.fromarray(um).filter(ImageFilter.GaussianBlur(0.6)).crop(ib))
save_layer(inp, SYS, 'tg-omnour-input')
meta10['input'] = (ib[0], ib[1], inp.size[0], inp.size[1])
patch10 = s10.crop((0, 92, 603, 576))
tile10 = mirror_tile(patch10, horiz=False, vert=True)
tile10.save(f'{SYS}/tg-omnour-bg.webp', 'WEBP', quality=72, method=6)
tile10.save(f'{SYS}/tg-omnour-bg.jpg', 'JPEG', quality=74, optimize=True, progressive=True)
print('tg-omnour screen (603,1280) layers', meta10, 'tile', tile10.size)

# ---------------------------------------------------------------- portrait
if CUTOUT:
    cut = Image.open(CUTOUT).convert('RGBA')
    a = np.asarray(cut)[..., 3]
    top = max(int(np.where(a.max(axis=1) > 8)[0].min()) - 24, 0)
    cut = cut.crop((0, top, cut.width, cut.height))
    print('portrait cropped from y', top, '->', cut.size)
    save_variants(cut, f'{OUT}/public/img', 'yousef-cutout', [960, 640], q=86, alpha=True)

    # red back-light glow (blurred silhouette), padded so the blur is not clipped
    PAD = 160
    al = np.asarray(cut)[..., 3].astype(np.float32) / 255.0
    canvas = np.zeros((al.shape[0] + 2 * PAD, al.shape[1] + 2 * PAD), np.float32)
    canvas[PAD:PAD + al.shape[0], PAD:PAD + al.shape[1]] = al
    g = cv2.GaussianBlur(canvas, (0, 0), 46) * 0.95 + cv2.GaussianBlur(canvas, (0, 0), 16) * 0.45
    # fade the glow out toward the bottom so it never shows through the photo's bottom fade
    hh = canvas.shape[0]
    yy = (np.arange(hh, dtype=np.float32) - PAD) / al.shape[0]
    v = np.clip((0.78 - yy) / (0.78 - 0.40), 0, 1) ** 1.4
    g = np.clip(g * v[:, None], 0, 1)
    glow = np.zeros((g.shape[0], g.shape[1], 4), np.uint8)
    glow[..., 0], glow[..., 1], glow[..., 2] = 255, 34, 12
    glow[..., 3] = (g * 255).astype(np.uint8)
    gi = Image.fromarray(glow, 'RGBA')
    gi = gi.resize((gi.width // 4, gi.height // 4), Image.LANCZOS)   # it is a heavy blur - quarter res is plenty
    gi.save(f'{OUT}/public/img/yousef-glow.webp', 'WEBP', quality=70, method=6)
    gi.save(f'{OUT}/public/img/yousef-glow.png', optimize=True)
    print('glow', gi.size, 'pad ratio x', PAD / cut.width, 'y', PAD / cut.height)

    # shirt / body mask — lets the front "PORTFOLIO" layer pass in front of the shirt only
    # (head, neck and hair stay in front of the letters)
    rgb = np.asarray(cut.convert('RGB')).astype(np.float32) / 255.0
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    a = np.asarray(cut)[..., 3].astype(np.float32) / 255.0
    dark = np.clip((0.40 - lum) / (0.40 - 0.24), 0, 1)
    Hc = a.shape[0]
    yy = np.arange(Hc, dtype=np.float32)[:, None] / Hc
    below = np.clip((yy - 0.50) / 0.03, 0, 1)
    m = (a * dark * below)
    mb = (m > 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mb, 8)
    if n > 1:
        keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        mb = (lab == keep).astype(np.uint8)
    mb = cv2.morphologyEx(mb, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    soft = cv2.GaussianBlur(mb.astype(np.float32), (0, 0), 1.6) * np.clip(a * 1.2, 0, 1)
    mask = np.zeros((Hc, a.shape[1], 4), np.uint8)
    mask[..., 3] = (np.clip(soft, 0, 1) * 255).astype(np.uint8)
    mi = Image.fromarray(mask, 'RGBA').resize((a.shape[1] // 2, Hc // 2), Image.LANCZOS)
    mi.save(f'{OUT}/tools/yousef-body-mask.png', optimize=True)
    print('body mask', mi.size, '-> run tools/trace_mask.py and paste the URI into css/main.css (--shirt-mask)')
