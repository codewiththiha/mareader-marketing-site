#!/usr/bin/env python3
"""CI poller: wait on this head's workflow run; exit 0 green, 1 red, 2 running."""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request

API = "https://api.github.com"
REPO = "codewiththiha/mareader-marketing-site"
WORKFLOW = "ci.yml"


def head_sha() -> str:
    out = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True)
    return out.stdout.strip()


def get(path: str, token: str | None):
    req = urllib.request.Request(API + path, headers={"accept": "application/vnd.github+json"})
    if token:
        req.add_header("authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def runs_for(sha: str, token: str | None):
    data = get(f"/repos/{REPO}/actions/runs?head_sha={sha}&per_page=10", token)
    return [r for r in data.get("workflow_runs", []) if (r.get("path") or "").endswith(WORKFLOW)]


def jobs_of(run_id: int, token: str | None):
    return get(f"/repos/{REPO}/actions/runs/{run_id}/jobs?per_page=100", token).get("jobs", [])


def snapshot(sha: str, token: str | None) -> int:
    runs = runs_for(sha, token)
    if not runs:
        print("ci_wait: no run for this head yet")
        return 2
    run = runs[0]
    jobs = jobs_of(run["id"], token)
    for job in jobs:
        if job.get("conclusion") not in (None, "success", "skipped"):
            print(f"ci_wait: RED job {job['name']} ({job['conclusion']}) run {run['id']}")
            return 1
    if run.get("status") == "completed":
        if run.get("conclusion") == "success":
            print(f"ci_wait: GREEN run {run['id']} ({len(jobs)} jobs)")
            return 0
        print(f"ci_wait: RED run {run['id']} ({run.get('conclusion')})")
        return 1
    done = sum(1 for j in jobs if j.get("status") == "completed")
    print(f"ci_wait: running {run['id']}: {done}/{len(jobs)} jobs done")
    return 2


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["watch"])
    ap.add_argument("--once", action="store_true")
    ap.add_argument("--timeout", type=int, default=1800)
    ap.add_argument("--token-file")
    args = ap.parse_args()
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token and args.token_file:
        token = open(args.token_file, encoding="utf8").read().strip()
    sha = head_sha()
    deadline = time.time() + args.timeout
    while True:
        code = snapshot(sha, token)
        if code != 2 or args.once or time.time() > deadline:
            return code
        time.sleep(20)


if __name__ == "__main__":
    sys.exit(main())
