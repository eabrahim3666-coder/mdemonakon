#!/usr/bin/env python3
"""
remove_bg.py — Avatar background removal pipeline.

Takes a photo, removes the background (U2Net human-portrait segmentation
via rembg), cleans the alpha matte, crops to the subject, and saves a
transparent PNG sized for the portfolio avatar slots.

Usage:
    python3 scripts/remove_bg.py <input_image> <output_png> [--preview <preview_png>]

Pipeline:
  1. rembg (u2net_human_seg) → coarse alpha matte
  2. Alpha cleanup: threshold + morphological smooth + feathered edges
  3. Alpha-guided crop to the face/bust with padding (square-ish)
  4. Trim to content bbox, keep aspect, export RGBA PNG
"""

import sys
import argparse
import numpy as np
from PIL import Image, ImageFilter

try:
    from rembg import remove, new_session
    HAS_REMBG = True
except ImportError:
    HAS_REMBG = False


def alpha_cleanup(alpha: np.ndarray) -> np.ndarray:
    """Smooth the raw matte: kill speckle, soften edges, keep strong cores."""
    a = alpha.astype(np.float32) / 255.0

    # 1) Kill weak noise: below 12% → 0
    a = np.where(a < 0.12, 0.0, a)

    # 2) Solidify confident areas: above 60% → 1
    a = np.where(a > 0.60, 1.0, a)

    # 3) Feather band in between stays linear (soft hair edges)
    return a


def fade_bottom(alpha: np.ndarray, fade_frac: float = 0.10) -> np.ndarray:
    """Feather the bottom edge of the matte so the torso dissolves into
    transparency instead of ending in a hard rectangular photo cut —
    the classic 'floating bust' avatar treatment."""
    h = alpha.shape[0]
    fade_rows = max(4, int(h * fade_frac))
    ramp = np.linspace(1.0, 0.0, fade_rows).astype(np.float32)  # 1→0
    alpha[-fade_rows:, :] *= ramp[:, None]
    return alpha


def crop_with_subject(
    img: Image.Image, alpha: np.ndarray, pad_frac: float = 0.06
) -> Image.Image:
    """Crop to the subject bbox (alpha > 0.25) plus a small padding margin."""
    ys, xs = np.where(alpha > 0.25)
    if len(xs) == 0:
        return img  # nothing detected — return uncropped

    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    w, h = x1 - x0 + 1, y1 - y0 + 1

    pad_x = max(2, int(w * pad_frac))
    pad_y = max(2, int(h * pad_frac))
    x0 = max(0, x0 - pad_x)
    y0 = max(0, y0 - pad_y)
    x1 = min(img.width - 1, x1 + pad_x)
    y1 = min(img.height - 1, y1 + pad_y)

    return img.crop((x0, y0, x1 + 1, y1 + 1))


def process(input_path: str, output_path: str, preview_path: str | None = None):
    src = Image.open(input_path).convert("RGBA")
    print(f"[1/4] Loaded {input_path}: {src.width}x{src.height}")

    if HAS_REMBG:
        print("[2/4] Segmenting with rembg (u2net_human_seg)…")
        session = new_session("u2net_human_seg")
        cut = remove(src, session=session, post_process_mask=True)
    else:
        raise SystemExit("rembg is required (pip install rembg onnxruntime)")

    # rembg returns RGBA with the matte already applied
    arr = np.array(cut)
    alpha = arr[:, :, 3]

    print("[3/4] Cleaning alpha matte…")
    alpha_f = alpha_cleanup(alpha)

    # Slight blur on the alpha for feathered edges (hair-friendly)
    a_img = Image.fromarray((alpha_f * 255).astype(np.uint8), "L")
    a_img = a_img.filter(ImageFilter.GaussianBlur(0.8))
    alpha_final = np.array(a_img).astype(np.float32) / 255.0

    # Bottom fade-out — dissolve the hard photo cut for a floating bust.
    # NOTE: crop on the PRE-fade matte so the fade ramp survives the crop.
    alpha_for_crop = alpha_final
    alpha_faded = fade_bottom(alpha_final)

    out_arr = arr.copy()
    out_arr[:, :, 3] = (alpha_faded * 255).astype(np.uint8)

    # Crop to subject
    print("[4/4] Cropping to subject + saving…")
    out = Image.fromarray(out_arr, "RGBA")
    out = crop_with_subject(out, alpha_for_crop)

    # Downscale if huge (avatar slots render at <= ~576 logical px; 1000px
    # covers 2x DPR everywhere while keeping the PNG light)
    max_side = 1000
    if max(out.size) > max_side:
        ratio = max_side / max(out.size)
        out = out.resize((int(out.width * ratio), int(out.height * ratio)), Image.LANCZOS)

    out.save(output_path, "PNG")
    print(f"Saved → {output_path} ({out.width}x{out.height})")

    # Optional checkerboard preview to eyeball the transparency
    if preview_path:
        size = (600, int(600 * out.height / out.width))
        fg = out.resize(size, Image.LANCZOS)

        # checkerboard
        block = 25
        prev = Image.new("RGB", size, (255, 255, 255))
        px = prev.load()
        for y in range(size[1]):
            for x in range(size[0]):
                if ((x // block) + (y // block)) % 2 == 0:
                    px[x, y] = (230, 230, 230)
        prev.paste(fg, (0, 0), fg)
        prev.save(preview_path, "PNG")
        print(f"Preview → {preview_path}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--preview", default=None)
    args = ap.parse_args()
    process(args.input, args.output, args.preview)
