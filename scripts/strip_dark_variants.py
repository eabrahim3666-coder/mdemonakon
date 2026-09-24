#!/usr/bin/env python3
"""strip_dark_variants.py — remove every class token starting with "dark:"
from the given files. The site is hard-locked to the light theme; dark:
variants are dead code that could activate if Tailwind's default dark
variant (prefers-color-scheme) ever kicks in. Double spaces left inside
class strings are harmless and are NOT collapsed (safer diff)."""

import re
import sys

TOKEN = re.compile(r"\s?dark:[^\s'\"`]+")

for path in sys.argv[1:]:
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    n = len(TOKEN.findall(src))
    out = TOKEN.sub("", src)
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"{path}: stripped {n} dark: tokens")
