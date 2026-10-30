# Title menu draft (Formara) — for Dotorion to wire in
Files: `title-menu.html` (replaces the `#title` block), `title-menu.css`, `title-menu.js`.
- Tabs: **Play** (save slots + seed), **Host** (big button, then shows the room code with Copy), **Join** (large code box, Enter submits), **Settings** (music, sounds, read-aloud, touch controls, reduce motion, export/import).
- All existing ids are kept, so `ui.js` keeps working. `hostBtn` moves from the in-game menu to the Host tab; replace `ui.toast('Room code: '+c)` with `FL.titleShowCode(c)`.
- Settings ids (`setMusic`, `setSfx`, `setVoice`, `setTouch`, `setMotion`, `exportBtn2`, `importBtn2`) are new and need wiring.
- Every tap target is at least 48px. Animated fog and a pixel campfire respect reduce-motion.
- `preview.html` opens the menu on its own for a look.
