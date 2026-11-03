#!/usr/bin/env python3
"""The local gate: comments, commit subjects and the armed hook.

  python3 scripts/validate.py            # what CI runs
  python3 scripts/validate.py --range main..HEAD

Comment brevity is comment_check.py's job (AGENTS.md); subject length is
commit_check.py's. This script only sequences them and fails on any red.
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def run(name: str, argv: list[str], warn_only: bool = False) -> bool:
    print(f"== {name}")
    r = subprocess.run(argv, cwd=ROOT)
    if r.returncode != 0:
        if warn_only:
            print(f"[validate] WARN: {name} failed (not gating)")
            return True
        print(f"[validate] FAIL: {name}")
        return False
    return True


def last_subject() -> bool:
    try:
        msg = subprocess.run(["git", "log", "-1", "--pretty=%s"], cwd=ROOT,
                             capture_output=True, text=True, check=True).stdout.strip()
    except subprocess.CalledProcessError:
        print("[validate] no commits yet, subject skipped")
        return True
    if len(msg) > 50:
        print(f"[validate] FAIL: last subject is {len(msg)} chars: {msg}")
        return False
    if msg.endswith("."):
        print(f"[validate] FAIL: last subject ends with a period: {msg}")
        return False
    print(f"[validate] last subject ok ({len(msg)}/50): {msg}")
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--range", dest="rev_range", metavar="REV",
                    help="audit subjects in a git range instead of the last one")
    args = ap.parse_args()
    py = sys.executable or "python3"
    ok = run("comments", [py, "scripts/comment_check.py"])
    if args.rev_range:
        ok &= run("subjects", [py, "scripts/commit_check.py", "--range", args.rev_range])
    else:
        ok &= last_subject()
    ok &= run("commit gate status", [py, "scripts/commit_check.py", "--status"],
              warn_only=True)
    ok &= run("comment checker self-test", [py, "scripts/comment_check.py", "--self-test"])
    print("[validate] all checks passed" if ok else "[validate] checks failed")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
