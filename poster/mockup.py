#!/usr/bin/env python3
"""Вклейка готовых постеров в сцены подъезда и лифта.

В каждой сцене (`mockup/scene-*.jpg`) есть пустая белая рама. Скрипт находит
её, вписывает туда настоящий постер из `out/` с перспективой и подмешивает
освещение сцены, чтобы вклейка не выглядела наклейкой.

    python3 mockup.py        # -> mockup/out/*.jpg
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))

# сцена -> постер
PAIRS = [
    ('scene-elevator.jpg',      'loft-a1-01-cherdak.jpg',  'mockup-01-elevator.jpg'),
    ('scene-entrance.jpg',      'loft-a1-02-svet.jpg',     'mockup-02-entrance.jpg'),
    ('scene-lift-lobby.jpg',    'loft-a1-03-loft-law.jpg', 'mockup-03-lift-lobby.jpg'),
]


def find_panel(img):
    """Углы пустой белой рамы: самое крупное светлое малонасыщенное пятно."""
    a = np.asarray(img.convert('RGB'), dtype=np.float32)
    mx, mn = a.max(axis=2), a.min(axis=2)
    bright = mx > 200
    flat = (mx - mn) < 26          # белое, а не цветное (отсекает окна и дерево)
    mask = bright & flat
    mask = ndimage.binary_opening(mask, np.ones((9, 9)))

    lab, n = ndimage.label(mask)
    if n == 0:
        raise SystemExit('белая рама не найдена')
    # самая большая область, не прилипшая к краю кадра (пол и окна отпадают)
    h, w = mask.shape
    best, best_size = None, 0
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if ys.min() == 0 or xs.min() == 0 or ys.max() == h - 1 or xs.max() == w - 1:
            continue
        if ys.size > best_size:
            best, best_size = (ys, xs), ys.size
    if best is None:
        raise SystemExit('белая рама найдена только на краю кадра')

    ys, xs = best
    s, d = xs + ys, xs - ys
    return [
        (float(xs[s.argmin()]), float(ys[s.argmin()])),   # левый верх
        (float(xs[d.argmax()]), float(ys[d.argmax()])),   # правый верх
        (float(xs[s.argmax()]), float(ys[s.argmax()])),   # правый низ
        (float(xs[d.argmin()]), float(ys[d.argmin()])),   # левый низ
    ]


def perspective_coeffs(dst, src):
    """Коэффициенты для PIL: отображают точки приёмника в точки источника."""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    A = np.array(m, dtype=np.float64)
    b = np.array(src, dtype=np.float64).reshape(8)
    return np.linalg.solve(A, b)


def light_map(scene, quad):
    """Карта освещения рамы: куда падает свет, туда ляжет и постер."""
    g = np.asarray(scene.convert('L'), dtype=np.float32)
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    patch = g[int(min(ys)):int(max(ys)), int(min(xs)):int(max(xs))]
    blur = np.asarray(
        Image.fromarray(patch.astype(np.uint8)).filter(ImageFilter.GaussianBlur(28)),
        dtype=np.float32)
    lm = blur / max(blur.mean(), 1.0)
    return np.clip(lm, 0.82, 1.14)


def compose(scene_path, poster_path, out_path):
    scene = Image.open(scene_path).convert('RGB')
    poster = Image.open(poster_path).convert('RGB')
    quad = find_panel(scene)

    # освещение сцены на плоский постер
    lm = light_map(scene, quad)
    x0, y0 = int(min(p[0] for p in quad)), int(min(p[1] for p in quad))
    x1, y1 = int(max(p[0] for p in quad)), int(max(p[1] for p in quad))
    lm_img = Image.fromarray((np.clip(lm, 0, 4) * 64).astype(np.uint8)).resize(poster.size, Image.LANCZOS)
    lit = np.asarray(poster, dtype=np.float32) * (np.asarray(lm_img, dtype=np.float32)[..., None] / 64.0)
    poster = Image.fromarray(np.clip(lit, 0, 255).astype(np.uint8))

    # перспектива: постер -> четырёхугольник рамы
    pw, ph = poster.size
    coeffs = perspective_coeffs(quad, [(0, 0), (pw, 0), (pw, ph), (0, ph)])
    warped = poster.transform(scene.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)

    mask = Image.new('L', scene.size, 0)
    ImageDraw.Draw(mask).polygon(quad, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))

    out = scene.copy()
    out.paste(warped, (0, 0), mask)
    out.save(out_path, 'JPEG', quality=92, subsampling=0)
    print('готово:', os.path.basename(out_path),
          f'(рама {x1 - x0}x{y1 - y0} px)')


if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'mockup', 'out'), exist_ok=True)
    for scene, poster, out in PAIRS:
        compose(os.path.join(HERE, 'mockup', scene),
                os.path.join(HERE, 'out', poster),
                os.path.join(HERE, 'mockup', 'out', out))
