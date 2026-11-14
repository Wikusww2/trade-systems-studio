import os
import sys

def main():
    root = "trade-systems-studio"
    exclude_dirs = {".venv", "node_modules", ".next", ".git", "__pycache__", ".pytest_cache"}
    extensions = (".tsx", ".ts", ".md", ".py", ".json")
    em_dash = "\u2014"
    
    violations = []
    
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        content = f.read()
                        if em_dash in content:
                            count = content.count(em_dash)
                            violations.append((filepath, count))
                except Exception as e:
                    pass

    if violations:
        print(f"FAILED: Found {len(violations)} files containing em-dash ({em_dash}):")
        for filepath, count in violations:
            print(f"  {filepath} ({count} instances)")
        sys.exit(1)
    else:
        print("SUCCESS: 0 em-dashes found across all audited files.")
        sys.exit(0)

if __name__ == "__main__":
    main()
