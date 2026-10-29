#!/usr/bin/env python3
"""The CI poller: let GitHub run the gates and wait for the verdict.

  python3 tools/ci.py mode                 # "ci" or "local" for this machine, and why
  python3 tools/ci.py watch                # the run for this branch's HEAD, to a verdict
  python3 tools/ci.py watch --once         # one snapshot, no waiting
  python3 tools/ci.py watch --wait 900     # give up after fifteen minutes
  python3 tools/ci.py branch               # the branch name this commit belongs on

Exit code: 0 green, 1 red, 2 not finished (or no run yet), 3 bad usage.

A sandbox has a fraction of the memory and cores a build wants, so the gates
live in GitHub Actions and this is the only way to hear their answer. On a
capable workstation run them locally instead and do not poll: the same commands
already passed. docs/verification.md says which is which.

The token comes from $GITHUB_PAT, $GITHUB_TOKEN or `.env` in the repository
root. It is never printed, never written, and never sent anywhere but
api.github.com. Standard library only.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request

API = "https://api.github.com"
REPO = "codewiththiha/mareader-marketing-site"
LOCAL_MIN_GIB = 4
LOCAL_MIN_CORES = 4


# --- Where this is running ---------------------------------------------------


def _read_meminfo_gib() -> float:
    try:
        with open("/proc/meminfo", encoding="utf-8") as handle:
            for line in handle:
                if line.startswith("MemTotal:"):
                    return int(line.split()[1]) / 1024 / 1024
    except OSError:
        pass
    return 0.0


def _cgroup_gib() -> float:
    for path in ("/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory/memory.limit_in_bytes"):
        try:
            with open(path, encoding="utf-8") as handle:
                value = handle.read().strip()
            if value and value != "max":
                return int(value) / 1024**3
        except (OSError, ValueError):
            continue
    return 0.0


def machine() -> dict:
    mem = _read_meminfo_gib()
    cap = _cgroup_gib()
    if cap:
        mem = min(mem, cap) if mem else cap
    cores = os.cpu_count() or 1
    disk = shutil.disk_usage(".").free / 1024**3
    return {"mem_gib": round(mem, 1), "cores": cores, "disk_gib": round(disk, 1)}


def choose_mode() -> tuple[str, str]:
    if os.environ.get("MAREADER_VERIFY") in ("local", "ci"):
        return os.environ["MAREADER_VERIFY"], "MAREADER_VERIFY is set"
    facts = machine()
    if facts["mem_gib"] >= LOCAL_MIN_GIB and facts["cores"] >= LOCAL_MIN_CORES:
        return "local", f"{facts['mem_gib']} GiB, {facts['cores']} cores"
    return "ci", f"{facts['mem_gib']} GiB, {facts['cores']} cores — too small to build here"


# --- Talking to GitHub -------------------------------------------------------


def token() -> str:
    for name in ("GITHUB_PAT", "GITHUB_TOKEN", "GH_TOKEN"):
        if os.environ.get(name):
            return os.environ[name]
    try:
        with open(".env", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if line.startswith("GITHUB_PAT="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except OSError:
        pass
    raise SystemExit("no token: set GITHUB_PAT in .env (see .env.example)")


def api(path: str, accept: str = "application/vnd.github+json") -> bytes:
    request = urllib.request.Request(
        f"{API}{path}",
        headers={
            "Authorization": f"Bearer {token()}",
            "Accept": accept,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def branch() -> str:
    try:
        name = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return "main"
    return name


def head_sha() -> str:
    return subprocess.run(
        ["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True,
    ).stdout.strip()


def runs_for(sha: str) -> list[dict]:
    data = json.loads(api(f"/repos/{REPO}/actions/runs?head_sha={sha}&per_page=10"))
    return data.get("workflow_runs", [])


def summarise(run: dict) -> dict:
    jobs = json.loads(api(f"/repos/{REPO}/actions/runs/{run['id']}/jobs?per_page=50"))
    return {
        "name": run.get("name") or run.get("workflow_id"),
        "status": run.get("status"),
        "conclusion": run.get("conclusion"),
        "url": run.get("html_url"),
        "jobs": [
            {
                "name": job.get("name"),
                "conclusion": job.get("conclusion"),
                "id": job.get("id"),
            }
            for job in jobs.get("jobs", [])
        ],
    }


class _DropAuthOnSignature(urllib.request.HTTPRedirectHandler):
    """Blob storage refuses a signed URL that also carries `Authorization`."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: D102
        new = super().redirect_request(req, fp, code, msg, headers, newurl)
        if new is not None and "sig=" in newurl:
            new.remove_header("Authorization")
        return new


def failing_step(job_id: int) -> str:
    opener = urllib.request.build_opener(_DropAuthOnSignature)
    request = urllib.request.Request(
        f"{API}/repos/{REPO}/actions/jobs/{job_id}/logs",
        headers={"Authorization": f"Bearer {token()}", "Accept": "application/vnd.github+json"},
    )
    try:
        with opener.open(request, timeout=30) as response:
            text = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return f"(its log is not readable: HTTP {error.code})"
    lines = [line for line in text.splitlines() if line.strip()]
    return "\n".join(lines[-25:])


def watch(sha: str, once: bool, wait: int) -> int:
    deadline = time.time() + wait
    announced = False
    while True:
        try:
            runs = runs_for(sha)
        except urllib.error.HTTPError as error:
            print(f"GitHub said HTTP {error.code}: {error.reason}", file=sys.stderr)
            return 2
        if not runs:
            print(f"no run for {sha[:8]} yet; push the branch and wait a moment.", file=sys.stderr)
            if once or time.time() > deadline:
                return 2
            time.sleep(20)
            continue

        settled = [run for run in runs if run.get("status") == "completed"]
        live = [run for run in runs if run.get("status") != "completed"]
        if settled:
            for run in settled:
                report = summarise(run)
                if report["conclusion"] == "success":
                    print(f"green: {report['name']} — {report['url']}")
                    return 0
                if report["conclusion"] == "cancelled":
                    print(f"a newer push cancelled {report['name']}; watch the branch head.")
                    return 2
                print(f"red: {report['name']} — {report['url']}")
                for job in report["jobs"]:
                    if job["conclusion"] not in ("success", "skipped", None):
                        print(f"\n  {job['name']} failed. Last lines:\n")
                        print(failing_step(job["id"]))
                return 1

        if not announced:
            names = ", ".join(run.get("name", "?") for run in live) or "queued"
            print(f"waiting on {names} for {sha[:8]}…")
            announced = True
        if once or time.time() > deadline:
            print("still running.", file=sys.stderr)
            return 2
        time.sleep(15)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("command", choices=["mode", "watch", "branch"])
    parser.add_argument("--once", action="store_true", help="one snapshot, no waiting")
    parser.add_argument("--wait", type=int, default=1800, help="seconds before giving up")
    parser.add_argument("--sha", help="watch this commit instead of HEAD")
    args = parser.parse_args()

    if args.command == "mode":
        mode, why = choose_mode()
        print(f"{mode}: {why}")
        return 0

    if args.command == "branch":
        name = branch()
        if re.fullmatch(r"(feat|fix|perf|refactor|docs|test|build|ci|chore)/[a-z0-9-]+", name):
            print(f"{name} is a work branch.")
            return 0
        print(f"{name} is not a <type>/<slug> branch; CI only runs on those.")
        return 1

    return watch(args.sha or head_sha(), args.once, args.wait)


if __name__ == "__main__":
    sys.exit(main())
