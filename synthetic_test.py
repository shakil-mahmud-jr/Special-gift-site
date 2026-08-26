import os
import re

base_dir = r"c:\Users\hp\.gemini\antigravity\scratch\wife_birthday_website"
html_path = os.path.join(base_dir, "index.html")
css_path = os.path.join(base_dir, "styles.css")
js_path = os.path.join(base_dir, "script.js")

print("=== STARTING SYNTHETIC DIAGNOSTIC TEST ===")

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

issues = []

# 1. Test image and audio src attributes
sources = re.findall(r'src=["\'](.*?)["\']', html_content)
print("\n[TEST 1] Checking HTML src attributes:")
for src in sources:
    if src.startswith("http") or src.startswith("data:"):
        print(f"  Inline or External asset: '{src[:30]}...'")
        continue
    if not src:
        print("  [ISSUE] Found empty src='' attribute in HTML!")
        issues.append("Empty src='' attribute in HTML for #lightboxImage causing broken image box rendering")
        continue
    clean_src = src.replace("%20", " ")
    full_path = os.path.join(base_dir, clean_src)
    exists = os.path.exists(full_path)
    print(f"  src='{src}' -> Exists on disk: {exists}")
    if not exists:
        issues.append(f"Missing HTML asset: {src}")

# 2. Test openLightbox inline handlers
lightbox_args = re.findall(r'openLightbox\((.*?)\)', html_content)
print("\n[TEST 2] Checking openLightbox onclick parameters:")
for arg_str in lightbox_args:
    parts = [p.strip().strip("'\"") for p in arg_str.split(",")]
    if parts:
        img_path = parts[0]
        full_path = os.path.join(base_dir, img_path)
        exists = os.path.exists(full_path)
        print(f"  openLightbox path='{img_path}' -> Exists on disk: {exists}")
        if not exists:
            issues.append(f"Missing Lightbox image: {img_path}")

# 3. Test lightbox modal visibility & display properties
print("\n[TEST 3] Checking Lightbox modal initial display state:")
if 'id="lightboxModal"' in html_content:
    modal_tag = html_content.split('id="lightboxModal"')[0].split('<div')[-1] + 'id="lightboxModal"' + html_content.split('id="lightboxModal"')[1].split('>')[0]
    if 'hidden' not in modal_tag:
        print("  [ISSUE] #lightboxModal missing 'hidden' class in HTML tag!")
        issues.append("#lightboxModal does not have 'hidden' class initially, causing empty img tag rendering in viewport!")
    else:
        print("  OK: #lightboxModal has 'hidden' class.")

# 4. Check CSS lightbox rule
print("\n[TEST 4] Checking CSS .lightbox rule:")
if '.lightbox' in css_content:
    if 'display: none' not in css_content:
        print("  [ISSUE] .lightbox CSS rule lacks 'display: none' property.")
        issues.append("CSS .lightbox lacks 'display: none' fallback.")

print("\n=== SYNTHETIC DIAGNOSTIC RESULTS ===")
if issues:
    print(f"FAILED - Found {len(issues)} issue(s):")
    for idx, issue in enumerate(issues, 1):
        print(f"  {idx}. {issue}")
else:
    print("SUCCESS - All synthetic tests passed cleanly!")
