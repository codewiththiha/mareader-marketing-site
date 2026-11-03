#!/usr/bin/env python3
# Enforces commit messages of at most 50 characters per line.
# Usage: python3 tools/check_commit_message.py <msg-file> | --log | --stdin
import subprocess
import sys

LIMIT = 50

def check_message(message, label):
    lines = message.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    cut = next((i for i, raw in enumerate(lines) if raw.startswith("diff --git")), len(lines))
    lines = lines[:cut]
    body = [raw for raw in lines if not raw.startswith("#")]
    while body and not body[0].strip():
        body.pop(0)
    problems = []
    if not body or not body[0].strip():
        problems.append(f"{label}: empty commit message")
    for raw in body:
        if len(raw) > LIMIT:
            problems.append(f"{label}: line of {len(raw)} chars exceeds {LIMIT}: {raw[:60]}")
    return problems

def main(argv):
    if argv and argv[0] == "--log":
        try:
            out = subprocess.run(
                ["git", "log", "--format=%H %s%x00%B%x01"],
                capture_output=True,
                text=True,
                check=True
            ).stdout
        except subprocess.CalledProcessError:
            print("commit messages: no history yet")
            return 0
        problems = []
        for chunk in out.split("\x01"):
            chunk = chunk.strip("\n")
            if not chunk.strip():
                continue
            head, _, message = chunk.partition("\x00")
            sha = head.split(" ")[0]
            problems.extend(check_message(message, f"commit {sha[:8]}"))
        return report(problems)
    if argv and argv[0] == "--stdin":
        return report(check_message(sys.stdin.read(), "commit message"))
    if argv:
        return report(check_message(open(argv[0], encoding="utf-8").read(), "commit message"))
    print("usage: check_commit_message.py <msg-file> | --log | --stdin")
    return 2

def report(problems):
    for problem in problems:
        print(problem)
    if problems:
        print(f"{len(problems)} commit message violation(s)")
        return 1
    print("commit messages: ok")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
