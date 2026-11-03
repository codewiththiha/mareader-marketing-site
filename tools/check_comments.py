#!/usr/bin/env python3
"""Reject suppression comments and comments in CSS and Markdown."""
import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--all', action='store_true')
args = parser.parse_args()
cmd = ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'] if args.all else ['git', 'diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']
paths = subprocess.check_output(cmd, cwd=ROOT).decode().split('\0')
failed = False
for name in sorted(set(paths)):
    path = ROOT / name
    if not name or not path.is_file() or path.suffix not in {'.js', '.mjs', '.ts', '.svelte', '.css', '.md', '.html'}:
        continue
    text = path.read_text(encoding='utf-8')
    checks = [(r'(?i)eslint-disable|svelte-ignore', 'lint suppression')]
    if path.suffix == '.css':
        checks.append((r'/\*', 'CSS comment'))
    if path.suffix == '.md':
        checks.append((r'<!--', 'HTML comment in Markdown'))
    for pattern, label in checks:
        for match in re.finditer(pattern, text):
            print(f'{name}:{text.count(chr(10), 0, match.start()) + 1}: {label}')
            failed = True
sys.exit(1 if failed else 0)
