#!/usr/bin/env python3
"""Check every asset this site ships against ATTRIBUTION.toml.

  python3 tools/assets_check.py            # list, licences and hashes
  python3 tools/assets_check.py --json     # the same, as data

Fails when a file under `src/assets` or `public/` has no entry, an entry names a
file that is gone, a hash does not match, or a licence is off the list in
AGENTS.md. Hashes are SHA-256; `SELF` marks a contributor-original file whose
hash is not worth pinning to its own edits.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import tomllib
from pathlib import Path

ATTR = Path("ATTRIBUTION.toml")
ALLOWED = {
    "MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0",
    "OFL-1.1", "CC0-1.0", "CC-BY-4.0",
}
WATCHED = [Path("src/assets"), Path("public")]
# Documents that sit beside an asset: licence texts, and our own notes.
IGNORED_SUFFIXES = {".md", ".txt", ".html"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 16), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    if not ATTR.exists():
        print("ATTRIBUTION.toml is missing", file=sys.stderr)
        return 1

    data = tomllib.loads(ATTR.read_text(encoding="utf-8"))
    assets = data.get("asset", [])
    problems: list[str] = []
    listed: set[Path] = set()

    for asset in assets:
        path = Path(asset.get("path", ""))
        listed.add(path)
        if not path.exists():
            problems.append(f"{path}: listed but not on disk")
            continue
        licence = asset.get("license", "")
        if licence not in ALLOWED and licence != "MIT":
            problems.append(f"{path}: licence {licence!r} is not on the allowed list")
        for field in ("title", "author", "source", "usage"):
            if not asset.get(field):
                problems.append(f"{path}: no {field}")
        expected = asset.get("sha256", "")
        if expected == "SELF":
            continue
        if not expected:
            problems.append(f"{path}: no sha256")
        elif len(expected) != 64:
            problems.append(f"{path}: sha256 is not 64 hex characters")
        else:
            actual = sha256(path)
            if actual != expected:
                problems.append(f"{path}: sha256 is {actual}, ATTRIBUTION.toml says {expected}")
        license_file = asset.get("license_file")
        if license_file and not Path(license_file).exists():
            problems.append(f"{path}: licence text {license_file} is missing")

    on_disk = {
        file
        for root in WATCHED
        if root.exists()
        for file in root.rglob("*")
        if file.is_file() and file.suffix not in IGNORED_SUFFIXES
    }
    for extra in sorted(on_disk - listed):
        problems.append(f"{extra}: on disk but not in ATTRIBUTION.toml")

    payload = {"assets": len(assets), "problems": problems}
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        for problem in problems:
            print(f"[ASSET] {problem}")
        print(f"{len(assets)} asset(s) checked, {len(problems)} problem(s).")

    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
