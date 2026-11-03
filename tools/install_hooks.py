#!/usr/bin/env python3
# Installs the commit-msg hook that enforces the 50 character limit.
# Usage: python3 tools/install_hooks.py
import os
import shutil
import subprocess
import sys
from pathlib import Path

def main():
    root = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True
    ).stdout.strip()
    if not root:
        print("not inside a git repository")
        return 1
    source = Path(root) / "githooks" / "commit-msg"
    target = Path(root) / ".git" / "hooks" / "commit-msg"
    if not source.exists():
        print(f"missing hook source: {source}")
        return 1
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    os.chmod(target, 0o755)
    print(f"installed hook: {target}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
