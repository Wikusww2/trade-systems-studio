"""Governance gate: fail the build on em-dash and prose en-dash violations.

Scans every tracked source and documentation file line-by-line for:
1. Em-dash character (U+2014) - strictly forbidden anywhere.
2. En-dash character (U+2013) used as a prose dash (legitimate numeric, date,
   or series ranges such as 150-350, $160k-$260k, 2024-Present, Series A-C,
   or regex character classes are permitted).

Reports violations in standard compiler format:
  <rel_path>:<line_no>:<col_no>: em-dash found
  <rel_path>:<line_no>:<col_no>: prose en-dash found

Runs correctly from any working directory: the scan root is resolved relative to
this script, not relative to the shell's cwd.
"""

import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EXCLUDE_DIRS = {
    ".venv", "node_modules", ".next", ".git", "__pycache__",
    ".pytest_cache", "out", "dist", "build", ".hyperframes", "legacy",
}
EXTENSIONS = (".tsx", ".ts", ".md", ".py", ".json", ".jsonc", ".css", ".html", ".yml", ".yaml")

EM_DASH = "\u2014"
EN_DASH = "\u2013"


def is_legitimate_en_dash_range(line: str, idx: int) -> bool:
    """Determine whether an en-dash at index `idx` is a legitimate range.

    Legitimate ranges include:
    - Numeric, currency, time, and percentage ranges (e.g. 150-350, $160k-$260k, 0.25x-2.0x, 0.0s-5.0s, +/-0.5%-2.0%)
    - Year and date ranges (e.g. 2024-Present, 2020-2025)
    - Alphanumeric series/phase ranges (e.g. Series A-C, Phase 0-2, Acts 1-3)
    - Character classes or string patterns in code (e.g. [,-–/])
    """
    before = line[:idx].rstrip()
    after = line[idx + 1:].lstrip()
    if not before or not after:
        return False

    # Check for character classes or regex sets: e.g. [ ... – ... ]
    if re.search(r"\[[^\]]*$", before) and re.search(r"^[^\[]*\]", after):
        return True

    # Token immediately before (strip opening punctuation like parentheses/brackets/quotes)
    m_before = re.search(r"([^\s\(\[\{\<\"\'\`]+)$", before)
    # Token immediately after (strip closing punctuation like parentheses/brackets/quotes/commas)
    m_after = re.match(r"^([^\s\)\]\}\>\"\'\`\,\.\;\:]+)", after)
    if not m_before or not m_after:
        return False

    t_before = m_before.group(1)
    t_after = m_after.group(1)

    has_digits_before = bool(re.search(r"\d", t_before))
    is_single_letter_before = bool(re.fullmatch(r"[A-Za-z]", t_before))

    has_digits_after = bool(re.search(r"\d", t_after))
    is_single_letter_after = bool(re.fullmatch(r"[A-Za-z]", t_after))
    is_present_after = bool(re.match(r"^(Present|Current)", t_after, re.IGNORECASE))

    valid_before = has_digits_before or is_single_letter_before
    valid_after = has_digits_after or is_single_letter_after or is_present_after

    return valid_before and valid_after


def main() -> int:
    violations: list[str] = []
    scanned_files = 0

    for dirpath, dirnames, filenames in os.walk(REPO_ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for filename in filenames:
            if not filename.endswith(EXTENSIONS):
                continue
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    lines = f.readlines()
            except (OSError, UnicodeDecodeError):
                continue

            scanned_files += 1
            rel_path = os.path.relpath(filepath, REPO_ROOT)

            for line_no, line in enumerate(lines, 1):
                # Check for EM_DASH
                col = 0
                while True:
                    col = line.find(EM_DASH, col)
                    if col == -1:
                        break
                    violations.append(f"{rel_path}:{line_no}:{col + 1}: em-dash found")
                    col += 1

                # Check for prose EN_DASH
                col = 0
                while True:
                    col = line.find(EN_DASH, col)
                    if col == -1:
                        break
                    if not is_legitimate_en_dash_range(line, col):
                        violations.append(f"{rel_path}:{line_no}:{col + 1}: prose en-dash found")
                    col += 1

    if violations:
        print(f"FAILED: Found {len(violations)} violation(s):")
        for v in violations:
            print(f"  {v}")
        return 1

    print(f"SUCCESS: 0 dash violations found across {scanned_files} audited files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
