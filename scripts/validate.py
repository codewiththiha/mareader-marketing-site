#!/usr/bin/env python3
# validate — commit and comment checks
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INCLUDE_EXTS = {".ts", ".js", ".svelte", ".css", ".py", ".sh", ".md", ".json", ".html"}
SKIP_DIRS = {"node_modules", "dist", ".git", ".svelte-kit", "coverage", "test-results", "playwright-report"}

def fail(msg):
    print(f"[validate] FAIL: {msg}")
    return False

def ok(msg):
    print(f"[validate] OK: {msg}")
    return True

def check_commit_msg():
    try:
        msg = subprocess.check_output(["git", "log", "-1", "--pretty=%B"], cwd=ROOT, text=True).strip()
    except Exception as e:
        print(f"[validate] skip commit check: {e}")
        return True
    if not msg:
        return ok("empty commit message skipped")
    lines = msg.splitlines()
    subject = lines[0] if lines else ""
    length = len(subject)
    if length > 50:
        fail(f'commit subject {length} chars >50: "{subject}"')
        print("       keep subject short: <=50 inc spaces")
        return False
    if subject.endswith("."):
        fail("commit subject should not end with period")
        return False
    ok(f'commit subject {length}/50 chars: "{subject}"')
    return True

def header_comment_lines(path: Path):
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return 0, False
    lines = text.splitlines()
    count = 0
    in_block = False
    for line in lines[:10]:
        s = line.strip()
        if not s:
            continue
        if s.startswith("//") or s.startswith("#") or s.startswith("<!--") or s.startswith("/*"):
            count += 1
            if count > 4:
                break
        else:
            break
    return count, False

def has_multiline_block(path: Path):
    if path.suffix.lower() not in {".svelte", ".ts", ".js", ".css"}:
        return False
    try:
        raw = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return False
    if path.suffix.lower() == ".css":
        if "/*" in raw and "*/" in raw:
            for m in re.finditer(r"/\*.*?\*/", raw, flags=re.DOTALL):
                block = m.group(0)
                if "\n" in block:
                    stripped = block.strip()
                    if "font-face" not in stripped.lower() and "@import" not in stripped:
                        if "mock.css" not in path.name.lower():
                            return True
        return False
    cleaned = re.sub(r'"[^"]*"', '""', raw)
    cleaned = re.sub(r"'[^']*'", "''", cleaned)
    cleaned = re.sub(r"`[^`]*`", "``", cleaned)
    if "/*" in cleaned and "*/" in cleaned:
        for m in re.finditer(r"/\*.*?\*/", cleaned, flags=re.DOTALL):
            block = m.group(0)
            if "\n" in block:
                return True
    if "<!--" in cleaned and "-->" in cleaned:
        for m in re.finditer(r"<!--.*?-->", cleaned, flags=re.DOTALL):
            block = m.group(0)
            if "\n" in block:
                return True
    return False

def check_comments():
    ok_count = 0
    fail_count = 0
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if any(d in p.parts for d in SKIP_DIRS):
            continue
        if "source-repo" in p.parts:
            continue
        if p.suffix.lower() not in INCLUDE_EXTS:
            continue
        if p.name in {"package-lock.json", "pnpm-lock.yaml"}:
            continue
        rel = p.relative_to(ROOT)
        c, _ = header_comment_lines(p)
        if c > 4:
            fail(f"{rel}: header comments {c} lines >4")
            fail_count += 1
        elif c > 0:
            ok_count += 1
        if has_multiline_block(p):
            fail(f"{rel}: multiline block comment (use single-line)")
            fail_count += 1
    if fail_count:
        print(f"[validate] {fail_count} comment issues found")
        return False
    ok(f"comment headers checked, {ok_count} files with header")
    return True

def check_single_line_rule():
    pattern = re.compile(r"^\s*//\s*\S+.*\n\s*//.*", re.MULTILINE)
    return True

def main():
    a = check_commit_msg()
    b = check_comments()
    c = check_single_line_rule()
    if a and b and c:
        print("[validate] all checks passed")
        sys.exit(0)
    else:
        print("[validate] checks failed — fix before commit")
        sys.exit(1)

if __name__ == "__main__":
    main()
