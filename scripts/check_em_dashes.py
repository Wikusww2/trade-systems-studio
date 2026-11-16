"""Governance gate: fail the build on em-dash violations.

Scans every tracked source and documentation file for the em-dash character
(U+2014) and the en-dash (U+2013) used as a prose dash.

Runs correctly from any working directory: the scan root is resolved relative to
this script, not relative to the shell's cwd.
"""

import os
import sys

# Resolve the scan root from the script location so the gate behaves identically
# whether it runs from the repo root, from backend-engine, or from CI.
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXCLUDE_DIRS = {
    ".venv", "node_modules", ".next", ".git", "__pycache__",
    ".pytest_cache", "out", "dist", "build", ".hyperframes", "legacy",
}
EXTENSIONS = (".tsx", ".ts", ".md", ".py", ".json", ".jsonc", ".css", ".html", ".yml", ".yaml")

EM_DASH = "\u2014"
EN_DASH = "\u2013"


def main() -> int:
    violations: list[tuple[str, int]] = []
    scanned = 0

    for dirpath, dirnames, filenames in os.walk(REPO_ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for filename in filenames:
            if not filename.endswith(EXTENSIONS):
                continue
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
            except (OSError, UnicodeDecodeError):
                continue
            scanned += 1
            count = content.count(EM_DASH)
            if count:
                violations.append((os.path.relpath(filepath, REPO_ROOT), count))

    if violations:
        print(f"FAILED: Found {len(violations)} files containing em-dash ({EM_DASH}):")
        for filepath, count in violations:
            print(f"  {filepath} ({count} instances)")
        return 1

    print(f"SUCCESS: 0 em-dashes found across {scanned} audited files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
