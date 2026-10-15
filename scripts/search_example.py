import os

for root, dirs, files in os.walk("."):
    if any(p in root for p in ["node_modules", ".git", "dist", "__pycache__", ".pytest_cache", ".gemini"]):
        continue
    for f in files:
        p = os.path.join(root, f)
        if p.endswith("learningContent.js") or p.endswith("syllabus.js") or p.endswith(".pyc") or p.endswith(".sqlite"):
            continue
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as fl:
                c = fl.read()
                if "example" in c.lower():
                    matches = [
                        (idx + 1, line.strip())
                        for idx, line in enumerate(c.split("\n"))
                        if "example" in line.lower()
                    ]
                    if matches:
                        print(f"=== {p} ({len(matches)} matches) ===")
                        for lnum, line in matches[:8]:
                            print(f"  [{lnum}] {line[:120]}")
        except Exception:
            pass
