#!/usr/bin/env python3
# Enforces the comment policy: one-line comments, header block only.
# Header block = consecutive comment lines starting at line 1, max 4 lines.
# Usage: python3 tools/check_comments.py <path> [<path> ...]
import sys
from pathlib import Path

SKIP_SUFFIX = (".md", ".json", ".png", ".svg", ".ico", ".lock", ".txt", ".yml.diff")
SKIP_DIRS = {"node_modules", "dist", ".git", ".svelte-kit", "baseline", "shots"}
HEADER_MAX = 4

class Violation(Exception):
    pass

def lex_js(text, comments):
    i, n, line = 0, len(text), 1
    while i < n:
        c = text[i]
        if c == "\n":
            line += 1
            i += 1
        elif c == "/" and i + 1 < n and text[i + 1] == "/":
            end = text.find("\n", i)
            end = n if end < 0 else end
            comments.append((line, text[i:end].strip(), line))
            i, line = end, line
        elif c == "/" and i + 1 < n and text[i + 1] == "*":
            end = text.find("*/", i + 2)
            end_line = line + text.count("\n", i, end if end >= 0 else n)
            comments.append((line, text[i:end if end >= 0 else n].strip(), end_line))
            if end < 0:
                return
            i, line = end + 2, end_line
        elif c in "'\"`":
            i, line = skip_string(text, i, line)
        else:
            i += 1
    return line

def skip_string(text, i, line):
    quote = text[i]
    triple = text.startswith(quote * 3, i)
    if triple and quote == "`":
        triple = False
    i += 3 if triple else 1
    n = len(text)
    depth = 0
    while i < n:
        c = text[i]
        if c == "\n":
            line += 1
            if triple:
                i += 1
                continue
            return i, line
        if c == "\\":
            i += 2
            continue
        if quote == "`":
            if c == "$" and i + 1 < n and text[i + 1] == "{":
                depth += 1
                i += 2
                continue
            if c == "}" and depth:
                depth -= 1
                i += 1
                continue
            if depth:
                i += 1
                continue
        if c == quote:
            if triple and not text.startswith(quote * 3, i):
                i += 1
                continue
            return i + (3 if triple else 1), line
        i += 1
    return i, line

def lex_hash(text, comments):
    line = 1
    for raw in text.split("\n"):
        i, n = 0, len(raw)
        while i < n:
            c = raw[i]
            if c in "'\"":
                i = skip_string(raw, i, 0)[0]
                continue
            if c == "#":
                comments.append((line, raw[i:].strip(), line))
                break
            i += 1
        line += 1

def lex_css(text, comments):
    i, n, line = 0, len(text), 1
    while i < n:
        c = text[i]
        if c == "\n":
            line += 1
            i += 1
        elif c == "/" and i + 1 < n and text[i + 1] == "*":
            end = text.find("*/", i + 2)
            end_line = line + text.count("\n", i, end if end >= 0 else n)
            comments.append((line, text[i:end if end >= 0 else n].strip(), end_line))
            if end < 0:
                return
            i, line = end + 2, end_line
        elif c in "'\"":
            i, line = skip_string(text, i, line)
        else:
            i += 1

def lex_html(text, comments):
    line = 1
    for raw in text.split("\n"):
        start = 0
        while True:
            at = raw.find("<!--", start)
            if at < 0:
                break
            end = raw.find("-->", at)
            comments.append((line, raw[at:end if end >= 0 else len(raw)].strip(), line))
            if end < 0:
                break
            start = end + 3
        line += 1

def lex_svelte(text, comments):
    lines = text.split("\n")
    mode, buf, start = "markup", [], 1
    for idx, raw in enumerate(lines, 1):
        low = raw.lower()
        if mode == "markup":
            lex_html(raw, comments)
            if "<script" in low:
                mode, start = "js", idx
            elif "<style" in low:
                mode, start = "css", idx
        elif mode == "js":
            buf.append(raw)
            if "</script" in low:
                sub = []
                lex_js("\n".join(buf), sub)
                comments.extend((start + ln - 1, t, start + en - 1) for ln, t, en in sub)
                buf, mode = [], "markup"
        else:
            buf.append(raw)
            if "</style" in low:
                sub = []
                lex_css("\n".join(buf), sub)
                comments.extend((start + ln - 1, t, start + en - 1) for ln, t, en in sub)
                buf, mode = [], "markup"
    if buf:
        sub = []
        (lex_js if mode == "js" else lex_css)("\n".join(buf), sub)
        comments.extend((start + ln - 1, t, start + en - 1) for ln, t, en in sub)

def check_file(path):
    text = path.read_text(encoding="utf-8")
    comments = []
    suffix = path.suffix
    if suffix in (".js", ".ts", ".mjs", ".cjs"):
        lex_js(text, comments)
    elif suffix == ".svelte":
        lex_svelte(text, comments)
    elif suffix == ".css":
        lex_css(text, comments)
    elif suffix in (".py",):
        lex_hash(text, comments)
    elif suffix in (".yml", ".yaml", ".sh"):
        lex_hash(text, comments)
    elif suffix == ".html":
        lex_html(text, comments)
    else:
        return []
    problems = []
    for start, body, end in comments:
        if end > start:
            problems.append(f"{path}:{start}: comment spans {end - start + 1} lines")
    header_lines = 0
    lines = text.split("\n")
    first = next((i for i, raw in enumerate(lines) if raw.strip()), 0)
    if first == 0:
        for ln in range(1, len(lines) + 1):
            stripped = lines[ln - 1].strip()
            if not stripped:
                if header_lines:
                    break
                continue
            if stripped.startswith(("//", "/*", "#", "<!--")):
                header_lines += 1
                continue
            break
    if header_lines > HEADER_MAX:
        problems.append(f"{path}:1: header comment block is {header_lines} lines (max {HEADER_MAX})")
    for start, body, end in comments:
        if start > header_lines:
            problems.append(f"{path}:{start}: comment outside header block: {body[:60]}")
    return problems

def iter_files(root):
    if root.is_file():
        yield root
        return
    for entry in sorted(root.rglob("*")):
        if entry.is_file() and entry.suffix not in SKIP_SUFFIX and not set(entry.parts) & SKIP_DIRS:
            yield entry

def main(argv):
    problems = []
    for target in argv:
        for path in iter_files(Path(target)):
            problems.extend(check_file(path))
    for problem in problems:
        print(problem)
    if problems:
        print(f"{len(problems)} comment policy violation(s)")
        return 1
    print("comment policy: ok")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
