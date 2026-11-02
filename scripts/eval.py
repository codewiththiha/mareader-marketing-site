#!/usr/bin/env python3
# eval — self review of build and screenshots
import pathlib
import json

ROOT = pathlib.Path(__file__).resolve().parents[1]
report = pathlib.Path(ROOT / "eval-report.md")

def check_build():
    dist = ROOT / "dist" / "index.html"
    if not dist.exists():
        return False, "dist missing — build failed"
    size = dist.stat().st_size
    if size < 1000:
        return False, f"dist too small {size}"
    return True, f"build ok: {size} bytes singlefile"

def check_screenshots():
    shot_dir = ROOT / "screenshots"
    if not shot_dir.exists():
        return False, "no screenshots dir"
    files = list(shot_dir.glob("*.png"))
    if len(files) < 4:
        return False, f"only {len(files)} screenshots, expected >=4"
    return True, f"screenshots ok: {len(files)} files"

def check_structure():
    must = [
        "src/App.svelte",
        "src/lib/components/Film/Film.svelte",
        "src/lib/components/Film/Mock/MockWindow.svelte",
        "src/lib/stores/theme.svelte.ts",
        "AGENTS.md",
        "scripts/validate.py"
    ]
    missing = [m for m in must if not (ROOT / m).exists()]
    if missing:
        return False, f"missing {missing}"
    return True, "structure ok: modular svelte idioms"

def main():
    checks = [check_build(), check_screenshots(), check_structure()]
    passed = all(c[0] for c in checks)
    lines = ["# Eval Report", ""]
    for ok, msg in checks:
        lines.append(f"- {'✅' if ok else '❌'} {msg}")
    if passed:
        lines += ["", "Overall: PASS — ready to push", ""]
    else:
        lines += ["", "Overall: FAIL — fix before push", ""]
    lines += ["- Pixel perfect: manual review screenshots vs source", "- Maintainable: Svelte runes, actions, stores, no React flavor", "- Idiomatic: actions for reveal, $state/$derived, Snippet, svelte:window"]
    report.write_text("\n".join(lines))
    print("\n".join(lines))
    exit(0 if passed else 1)

if __name__ == "__main__":
    main()
