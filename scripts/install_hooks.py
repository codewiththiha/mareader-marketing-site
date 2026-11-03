#!/usr/bin/env python3
"""Wire scripts/guard.py into .git/hooks; a no-op outside a git checkout."""
import os
import stat
import subprocess
import sys
from pathlib import Path

COMMIT_MSG = '#!/bin/sh\nexec python3 "$(git rev-parse --show-toplevel)/scripts/guard.py" commit-msg "$1"\n'
PRE_COMMIT = '#!/bin/sh\nexec python3 "$(git rev-parse --show-toplevel)/scripts/guard.py" comments\n'


def main() -> int:
    probe = subprocess.run(["git", "rev-parse", "--git-dir"], capture_output=True, text=True)
    if probe.returncode != 0:
        return 0
    hooks = Path(probe.stdout.strip()) / "hooks"
    hooks.mkdir(parents=True, exist_ok=True)
    for name, body in (("commit-msg", COMMIT_MSG), ("pre-commit", PRE_COMMIT)):
        hook = hooks / name
        hook.write_text(body, encoding="utf8")
        hook.chmod(hook.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    print("guard hooks installed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
