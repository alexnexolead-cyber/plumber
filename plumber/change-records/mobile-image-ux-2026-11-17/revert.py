#!/usr/bin/env python3
"""Revert only this mobile CSS block, preserving later CSS outside the block."""
from pathlib import Path
import hashlib
import json
import sys
from zipfile import ZipFile, ZIP_DEFLATED

record = Path(__file__).resolve().parent
root = record.parents[1]
css = root / 'styles.css'
start = '\n/* BEGIN mobile-image-ux-2026-11-17'
end = '/* END mobile-image-ux-2026-11-17 */\n'
text = css.read_text()
if text.count(start) != 1 or text.count(end) != 1:
    raise SystemExit('Expected change block is missing or duplicated; no files changed.')
begin = text.index(start)
finish = text.index(end, begin) + len(end)
reverted = text[:begin] + text[finish:]
original = (record / 'before/styles.css').read_text()
print('Change block located. HTML, JavaScript and photos will not be touched.')
print('CSS after revert matches saved original:', reverted == original)
if '--check' in sys.argv:
    raise SystemExit(0)
css.write_text(reverted)
after = json.loads((record / 'after-sha256.json').read_text())
guide = root / 'EDITS-GUIDE.md'
if hashlib.sha256(guide.read_bytes()).hexdigest() == after['EDITS-GUIDE.md']:
    guide.write_bytes((record / 'before/EDITS-GUIDE.md').read_bytes())
    print('Editing guide restored from the saved copy.')
else:
    print('Guide has later edits; kept it intact. Its mobile-change notes may need updating.')
with ZipFile(root / 'plumbing-site.zip', 'w', ZIP_DEFLATED) as archive:
    for path in sorted(root.iterdir()):
        if path.is_file() and path.suffix in {'.html', '.css', '.js', '.md'}:
            archive.write(path, path.name)
    for folder in ['pics', 'change-records']:
        for path in sorted((root / folder).rglob('*')):
            if path.is_file() and '__pycache__' not in path.parts:
                archive.write(path, path.relative_to(root))
print('Mobile fixes reverted and site ZIP refreshed. Later CSS outside this block was retained.')
