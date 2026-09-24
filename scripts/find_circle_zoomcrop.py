#!/usr/bin/env python3
"""Locate the white ring/lens circle in video frames + zoom-crop around it
to check whether a native OS arrow cursor is visible near it."""
from PIL import Image
import os

UPLOAD = "/home/z/my-project/upload"
OUT = "/home/z/my-project/scripts"

def find_bright_cluster(img, thresh=200):
    """Find bounding box of bright (near-white) pixels — the ring/lens."""
    w, h = img.size
    px = img.convert("RGB")
    # Downscale scan: use numpy-free stride scan for speed on 1920x902
    data = px.load()
    minx, miny, maxx, maxy = w, h, -1, -1
    count = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b = data[x, y]
            if r > thresh and g > thresh and b > thresh:
                count += 1
                if x < minx: minx = x
                if x > maxx: maxx = x
                if y < miny: miny = y
                if y > maxy: maxy = y
    if maxx < 0:
        return None
    return (minx, miny, maxx, maxy, count)

for name in ["frame_01", "frame_02", "frame_03", "frame_05", "frame_06", "frame_07", "frame_08"]:
    path = os.path.join(UPLOAD, f"{name}.png")
    img = Image.open(path)
    res = find_bright_cluster(img)
    if not res:
        print(f"{name}: no bright cluster")
        continue
    minx, miny, maxx, maxy, count = res
    cx, cy = (minx + maxx) // 2, (miny + maxy) // 2
    bw, bh = maxx - minx, maxy - miny
    print(f"{name}: cluster bbox=({minx},{miny})-({maxx},{maxy}) size={bw}x{bh} center=({cx},{cy}) px={count}")
    # Crop a generous region around the cluster, upscale 3x for VLM
    pad = 120
    box = (max(0, minx - pad), max(0, miny - pad), min(img.width, maxx + pad), min(img.height, maxy + pad))
    crop = img.crop(box)
    crop = crop.resize((crop.width * 3, crop.height * 3), Image.LANCZOS)
    crop.save(os.path.join(OUT, f"zc_{name}.png"))
    print(f"   saved zoom-crop scripts/zc_{name}.png ({crop.width}x{crop.height})")
