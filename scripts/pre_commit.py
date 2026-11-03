#!/usr/bin/env python3
"""The pre-commit gate: comment rules and formatting on the staged files.

Wired by hand into .git/hooks/pre-commit (AGENTS.md keeps the one-liner);
git skips a hook it cannot execute, so the mode is part of the install.

  python3 scripts/pre_commit.py            # what the hook runs
  python3 scripts/pre_commit.py --all      # every tracked file, not just staged
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
COMMENT_EXTS = {".ts", ".js", ".mjs", ".cjs", ".svelte", ".css", ".py", ".sh", ".yml",
                ".html"}
# prettier parses these only; .py/.sh stay comment-checked, never formatted
FORMAT_EXTS = {".ts", ".js", ".mjs", ".cjs", ".svelte", ".css", ".html", ".yml",
               ".json", ".md"}
NEVER_FORMAT = {"src/lib/releases/data.ts", "package-lock.json"}


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True,
                          check=True).stdout


def staged_files() -> list[str]:
    out = git("diff", "--cached", "--name-only", "--diff-filter=ACMR")
    return [p for p in out.splitlines() if p.strip()]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--all", action="store_true", help="check every tracked file")
    args = ap.parse_args()
    if args.all:
        files = [p for p in git("ls-files").splitlines() if p.strip()]
    else:
        files = staged_files()
    if not files:
        print("[pre-commit] nothing staged")
        return 0
    py = sys.executable or "python3"
    comment_targets = [f for f in files
                       if pathlib.Path(f).suffix in COMMENT_EXTS
                       and (ROOT / f).exists()]
    ok = True
    if comment_targets:
        r = subprocess.run([py, "scripts/comment_check.py", *comment_targets], cwd=ROOT)
        if r.returncode != 0:
            print("[pre-commit] FAIL: comment rules")
            ok = False
    format_targets = [f for f in files
                      if pathlib.Path(f).suffix in FORMAT_EXTS
                      and f not in NEVER_FORMAT
                      and (ROOT / f).exists()]
    if format_targets:
        r = subprocess.run(["npx", "prettier", "--check", *format_targets], cwd=ROOT)
        if r.returncode != 0:
            print("[pre-commit] FAIL: prettier — run `npm run format`")
            ok = False
    print("[pre-commit] staged files pass" if ok else "[pre-commit] commit refused")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
