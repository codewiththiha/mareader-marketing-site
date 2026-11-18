#!/usr/bin/env python3
"""Subset the bundled fonts to the characters this site actually sets."""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / "src" / "assets" / "fonts"
CJK = ((0x2E80, 0x9FFF), (0x3000, 0x303F), (0xF900, 0xFAFF), (0xFE30, 0xFE4F), (0xFF00, 0xFFEF))

BASE = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "".join(chr(c) for c in range(0xA0, 0x180))
    + "–—‘’“”•…›‹±×÷°©®™‰§¶†‡«»¡¿€£¥¢µºª¹²³¼½¾⇄⌘"
)


def sources() -> set[str]:
    chars: set[str] = set(BASE)
    for path in (ROOT / "src").rglob("*"):
        if path.suffix in {".svelte", ".ts", ".css", ".html"} and path.is_file():
            chars |= set(path.read_text(encoding="utf-8"))
    return chars


def cjk_only(chars: set[str]) -> set[str]:
    return {c for c in chars if any(a <= ord(c) <= b for a, b in CJK)}


def punct(chars: set[str]) -> set[str]:
    return {c for c in chars if 0x2000 <= ord(c) <= 0x206F}


def run(src: pathlib.Path, dst: pathlib.Path, chars: set[str]) -> tuple[int, int]:
    before = src.stat().st_size
    text = "".join(sorted(chars))
    subprocess.run(
        [
            sys.executable, "-m", "fontTools.subset", str(src),
            f"--text={text}",
            "--flavor=woff2",
            "--layout-features=kern,liga,clig,calt,ccmp,mark,mkmk,locl,ss01,cv01,tnum",
            f"--output-file={dst}",
            "--drop-tables+=DSIG",
            "--no-hinting",
        ],
        check=True,
        capture_output=True,
    )
    return before, dst.stat().st_size


def main() -> int:
    chars = sources()
    wide = chars - cjk_only(chars)
    total_before = total_after = 0
    for path in sorted(FONTS.glob("*.woff2")):
        pick = cjk_only(chars) | punct(chars) if path.name.startswith("Noto") else wide
        before, after = run(path, path, pick)
        total_before += before
        total_after += after
        print(f"{path.name:24} {before // 1024:5} KB -> {after // 1024:4} KB")
    print(f"{'total':24} {total_before // 1024:5} KB -> {total_after // 1024:4} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
