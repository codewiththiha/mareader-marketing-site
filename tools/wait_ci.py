#!/usr/bin/env python3
# Polls a GitHub Actions run until it completes and reports every job.
# Usage: python3 tools/wait_ci.py --repo owner/name [--branch main2] [--timeout 35]
import argparse
import json
import os
import sys
import time
import urllib.request

def get(url, pat):
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {pat}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "mareader-ci-poller"
        }
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)

def latest_run(repo, branch, pat):
    data = get(f"https://api.github.com/repos/{repo}/actions/runs?branch={branch}&per_page=1", pat)
    runs = data.get("workflow_runs") or []
    return runs[0] if runs else None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--branch", default="main2")
    parser.add_argument("--timeout", type=int, default=35)
    parser.add_argument("--interval", type=int, default=20)
    args = parser.parse_args()
    pat = os.environ.get("GITHUB_PAT") or os.environ.get("GH_TOKEN")
    if not pat:
        print("GITHUB_PAT or GH_TOKEN is required")
        return 2
    deadline = time.time() + args.timeout * 60
    run = latest_run(args.repo, args.branch, pat)
    if not run:
        print(f"no workflow runs on {args.branch}")
        return 1
    print(f"run {run['id']} {run['name']} [{run['status']}]")
    while run["status"] != "completed":
        if time.time() > deadline:
            print(f"timed out after {args.timeout} minutes; run still {run['status']}")
            return 1
        time.sleep(args.interval)
        run = get(run["url"], pat)
        print(f"run {run['id']} [{run['status']}]")
    jobs = get(f"{run['url']}/jobs", pat).get("jobs") or []
    failed = 0
    for job in jobs:
        print(f"  {job['name']}: {job['conclusion']}")
        failed += job["conclusion"] != "success"
    print(f"verdict: {run['conclusion']}")
    return 0 if run["conclusion"] == "success" and not failed else 1

if __name__ == "__main__":
    sys.exit(main())
