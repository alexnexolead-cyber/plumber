# Verification

- All 11 pages checked in headless Chrome at 320, 375, 390, 430, 768, 1024 and 1440px (77 page/viewport checks).
- No horizontal page overflow. Mobile hero content/forms stack vertically.
- All seven mobile hero photos use contain and the exact original aspect ratio. Original photo dimensions were read from the local files; no image assets were modified.
- WhatsApp is inside the mobile bottom-action area and body bottom padding clears that area.
- At 1024 and 1440px, representative computed dimensions/styles for hero, navbar, topbar, pricing and booking card match a version with this new block disabled.
- SHA-256 checks confirm all HTML and JavaScript files are untouched; original CSS is an exact prefix of the updated file.
- Rollback --check returns an exact match to the saved stylesheet. An actual rollback was also run in an isolated temporary copy and restored the saved CSS and guide byte for byte.
- Screenshots in screenshots/ show the homepage and leak hero, trust/booking, pricing and process areas at 390px.

This is browser emulation, not testing on physical iOS/Android devices. Existing external sample images/fonts/map requests were blocked during the layout checks to keep the run independent of external services. All hero photos are local and loaded from the local server.
