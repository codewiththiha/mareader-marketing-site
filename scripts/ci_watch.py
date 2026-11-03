#!/usr/bin/env python3
"""Wait for GitHub Actions to reach a verdict on a commit.

Ported from mareader2's tools/ci.py `watch`: the CI pooler. It follows the
`CI` workflow on a commit, prints what is still running, and stops early on a
red job with a digest of its log. A run a newer push cancelled is superseded,
not red. Reads of this public repository need no token; the failed-job log
download does, from $GITHUB_TOKEN or $GH_TOKEN.

  python3 scripts/ci_watch.py watch                # the branch head, to a verdict
  python3 scripts/ci_watch.py watch --once         # one snapshot, no waiting
  python3 scripts/ci_watch.py watch <sha>          # a specific commit
  python3 scripts/ci_watch.py watch --detach       # background; --tail, --stop
  python3 scripts/ci_watch.py watch --json         # machine-readable verdict

Exit code: 0 green, 1 red, 2 not finished yet.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

API = "https://api.github.com"
REPO_DEFAULT = "codewiththiha/mareader-marketing-site"
GATE = "CI"


def log(msg: str) -> None:
    print(msg, flush=True)


def token_from(args) -> str:
    if getattr(args, "token_file", None):
        return open(args.token_file, encoding="utf-8").read().strip()
    return os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN") or ""


def request(token: str, url: str) -> urllib.request.Request:
    url = url if url.startswith("http") else f"{API}{url}"
    req = urllib.request.Request(url)
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("User-Agent", "mareader-site-ci-watch")
    return req


def api(token: str, path: str, *, raw: bool = False):
    """JSON from the API; None on 404 (an unknown commit or no run yet)."""
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request(token, path), timeout=60) as resp:
                body = resp.read()
                if raw:
                    return body
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as exc:
            text = exc.read().decode("utf-8", "replace")
            if exc.code == 404:
                return None
            wait = exc.headers.get("Retry-After")
            if wait and exc.code in (403, 429) and attempt < 3:
                log(f"  rate limited ({exc.code}); waiting {wait}s")
                time.sleep(int(wait))
                continue
            raise SystemExit(f"{path}: HTTP {exc.code}: {text[:300].strip()}")
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt < 3:
                time.sleep(3 * (attempt + 1))
                continue
            raise SystemExit(f"{path}: network error: {exc}") from exc
    raise SystemExit(f"{path}: gave up after retries")


@dataclass
class Job:
    name: str
    status: str
    conclusion: str | None
    id: int


@dataclass
class Run:
    name: str
    status: str
    conclusion: str | None
    id: int
    sha: str
    url: str
    created: str
    jobs: list[Job] = field(default_factory=list)

    @property
    def finished(self) -> bool:
        return self.status == "completed" or (
            bool(self.jobs) and all(j.status == "completed" for j in self.jobs))

    @staticmethod
    def of(item: dict) -> "Run":
        return Run(item["name"], item["status"], item.get("conclusion"), item["id"],
                   item["head_sha"], item["html_url"], item["created_at"])


def jobs_for(repo: str, token: str, run_id: int) -> list[Job]:
    payload = api(token, f"/repos/{repo}/actions/runs/{run_id}/jobs?per_page=100")
    return [Job(j["name"], j["status"], j.get("conclusion"), j["id"])
            for j in (payload or {}).get("jobs", [])]


def refresh(repo: str, token: str, run: Run) -> Run:
    fresh = Run.of(api(token, f"/repos/{repo}/actions/runs/{run.id}"))
    fresh.jobs = jobs_for(repo, token, run.id)
    return fresh


# A cancelled run is a newer push's doing, not this commit's verdict.
SUPERSEDED = ("cancelled", "startup_cancelled")


def is_red(conclusion: str | None) -> bool:
    return conclusion not in (None, "success", "skipped", "neutral", *SUPERSEDED)


ANSI = re.compile(r"\x1b\[[0-9;]*m")
STAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T[\d:.]+Z ?")
STEP_FAIL = re.compile(r"##\[error\]|error(\[|:)|FAILED|Diff in|✖|problems were found")
NOISE = re.compile(r"^\s*(Download|Extract|Cache|Receiving|Resolving|Updating files"
                   r"|##\[(end)?group\]|##\[(start|end)-action)")


def digest(text: str) -> str:
    """Error lines first, then the failing step or the log's tail."""
    lines = [STAMP.sub("", ln) for ln in ANSI.sub("", text).splitlines()]
    out: list[str] = []
    marks = [i for i, ln in enumerate(lines) if STEP_FAIL.search(ln)]
    if marks:
        out.append("--- error lines ---")
        shown: set[int] = set()
        for i in marks[:60]:
            span = range(i, i + 14) if "Diff in" in lines[i] else (i,)
            for j in span:
                if j < len(lines) and j not in shown:
                    shown.add(j)
                    out.append(lines[j])
    errors = [i for i, ln in enumerate(lines) if ln.startswith("##[error]")]
    end = errors[0] + 1 if errors else len(lines)
    runs = [i for i in range(end) if lines[i].startswith("##[group]Run ")]
    start = runs[-1] if errors and runs else max(0, end - 250)
    out.append("--- failing step ---" if errors else "--- tail ---")
    out.extend([ln for ln in lines[start:end] if not NOISE.match(ln)][-80:])
    return "\n".join(out)


def failure_digest(repo: str, token: str, run: Run) -> str:
    """The failed jobs' logs, which a job serves even mid-run."""
    if not token:
        return "(no token for log download; open the run page: " + run.url + ")"
    parts = []
    for job in run.jobs:
        if not is_red(job.conclusion):
            continue
        try:
            raw = api(token, f"/repos/{repo}/actions/jobs/{job.id}/logs", raw=True)
            text = digest(raw.decode("utf-8", "replace")) if raw else "(no log)"
        except SystemExit as exc:
            text = f"(log unavailable: {exc})"
        parts.append(f"\n===== {job.name} ({job.conclusion}) =====\n{text}")
    return "\n".join(parts) or "(no failed job; see the run page)"


def summarize(run: Run) -> str:
    bad = [f"{j.name} ({j.conclusion})" for j in run.jobs if is_red(j.conclusion)]
    state = run.conclusion or ("done" if run.finished else run.status)
    return f"{run.name}: {state}" + (" — failed: " + ", ".join(bad) if bad else "")


def follow(repo: str, token: str, run: Run, timeout: int, poll: int) -> Run:
    """Wait for one run; a red job ends the wait with its digest."""
    deadline = time.time() + timeout
    noted = ""
    while True:
        run = refresh(repo, token, run)
        running = [j.name for j in run.jobs if j.status != "completed"]
        state = f"{run.status} {', '.join(running)}"
        if state != noted:
            noted = state
            log(f"  {run.name} {run.status}" + (f": {', '.join(running)}" if running else ""))
        red = any(is_red(j.conclusion) for j in run.jobs)
        if red or run.finished:
            log("  " + summarize(run))
            if red:
                log(f"\n########## failure digest ({run.url}) ##########")
                log(failure_digest(repo, token, run))
                log("########## end digest ##########\n")
            return run
        if time.time() > deadline:
            log(f"  timed out after {timeout}s: {run.url}")
            return run
        time.sleep(poll)


def verdict(sha: str, run: Run | None) -> int:
    if run is None:
        log(f"IN PROGRESS for {sha[:9]} — no {GATE} run has appeared yet")
        return 2
    if any(is_red(j.conclusion) for j in run.jobs) or (
            is_red(run.conclusion) and not run.jobs):
        log(f"VERDICT RED for {sha[:9]} — {run.url}")
        return 1
    if not run.finished:
        log(f"IN PROGRESS for {sha[:9]} — {run.url}")
        return 2
    if run.conclusion in SUPERSEDED or any(j.conclusion in SUPERSEDED for j in run.jobs):
        log(f"VERDICT SUPERSEDED for {sha[:9]} — a newer push cancelled it; "
            "watch the branch head instead")
        return 2
    log(f"VERDICT GREEN for {sha[:9]}")
    return 0


def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True,
                          check=True).stdout.strip()


def git_dir() -> str:
    try:
        return git("rev-parse", "--absolute-git-dir")
    except (OSError, subprocess.CalledProcessError):
        return "."


def state_path(name: str) -> str:
    return os.path.join(git_dir(), f"ci-watch.{name}")


def gate_run(repo: str, token: str, sha: str) -> Run | None:
    """The newest CI run on this commit; older ones are context."""
    payload = api(token, f"/repos/{repo}/actions/runs?head_sha={sha}&per_page=50")
    runs = [Run.of(r) for r in (payload or {}).get("workflow_runs", [])
            if r["name"] == GATE]
    return max(runs, key=lambda r: r.created) if runs else None


def full_sha(rev: str) -> str:
    """The API matches whole commit ids only; expand a short one."""
    try:
        return git("rev-parse", f"{rev}^{{commit}}")
    except (OSError, subprocess.CalledProcessError):
        return rev


def resolve(repo: str, token: str, branch: str | None) -> str:
    """The branch head on GitHub: what CI actually ran."""
    if not branch:
        try:
            branch = git("rev-parse", "--abbrev-ref", "HEAD")
        except (OSError, subprocess.CalledProcessError):
            branch = "main"
        branch = "main" if branch == "HEAD" else branch
    info = api(token, f"/repos/{repo}/commits/{urllib.parse.quote(branch, safe='')}")
    if not info:
        raise SystemExit(f"{branch} is not on GitHub; push it first")
    return info["sha"]


def watch(args) -> int:
    token = token_from(args)
    sha = full_sha(args.sha) if args.sha else resolve(args.repo, token, args.branch)
    log(f"== watching {args.repo}@{sha[:12]} for {GATE}")
    run = gate_run(args.repo, token, sha)
    if args.once:
        if run:
            run.jobs = jobs_for(args.repo, token, run.id)
            log("  " + summarize(run))
            if any(is_red(j.conclusion) for j in run.jobs):
                log(failure_digest(args.repo, token, run))
        code = verdict(sha, run)
    else:
        deadline = time.time() + args.appear
        while run is None and time.time() < deadline:
            log(f"  waiting for a {GATE} run on {sha[:9]} ...")
            time.sleep(args.poll)
            run = gate_run(args.repo, token, sha)
        if run is not None:
            run = follow(args.repo, token, run, args.timeout, args.poll)
        code = verdict(sha, run)
    if args.json:
        print(json.dumps({"sha": sha, "code": code,
                          "url": run.url if run else None,
                          "failed": [j.name for j in run.jobs if is_red(j.conclusion)]
                          if run else []}))
    return code


def tail(args) -> int:
    path = state_path("log")
    if not os.path.exists(path):
        raise SystemExit(f"no watcher log at {path}; start one with --detach")
    text = open(path, errors="replace").read().splitlines()
    for line in text[-args.lines:]:
        print(line)
    starts = [i for i, ln in enumerate(text) if ln.startswith("== watching")]
    for line in reversed(text[starts[-1] if starts else 0:]):
        if line.startswith("VERDICT GREEN"):
            return 0
        if line.startswith("VERDICT RED"):
            return 1
    return 2


def stop() -> int:
    path = state_path("pid")
    if not os.path.exists(path):
        print("no detached watcher is running")
        return 0
    pid = int(open(path).read().strip())
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"stopped watcher {pid}")
    except ProcessLookupError:
        print(f"watcher {pid} had already exited")
    os.unlink(path)
    return 0


def detach(args) -> int:
    pid = os.fork()
    if pid > 0:
        with open(state_path("pid"), "w") as handle:
            handle.write(str(pid))
        print(f"watching in the background: pid {pid}, log {state_path('log')}")
        print("  read it with: python3 scripts/ci_watch.py watch --tail")
        return 0
    os.setsid()
    fd = os.open(state_path("log"), os.O_WRONLY | os.O_CREAT | os.O_APPEND)
    os.dup2(fd, 1)
    os.dup2(fd, 2)
    try:
        code = watch(args)
    except BaseException as exc:  # noqa: BLE001 - the log is the only output
        print(f"watcher failed: {type(exc).__name__}: {exc}")
        code = 1
    print(f"watcher exited with {code}")
    sys.stdout.flush()
    try:
        os.unlink(state_path("pid"))
    except OSError:
        pass
    os._exit(code)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--repo", default=REPO_DEFAULT)
    ap.add_argument("--token-file", help="read the API token from this file")
    sub = ap.add_subparsers(dest="cmd", required=True)
    w = sub.add_parser("watch", help="follow CI on a commit to its verdict")
    w.add_argument("sha", nargs="?", help="commit to gate (default: the branch head)")
    w.add_argument("--branch", help="branch whose head to watch (default: the current one)")
    w.add_argument("--once", action="store_true", help="one snapshot; exit 2 while running")
    w.add_argument("--detach", action="store_true", help="watch in the background")
    w.add_argument("--tail", action="store_true", help="print the background log")
    w.add_argument("--stop", action="store_true", help="stop the background watcher")
    w.add_argument("--lines", type=int, default=40, help="lines for --tail")
    w.add_argument("--timeout", type=int, default=1800, help="seconds to wait")
    w.add_argument("--appear", type=int, default=300,
                   help="seconds to wait for the run to appear")
    w.add_argument("--poll", type=int, default=10, help="seconds between polls")
    w.add_argument("--json", action="store_true")
    args = ap.parse_args()
    if args.tail:
        return tail(args)
    if args.stop:
        return stop()
    if args.detach:
        return detach(args)
    return watch(args)


if __name__ == "__main__":
    sys.exit(main())
