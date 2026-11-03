#!/usr/bin/env python3
"""Enforce a nonempty, single-line subject of at most 50 characters."""
import argparse
import subprocess
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('file', nargs='?')
parser.add_argument('--head', action='store_true')
args = parser.parse_args()
if args.head:
    message = subprocess.check_output(['git', 'log', '-1', '--format=%B'], text=True)
elif args.file:
    message = Path(args.file).read_text(encoding='utf-8')
else:
    parser.error('supply a message file or --head')
lines = [line for line in message.splitlines() if not line.startswith('#')]
subject = lines[0].strip() if lines else ''
if not subject or len(subject) > 50:
    print('Commit subject must contain 1–50 characters.', file=sys.stderr)
    sys.exit(1)
