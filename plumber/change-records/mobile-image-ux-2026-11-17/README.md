# Mobile image and UI fixes — 17 November 2026

Requested scope: correct mobile photo cropping and the highlighted topbar, trust-row, pricing and process spacing issues without changing page structure or desktop design. Record the changes so they can be reverted.

## Files changed

- `styles.css`: one clearly marked block at the end, scoped to screens 768px and below (additional topbar rules at 480px and below).
- `EDITS-GUIDE.md`: current mobile behavior and refreshed editable line inventory.
- `plumbing-site.zip`: regenerated from the current site, including local photos and this change record.

All 11 HTML files, JavaScript, image files and service URLs remain unchanged. Original CSS is retained byte for byte before the new block. Saved originals for CSS and guide are in `before/`; source fingerprints are in `before-sha256.json`.

## Behavior changed on mobile

1. Homepage and six service hero photos use their original width/height ratio and `contain`, in a full-width photo area above existing content. This prevents a very tall booking form from forcing severe `cover` cropping. No photos were stretched, edited or recompressed. Non-photo About/Areas/Contact/Gallery heroes are retained.
2. Inline service and gallery images keep natural height instead of their fixed desktop crop height.
3. Hero text/forms retain the existing navy, gold and white styles and single-column structure. Trust badges form an evenly spaced vertical group.
4. Pricing gutters align with the existing service-card gutters. Pricing and process headings/copy have balanced wrapping and smaller excess gaps.
5. Topbar information wraps coherently, with the existing small-screen middle-item visibility retained. Navbar brand stays on one line; the existing telephone action appears as a readable phone icon, with its original accessible number and link text still in the HTML.
6. WhatsApp sits inside reserved space in the mobile bottom-action area. The redundant floating emergency button is hidden on mobile; the persistent Call and Book buttons remain. Desktop floating controls are unchanged.

## Revert

From the site folder, first verify the recorded block:

```bash
python3 change-records/mobile-image-ux-2026-11-17/revert.py --check
```

To revert this change:

```bash
python3 change-records/mobile-image-ux-2026-11-17/revert.py
```

The script removes only the marked mobile block, preserving later CSS appended outside it. It restores the old editing guide only if the guide has not changed since this delivery, and refreshes the ZIP. It leaves HTML, JavaScript, photos and this historical record intact. It stops without editing files if the markers cannot be identified safely. You can also manually remove the block between `BEGIN mobile-image-ux-2026-11-17` and `END mobile-image-ux-2026-11-17`.

Do not blindly copy the complete old stylesheet over a version containing later work. `before/styles.css` is a complete emergency reference, while the script is the targeted rollback.
