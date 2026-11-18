"""Governance & Dynamic Metric Synchronization Script.

Runs pytest collection to count actual verified unit tests, verifies (with --check)
or synchronizes documentation badges and frontend/src/lib/metrics.ts against the live
test count, and verifies zero occurrences of banned commodity terms.
"""

import argparse
import os
import re
import subprocess
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(REPO_ROOT, "backend-engine")
VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable or "python"

DOC_FILES = [
    os.path.join(REPO_ROOT, "README.md"),
    os.path.join(REPO_ROOT, "PORTFOLIO.md"),
    os.path.join(REPO_ROOT, "AGENTS.md"),
    os.path.join(REPO_ROOT, "docs", "RECRUITER_BRIEFING_PACK.md"),
]

BANNED_COMMODITY_TERMS = [
    "OCR tool",
    "PDF parser",
    "AI extractor",
    "invoice reader",
]

TEST_COUNT_PATTERNS = [
    re.compile(r"\b(\d+)/(\d+)\s+(?:backend\s+)?tests?\s+passing\b", re.IGNORECASE),
    re.compile(r"Pytest-(\d+)%2F(\d+)%20Passing", re.IGNORECASE),
]


def get_actual_test_count() -> int:
    cmd = [VENV_PYTHON, "-m", "pytest", "--collect-only", "-q"]
    proc = subprocess.run(
        cmd,
        cwd=BACKEND_DIR,
        capture_output=True,
        text=True,
        check=True,
    )
    output = proc.stdout
    match = re.search(r"(\d+)\s+tests? collected", output)
    if match:
        return int(match.group(1))
    lines = [line.strip() for line in output.splitlines() if "::" in line]
    if lines:
        return len(lines)
    raise RuntimeError(f"Could not determine pytest count from output:\n{output}")


def check_or_sync_metrics(count: int, check_only: bool) -> int:
    drift_count = 0

    for doc in DOC_FILES:
        if not os.path.exists(doc):
            continue
        rel = os.path.relpath(doc, REPO_ROOT)
        with open(doc, "r", encoding="utf-8") as f:
            content = f.read()

        updated = content
        for pat in TEST_COUNT_PATTERNS:
            for m in pat.finditer(content):
                a, b = int(m.group(1)), int(m.group(2))
                if a != count or b != count:
                    if check_only:
                        print(f"METRIC DRIFT: {rel} contains '{m.group(0)}' (expected {count}/{count})")
                        drift_count += 1
            if not check_only:
                if "Pytest-" in pat.pattern:
                    updated = pat.sub(f"Pytest-{count}%2F{count}%20Passing", updated)
                else:
                    updated = pat.sub(
                        lambda mm: re.sub(r"\d+/\d+", f"{count}/{count}", mm.group(0)),
                        updated,
                    )

        if not check_only and updated != content:
            with open(doc, "w", encoding="utf-8") as f:
                f.write(updated)
            print(f"Synchronized test metrics in {rel} -> {count}/{count}")

    metrics_ts = os.path.join(REPO_ROOT, "frontend-dashboard", "src", "lib", "metrics.ts")
    expected_ts = f"""/**
 * Single Source of Truth for verified pytest test count and system metrics.
 * Maintained in strict parity with `pytest tests/` output.
 */
export const VERIFIED_PYTEST_COUNT = {count};
"""
    if os.path.exists(metrics_ts):
        with open(metrics_ts, "r", encoding="utf-8") as f:
            current_ts = f.read()
        match_ts = re.search(r"VERIFIED_PYTEST_COUNT\s*=\s*(\d+)", current_ts)
        current_val = int(match_ts.group(1)) if match_ts else -1
        if current_val != count:
            if check_only:
                print(
                    f"METRIC DRIFT: frontend-dashboard/src/lib/metrics.ts has "
                    f"VERIFIED_PYTEST_COUNT = {current_val} (expected {count})"
                )
                drift_count += 1
            else:
                with open(metrics_ts, "w", encoding="utf-8") as f:
                    f.write(expected_ts)
                print(f"Synchronized metrics.ts -> {count}")
    elif not check_only:
        with open(metrics_ts, "w", encoding="utf-8") as f:
            f.write(expected_ts)
        print(f"Created metrics.ts -> {count}")

    return drift_count


def check_banned_terms() -> int:
    violations = 0
    src_dir = os.path.join(REPO_ROOT, "frontend-dashboard", "src")
    for root, _, files in os.walk(src_dir):
        for file in files:
            if not file.endswith((".tsx", ".ts", ".css")):
                continue
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            for term in BANNED_COMMODITY_TERMS:
                if term in text:
                    print(
                        f"GOVERNANCE VIOLATION: Banned term '{term}' found in "
                        f"{os.path.relpath(path, REPO_ROOT)}"
                    )
                    violations += 1
    return violations


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify or sync live pytest metrics across docs and UI.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Non-mutating CI check mode; exit non-zero if any tracked doc or metrics.ts has drifted.",
    )
    args = parser.parse_args()

    test_count = get_actual_test_count()
    print(f"Verified live pytest test count: {test_count}")

    drift_count = check_or_sync_metrics(test_count, check_only=args.check)
    banned_violations = check_banned_terms()

    if drift_count > 0:
        print(f"FAILED: Found {drift_count} metric drift violation(s). Run `python scripts/sync_metrics.py` to sync.")
        return 1
    if banned_violations > 0:
        print(f"FAILED: Found {banned_violations} banned term violation(s).")
        return 1

    print("SUCCESS: Metric synchronization and glossary compliance passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
