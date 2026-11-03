#!/usr/bin/env python3
"""Policy guard: commit subjects <=50 chars, comments one line, headers <=4."""
import json
import re
import subprocess
import sys
from pathlib import Path

MAX_SUBJECT = 50
MAX_HEADER = 4
MIN_DUP = 12

SRC_EXT = {".ts", ".js", ".mjs", ".cjs", ".svelte", ".css", ".py", ".yml", ".yaml", ".html"}
SKIP_DIRS = {"node_modules", "dist", ".git", ".shots", ".visual-diff", "baselines", "blur", "assets", "__pycache__"}
QUOTES = {'"', "'", "`"}


def repo_root() -> Path:
    out = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True)
    return Path(out.stdout.strip())


def lang_of(path: Path) -> str:
    if path.suffix == ".css":
        return "css"
    if path.suffix in {".yml", ".yaml"}:
        return "yaml"
    if path.suffix == ".py":
        return "hash"
    if path.suffix in {".html", ".svelte"}:
        return "mixed"
    return "slash"


def doc_open(s: str) -> str | None:
    for q in ('"""', "'''"):
        if s.startswith(q) and not s.endswith(q) or (s.startswith(q) and len(s) > 3 and s.count(q) == 1):
            return q
    return None


def block_open(s: str, lang: str) -> str | None:
    if lang in {"css", "mixed", "slash"} and s.startswith("/*") and "*/" not in s[2:]:
        return "*/"
    if lang == "mixed" and s.startswith("<!--") and "-->" not in s[4:]:
        return "-->"
    if lang == "hash":
        return doc_open(s)
    return None


def full_line_text(s: str, lang: str) -> str | None:
    if lang in {"hash", "yaml", "mixed"} and s.startswith("#") and not s.startswith("#!"):
        return s[1:].strip()
    if lang != "hash" and s.startswith("//"):
        return s[2:].strip()
    if lang in {"css", "mixed", "slash"} and s.startswith("/*") and s.endswith("*/") and len(s) > 4 and "*/" not in s[2:-2]:
        return s[2:-2].strip()
    if lang == "mixed" and s.startswith("<!--") and s.endswith("-->") and len(s) > 7:
        return s[4:-3].strip()
    if lang == "hash":
        for q in ('"""', "'''"):
            if s.startswith(q) and s.endswith(q) and len(s) > 6 and s.count(q) == 2:
                return s[3:-3].strip()
    return None


def comment_index(s: str, lang: str) -> int:
    quote = None
    i = 0
    while i < len(s):
        c = s[i]
        if quote:
            if c == "\\" and quote != "'":
                i += 2
                continue
            if c == quote:
                quote = None
        elif c in QUOTES:
            quote = c
        elif s.startswith("//", i) and lang != "hash":
            return i
        elif c == "#" and lang in {"hash", "yaml", "mixed"} and (i == 0 or s[i - 1] in " \t"):
            return i
        i += 1
    return -1


def trailing_text(s: str, lang: str) -> str | None:
    if full_line_text(s, lang) is not None or block_open(s, lang):
        return None
    i = comment_index(s, lang)
    return s[i + 2 :].strip() if i >= 0 else None


def scan_file(path: Path):
    lines = path.read_text(encoding="utf8", errors="replace").splitlines()
    lang = lang_of(path)
    problems: list[tuple[int, str]] = []
    fulls: list[tuple[int, str]] = []
    allc: list[str] = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if i == 0 and s.startswith("#!"):
            i += 1
            continue
        end = block_open(s, lang)
        if end:
            start = i + 1
            j = i + 1
            while j < len(lines) and end not in lines[j]:
                j += 1
            if j >= len(lines):
                problems.append((start, "unterminated block comment"))
                break
            problems.append((start, "block comment spans lines; keep it to one line"))
            i = j + 1
            continue
        fc = full_line_text(s, lang)
        if fc is not None:
            fulls.append((i + 1, fc))
            allc.append(fc)
            i += 1
            continue
        tc = trailing_text(s, lang) if s else None
        if tc:
            allc.append(tc)
        i += 1
    start_ln = 2 if lines and lines[0].startswith("#!") else 1
    run = 0
    for ln, _ in fulls:
        if ln == start_ln + run:
            run += 1
        else:
            break
    if run > MAX_HEADER:
        problems.append((1, f"file header comment is {run} lines; max {MAX_HEADER}"))
    head_end = start_ln + run - 1
    for (a, _), (b, _) in zip(fulls, fulls[1:]):
        if b == a + 1 and a > head_end:
            problems.append((b, "consecutive one-line comments form a paragraph; one line per comment"))
    return problems, allc


def check_comments(root: Path) -> int:
    fails = 0
    seen: dict[str, list[str]] = {}
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix not in SRC_EXT:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        problems, comments = scan_file(path)
        rel = str(path.relative_to(root))
        for ln, msg in problems:
            print(f"{rel}:{ln}: {msg}")
            fails += 1
        for t in comments:
            key = re.sub(r"\s+", " ", t).strip().lower()
            if len(key) >= MIN_DUP:
                seen.setdefault(key, []).append(rel)
    for key, where in sorted(seen.items()):
        if len(where) > 1:
            print(f"duplicate comment in {', '.join(where)}: {key!r}")
            fails += 1
    return fails


def check_subject(subject: str) -> str | None:
    if not subject.strip():
        return "commit subject is empty"
    if len(subject) > MAX_SUBJECT:
        return f"commit subject is {len(subject)} chars (incl. spaces); max {MAX_SUBJECT}"
    return None


def cmd_commit_msg(arg: str) -> int:
    body = Path(arg).read_text(encoding="utf8")
    err = check_subject(body.splitlines()[0] if body.strip() else "")
    if err:
        print(f"guard: {err}")
        return 1
    return 0


def cmd_commits(spec: str | None) -> int:
    root = repo_root()
    out = subprocess.run(["git", "-C", str(root), "log", "--format=%H%x09%s", spec or "--max-count=100"], capture_output=True, text=True)
    fails = 0
    for line in out.stdout.splitlines():
        sha, _, subject = line.partition("\t")
        err = check_subject(subject)
        if err:
            print(f"guard: {err}: {sha[:10]}")
            fails += 1
    return 1 if fails else 0


def cmd_event(path: str) -> int:
    data = json.loads(Path(path).read_text(encoding="utf8"))
    fails = 0
    for commit in data.get("commits", []):
        subject = commit.get("message", "").splitlines()[0] if commit.get("message") else ""
        err = check_subject(subject)
        if err:
            print(f"guard: {err}: {commit.get('id', '')[:10]}")
            fails += 1
    return 1 if fails else 0


def main() -> int:
    args = sys.argv[1:] or ["repo"]
    mode, rest = args[0], args[1:]
    if mode == "commit-msg":
        return cmd_commit_msg(rest[0])
    if mode == "comments":
        fails = check_comments(Path(rest[0]) if rest else repo_root())
        print("guard: comments ok" if not fails else f"guard: {fails} comment problem(s)")
        return 1 if fails else 0
    if mode == "commits":
        if rest and rest[0].startswith("{"):
            return cmd_event(rest[0])
        return cmd_commits(rest[0] if rest else None)
    if mode == "repo":
        fails = check_comments(repo_root()) + cmd_commits(None)
        print("guard: repo ok" if not fails else f"guard: {fails} problem(s)")
        return 1 if fails else 0
    print(f"guard: unknown mode {mode}")
    return 2


if __name__ == "__main__":
    sys.exit(main())
