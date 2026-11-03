#!/usr/bin/env python3
"""Compare regenerated lens WebPs against the committed ones, with tolerance."""
import glob
import os
import sys

import numpy as np
from PIL import Image

MAX_MEAN = 0.6
MAX_BAD_PCT = 0.5


def main() -> int:
    base, new = sys.argv[1], sys.argv[2]
    fails = 0
    names = sorted(os.path.basename(f) for f in glob.glob(os.path.join(base, "*.webp")))
    if not names:
        print("compare-blur: no baseline webp found")
        return 1
    for n in names:
        bp, np_ = os.path.join(base, n), os.path.join(new, n)
        if not os.path.exists(np_):
            print(f"{n}: MISSING in {new}")
            fails += 1
            continue
        a = np.asarray(Image.open(bp).convert("RGBA"), np.float32)
        b = np.asarray(Image.open(np_).convert("RGBA"), np.float32)
        if a.shape != b.shape:
            print(f"{n}: shape {a.shape} vs {b.shape}")
            fails += 1
            continue
        d = np.abs(a - b)
        mean = float(d.mean())
        bad = float((d.max(axis=2) > 8).mean() * 100)
        ok = mean <= MAX_MEAN and bad <= MAX_BAD_PCT
        if not ok:
            fails += 1
        print(f"{n}: mean {mean:.3f}, bad {bad:.3f}% {'pass' if ok else 'FAIL'}")
    print("compare-blur: ok" if not fails else f"compare-blur: {fails} fail(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
