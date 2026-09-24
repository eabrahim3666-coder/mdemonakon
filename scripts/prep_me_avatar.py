#!/usr/bin/env python3
"""prep_me_avatar.py — prep the user's suit portrait for the Me card.

The source is already a clean transparent cutout (bust in navy suit).
This trims excess transparent margins and adds a soft bottom fade so
the suit dissolves elegantly inside the arch-shaped frame.
"""

import numpy as np
from PIL import Image, ImageFilter

SRC = "/home/z/my-project/upload/emon_me_source"
DST = "/home/z/my-project/public/avatar-me.png"

im = Image.open(SRC).convert("RGBA")
arr = np.array(im)
alpha = arr[:, :, 3]

# 1) Trim transparent margins (keep 6px breathing room)
ys, xs = np.where(alpha > 24)
pad = 6
x0, x1 = max(0, xs.min() - pad), min(im.width - 1, xs.max() + pad)
y0, y1 = max(0, ys.min() - pad), min(im.height - 1, ys.max() + pad)
im = im.crop((x0, y0, x1 + 1, y1 + 1))
arr = np.array(im)
print(f"trimmed: {im.size}")

# 2) Feather edges slightly (smooth any hard cutout jaggies)
a_img = Image.fromarray(arr[:, :, 3], "L").filter(ImageFilter.GaussianBlur(0.6))
arr[:, :, 3] = np.array(a_img)

# 3) Gentle bottom fade (last 7% dissolves — elegant inside the frame)
h = arr.shape[0]
fade_rows = max(4, int(h * 0.07))
ramp = np.linspace(1.0, 0.0, fade_rows).astype(np.float32)
arr[-fade_rows:, :, 3] = (arr[-fade_rows:, :, 3].astype(np.float32) * ramp[:, None]).astype(np.uint8)

out = Image.fromarray(arr, "RGBA")
out.save(DST, "PNG")
print(f"saved → {DST} ({out.width}x{out.height})")
