#!/usr/bin/env python3
"""Install the version-controlled Git hooks."""
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
subprocess.run(['git', 'config', 'core.hooksPath', '.githooks'], cwd=root, check=True)
for name in ('pre-commit', 'commit-msg'):
    path = root / '.githooks' / name
    path.chmod(path.stat().st_mode | 0o111)
print('Installed hooks from .githooks')
