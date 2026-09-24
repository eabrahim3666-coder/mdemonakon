#!/usr/bin/env python3
"""Frame-diff consecutive frames to locate the moving cursor/circle,
then zoom-crop around it to inspect the native arrow cursor."""
from PIL import Image, ImageChops
import os

UPLOAD = "/home/z/my-project/upload"
OUT = "/home/z/my-project/scripts"

frames = [f"frame_{i:02d}" for i in range(1, 13)]

def diff_cluster(a_path, b_path, thresh=18):
    a = Image.open(a_path).convert("RGB")
    b = Image.open(b_path).convert("RGB")
    diff = ImageChops.difference(a, b)
    data = diff.load()
    w, h = diff.size
    # collect diff pixel coords
    pts = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, bl = data[x, y]
            if r > thresh or g > thresh or bl > thresh:
                pts.append((x, y))
    if not pts:
        return None
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    # trim outliers: use 5th-95th percentile cluster
    xs.sort(); ys.sort()
    n = len(pts)
    x_lo, x_hi = xs[int(n*0.02)], xs[int(n*0.98)]
    y_lo, y_hi = ys[int(n*0.02)], ys[int(n*0.98)]
    # cluster center
    cx = (x_lo + x_hi) / 2; cy = (y_lo + y_hi) / 2
    return (x_lo, y_lo, x_hi, y_hi, cx, cy, n)

results = {}
for i in range(len(frames)-1):
    a = os.path.join(UPLOAD, frames[i] + ".png")
    b = os.path.join(UPLOAD, frames[i+1] + ".png")
    r = diff_cluster(a, b)
    if r:
        x_lo, y_lo, x_hi, y_hi, cx, cy, n = r
        results[frames[i+1]] = (cx, cy)
        print(f"{frames[i]}->{frames[i+1]}: diff cluster center=({cx:.0f},{cy:.0f}) span=({x_hi-x_lo}x{y_hi-y_lo}) n={n}")

# Zoom-crop around cluster centers for selected frames
for name in ["frame_02", "frame_05", "frame_06", "frame_07", "frame_08"]:
    if name not in results:
        continue
    cx, cy = results[name]
    img = Image.open(os.path.join(UPLOAD, name + ".png")).convert("RGB")
    pad = 130
    box = (max(0, int(cx-pad)), max(0, int(cy-pad)), min(img.width, int(cx+pad)), min(img.height, int(cy+pad)))
    crop = img.crop(box)
    crop = crop.resize((crop.width*3, crop.height*3), Image.LANCZOS)
    crop.save(os.path.join(OUT, f"zc_{name}.png"))
    print(f"saved scripts/zc_{name}.png  (center {cx:.0f},{cy:.0f})")
