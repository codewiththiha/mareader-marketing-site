#!/usr/bin/env python3
"""Flag comments that cost more than they say.

Consecutive comment lines are aggregated into blocks and each block is measured
against the repository's brevity rule (AGENTS.md, "Comments"): a line no wider
than --max-line, a block no longer than --max-lines and no wordier than
--max-words. A block is exempt when it carries `comment-check: allow` — on the
line directly above the prose or inside it, since adjacent comment lines are one
block. That is how a constraint needing four lines stays honest about needing
four. Ported from mareader2's tools/comment_check.py, extended with grammars
for .svelte and .html.

  python3 scripts/comment_check.py                      # every tracked source file
  python3 scripts/comment_check.py src/lib scripts
  python3 scripts/comment_check.py --json src/App.svelte
  python3 scripts/comment_check.py --strip path/to/file.ts
  python3 scripts/comment_check.py --self-test

Directories recurse into everything nested under them. Tracked files are listed
through git, so generated output (node_modules, dist) is out of scope by itself.
Exit 1 when anything is flagged, 0 when clean, so the check can gate a round.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys

# How each language marks a comment; `://` in markup is a URL, not prose.
LANGS = {
    ".ts": {"line": ["//"], "block": [("/*", "*/")], "url_guard": True},
    ".js": {"line": ["//"], "block": [("/*", "*/")], "url_guard": True},
    ".mjs": {"line": ["//"], "block": [("/*", "*/")], "url_guard": True},
    ".cjs": {"line": ["//"], "block": [("/*", "*/")], "url_guard": True},
    ".svelte": {"line": ["//"], "block": [("/*", "*/"), ("<!--", "-->")],
                "url_guard": True},
    ".html": {"line": [], "block": [("<!--", "-->")], "url_guard": False},
    ".css": {"line": [], "block": [("/*", "*/")], "url_guard": False},
    ".py": {"line": ["#"], "block": [], "url_guard": False},
    ".sh": {"line": ["#"], "block": [], "url_guard": False},
    ".yml": {"line": ["#"], "block": [], "url_guard": False},
}
ALLOW = "comment-check: allow"
SKIP_DIRS = {".git", "node_modules", "target", "dist", "build", "__pycache__",
             ".venv", "coverage", "out", "screenshots", "test-results",
             "playwright-report", ".svelte-kit"}


class Comment:
    """One comment block: the lines it spans, its bytes, its bare prose."""

    def __init__(self, start_line: int, end_line: int, start_byte: int,
                 end_byte: int, raw: str, strippable: bool, indent: int = 0):
        self.start_line = start_line
        self.end_line = end_line
        self.start_byte = start_byte
        self.end_byte = end_byte
        self.raw = raw
        self.strippable = strippable
        self.indent = indent

    def prose(self) -> str:
        out = []
        for line in self.raw.splitlines():
            text = line.strip()
            text = re.sub(r"^//[/!]?/?", "", text)
            text = re.sub(r"^/\*+", "", text)
            text = re.sub(r"\*+/$", "", text)
            text = re.sub(r"^<!--+", "", text)
            text = re.sub(r"--!?>$", "", text)
            text = re.sub(r"^#+\s?", "", text)
            text = re.sub(r"^[*\s]+", "", text)
            out.append(text.strip(" */"))
        return "\n".join(out).strip()

    def words(self) -> int:
        return len(self.prose().split())

    def widest(self) -> int:
        # `raw` starts at the marker, so line 1 owes its indent back.
        lengths = [len(l) for l in self.raw.splitlines()]
        if lengths:
            lengths[0] += self.indent
        return max(lengths, default=0)

    def lines(self) -> int:
        return self.end_line - self.start_line + 1

    def to_dict(self, path: str, max_line: int, max_words: int, max_lines: int) -> dict:
        reasons = []
        if self.widest() > max_line:
            reasons.append(f"a line here is {self.widest()} characters, over {max_line}")
        if self.lines() > max_lines:
            reasons.append(f"the block is {self.lines()} lines, over {max_lines}")
        if self.words() > max_words:
            reasons.append(f"the block runs {self.words()} words, over {max_words}")
        return {
            "file": path,
            "line": self.start_line,
            "end_line": self.end_line,
            "start_byte": self.start_byte,
            "end_byte": self.end_byte,
            "lines": self.lines(),
            "words": self.words(),
            "widest": self.widest(),
            "reasons": reasons,
            "text": self.raw,
            "strippable": self.strippable,
            "indent": self.indent,
        }


def scan(text: str, lang: dict) -> list[Comment]:
    """Every comment block in `text`, with strings and escapes respected.

    Deliberately a small state machine rather than a parser: the only question
    is where comments are, and a grammar buys nothing that this does not get
    right — a `//` inside a string or a URL must not read as a comment.
    """
    line_markers = lang["line"]
    blocks = lang["block"]
    url_guard = lang.get("url_guard", False)
    comments: list[tuple[int, int, int, int]] = []
    i = 0
    n = len(text)
    line = 1
    depth = 0
    block_close = ""
    start = 0
    start_line = 0
    in_line: tuple[int, int] | None = None
    while i < n:
        ch = text[i]
        if ch == "\n":
            line += 1
            if in_line is not None:
                comments.append((in_line[1], line - 1, in_line[0], i))
                in_line = None
            i += 1
            continue
        if depth > 0:
            if text.startswith(block_close, i):
                i += len(block_close)
                depth -= 1
                if depth == 0:
                    comments.append((start_line, line, start, i))
                continue
            i += 1
            continue
        if in_line is not None:
            i += 1
            continue
        matched_line = False
        for marker in line_markers:
            if text.startswith(marker, i):
                if url_guard and i > 0 and text[i - 1] == ":":
                    continue  # "https://…" — the scheme colon says URL, not comment
                in_line = (i, line)
                start = i
                start_line = line
                matched_line = True
                break
        if matched_line:
            i += 1
            continue
        opened = False
        for opener, closer in blocks:
            if text.startswith(opener, i):
                block_close = closer
                depth = 1
                start = i
                start_line = line
                i += len(opener)
                opened = True
                break
        if opened:
            continue
        if ch == "\\":
            i += 2
            continue
        if text[i] in "\"'`":
            jump = _skip_string(text, i)
            line += text.count("\n", i, jump)
            i = jump
            continue
        i += 1
    if in_line is not None:
        comments.append((in_line[1], line, in_line[0], n))
    return group(text, comments)


def _skip_string(text: str, i: int) -> int:
    quote = text[i]
    i += 1
    n = len(text)
    while i < n:
        if text[i] == "\\":
            i += 2
            continue
        if text[i] == quote:
            return i + 1
        if quote == "`" and text.startswith("${", i):
            end = text.find("}", i)
            i = n if end == -1 else end + 1
            continue
        if quote == "'" and text[i] == "\n":
            return i  # a stray apostrophe is not a line-long string
        i += 1
    return i


def group(text: str, found: list[tuple[int, int, int, int]]) -> list[Comment]:
    """Merge adjacent same-style comments into one block: that is what a reader
    reads as one comment, and what the length rules have to judge."""
    found = [f for f in found if not (f[0] == 1 and text.startswith("#!"))]
    lines = text.splitlines(keepends=True)
    out: list[Comment] = []
    for start_line, end_line, start_byte, end_byte in found:
        head = lines[start_line - 1] if start_line - 1 < len(lines) else ""
        style = _style(head.lstrip())
        strippable = _owns_its_lines(text, start_byte, end_byte)
        if out:
            prev = out[-1]
            between = text[prev.end_byte:start_byte]
            if (prev.end_line == start_line - 1 and between.count("\n") == 1
                    and not between.strip()
                    and _style(lines[prev.end_line - 1].lstrip()) == style):
                out[-1] = Comment(prev.start_line, end_line, prev.start_byte, end_byte,
                                  text[prev.start_byte:end_byte],
                                  prev.strippable and strippable, prev.indent)
                continue
        out.append(Comment(start_line, end_line, start_byte, end_byte,
                           text[start_byte:end_byte], strippable,
                           len(head) - len(head.lstrip())))
    return out


def _owns_its_lines(text: str, start_byte: int, end_byte: int) -> bool:
    """True when nothing but the comment shares its lines: removal then deletes
    whole lines instead of reaching into code."""
    before = text.rfind("\n", 0, start_byte) + 1
    after = text.find("\n", end_byte)
    after = len(text) if after == -1 else after
    return not text[before:start_byte].strip() and not text[end_byte:after].strip()


def _style(stripped: str) -> str:
    for marker in ("///", "//!", "//", "/*", "<!--", "#"):
        if stripped.startswith(marker):
            return marker[:2]
    return ""


def offending(comments: list[Comment], max_line: int, max_words: int,
              max_lines: int) -> list[tuple[Comment, dict]]:
    hits = []
    for c in comments:
        if ALLOW in c.raw:
            continue
        info = c.to_dict("", max_line, max_words, max_lines)
        if info["reasons"]:
            hits.append((c, info))
    return hits


def files_for(targets: list[str], exts: set[str]) -> list[str]:
    """Track files through git when the target is inside a repository: generated
    output is untracked, so it drops out without a list of names to maintain."""
    out: list[str] = []
    for target in targets:
        if os.path.isfile(target):
            if os.path.splitext(target)[1] not in exts:
                print(f"{target}: no comment grammar for it, skipped",
                      file=sys.stderr)
                continue
            out.append(target)
            continue
        listing = _git_files(target)
        if listing is None:
            listing = _walk(target)
        for path in listing:
            if os.path.splitext(path)[1] in exts:
                out.append(path)
    seen, ordered = set(), []
    for path in out:
        norm = os.path.normpath(path)
        if norm not in seen:
            seen.add(norm)
            ordered.append(norm)
    return ordered


def _git_files(target: str) -> list[str] | None:
    try:
        r = subprocess.run(["git", "ls-files", "--", target], capture_output=True,
                           text=True)
    except OSError:
        return None
    if r.returncode != 0:
        return None
    return [p for p in r.stdout.splitlines() if p.strip()]


def _walk(target: str) -> list[str]:
    found = []
    for dirpath, names, files in os.walk(target):
        names[:] = [d for d in names if d not in SKIP_DIRS]
        found += [os.path.join(dirpath, f) for f in files]
    return found


def report(results: list[dict], as_json: bool) -> None:
    if as_json:
        print(json.dumps(results, indent=2))
        return
    for hit in results:
        where = f"{hit['file']}:{hit['line']}"
        print(f"[REFACTOR NEEDED] {where} — " + "; ".join(hit["reasons"]))
        body = hit["text"].rstrip().splitlines()
        if body:
            body[0] = " " * hit["indent"] + body[0]
        pad = min((len(l) - len(l.lstrip()) for l in body if l.strip()), default=0)
        for line in body:
            print("    " + line[pad:])
        print(f"    bytes {hit['start_byte']}-{hit['end_byte']}"
              + ("" if hit["strippable"] else " (inline, not strippable)"))
        print()


def strip(path: str, hits: list[dict]) -> int:
    text = open(path, encoding="utf-8").read()
    removed = [h for h in hits if h["strippable"]]
    if not removed:
        return 0
    lines = text.splitlines(keepends=True)
    kill = set()
    for hit in removed:
        kill.update(range(hit["line"], hit["end_line"] + 1))
    kept = [l for idx, l in enumerate(lines, 1) if idx not in kill]
    open(path, "w", encoding="utf-8").write("".join(kept))
    return len(kill)


TS_FIXTURE = '''
export function process(data: number[]) {
    // NOTE: We are looping through the entire vector here to calculate values,
    // and we need to make sure that we filter out anything that is below zero
    // because negative values will completely break the analytical pipeline.
    const filtered = data.filter((x) => x >= 0);

    // Fast clear
    const url = "https://example.com/a//b";  // not a comment inside the string
    /* a nested-less /* block */
    return filtered.length;
}
'''

SVELTE_FIXTURE = '''<script lang="ts">
  // Home — the landing page
  const repo = "https://github.com/x/y";
</script>

<a href="https://example.com">a link whose URL must not read as a comment</a>
<!-- a markup note -->
<style>
  /* a style note */
</style>
'''


def self_test() -> int:
    comments = scan(TS_FIXTURE, LANGS[".ts"])
    texts = " ".join(c.raw for c in comments)
    assert "example.com" not in texts, "a URL inside a string read as a comment"
    short = [c for c in comments if c.words() <= 3]
    assert any(c.raw.strip() == "// Fast clear" for c in short), "short comment mis-measured"
    hits = offending(comments, 80, 15, 3)
    assert len(hits) == 1, f"expected one offending block, got {[h[1]['reasons'] for h in hits]}"
    sv = scan(SVELTE_FIXTURE, LANGS[".svelte"])
    sv_texts = " ".join(c.raw for c in sv)
    assert "link whose URL" not in sv_texts, "markup URL text read as a comment"
    assert any(c.raw.strip() == "<!-- a markup note -->" for c in sv), "html comment missed"
    assert any(c.raw.strip() == "/* a style note */" for c in sv), "css comment missed"
    assert not offending(sv, 80, 15, 3), [h[1]["reasons"] for h in offending(sv, 80, 15, 3)]
    sh = scan("#!/usr/bin/env sh\n# one short line\n", LANGS[".sh"])
    assert [c.start_line for c in sh] == [2], "a shebang was read as a comment"
    exempted = scan(TS_FIXTURE.replace("    // NOTE:",
                                       "    // comment-check: allow\n    // NOTE:"),
                    LANGS[".ts"])
    assert not offending(exempted, 80, 15, 3), "the allow marker did not exempt"
    pad, mark = " " * 8, "// "
    edge = pad + mark + "x" * (80 - len(pad) - len(mark))
    deep = scan(f"function f() {{\n{edge}\n{pad}{mark}short\n{pad}let y = 1;\n}}\n",
                LANGS[".ts"])
    assert len(edge) == 80 and offending(deep, 80, 15, 3) == [], "80 col flagged"
    assert offending(deep, 79, 15, 3), "indent did not count toward the width"
    print(f"self-test passed: {len(comments)} ts + {len(sv)} svelte blocks, "
          "strings, URLs, markup comments and the allow marker all handled")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("targets", nargs="*", default=["."],
                    help="files or directories (directories recurse); default: the checkout")
    ap.add_argument("--max-line", type=int, default=80, help="widest comment line")
    ap.add_argument("--max-words", type=int, default=15, help="words per block")
    ap.add_argument("--max-lines", type=int, default=3, help="lines per block")
    ap.add_argument("--json", action="store_true", help="emit the payload instead of prose")
    ap.add_argument("--strip", action="store_true",
                    help="delete the flagged blocks that own their lines")
    ap.add_argument("--self-test", action="store_true", help="check the scanner and stop")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    exts = set(LANGS)
    paths = files_for(args.targets or ["."], exts)
    if not paths:
        print("no files with a comment grammar matched", file=sys.stderr)
        return 1
    results: list[dict] = []
    per_file: dict[str, list[dict]] = {}
    for path in paths:
        try:
            text = open(path, encoding="utf-8").read()
        except (OSError, UnicodeDecodeError) as exc:
            print(f"{path}: unreadable: {exc}", file=sys.stderr)
            continue
        comments = scan(text, LANGS[os.path.splitext(path)[1]])
        hits = offending(comments, args.max_line, args.max_words, args.max_lines)
        for _, info in hits:
            info["file"] = path
            results.append(info)
        if hits:
            per_file[path] = [info for _, info in hits]
    removed = 0
    if args.strip:
        for path, hits in per_file.items():
            removed += strip(path, hits)
    report(results, args.json)
    if args.json:
        return 0 if (args.strip or not results) else 1
    if args.strip:
        print(f"stripped {removed} lines across {len(per_file)} file(s).")
    else:
        print(f"{len(paths)} file(s) read, {len(results)} comment block(s) over the limit "
              f"(--max-line {args.max_line}, --max-words {args.max_words}, "
              f"--max-lines {args.max_lines}).")
    return 0 if (args.strip or not results) else 1


if __name__ == "__main__":
    sys.exit(main())
