# Firstlight — Villager Memory, Books & Bible Storage (plan, Radix)
Design only; no game code touched. All storage local (IndexedDB) and static (GitHub Pages) = **$0**.

## 1. Memory entry schema (one record)
| Field | Type | Bytes (JSON) | Notes |
|---|---|---|---|
| id | uint32 | ~8 | per-villager counter |
| t | int (game day*24+hour) | ~6 | when it happened |
| kind | enum str (`met`,`gift`,`hurt`,`fed`,`built`,`saw`,`talk`,`loss`) | ~6 | |
| who | str id (player/villager/creature) | ~10 | |
| where | [x,y] tile | ~12 | |
| text | str, **cap 80 chars** | ≤90 | short summary, shown/talked about |
| mood | int −3..+3 | ~3 | emotional charge |
| w | float 0–1 (2 dp) | ~5 | current weight |
| pin | bool | ~5 | core memories never evicted |
| keys + punctuation | | ~70 | |
Typical **~150 B**, worst **~220 B** per entry.

## 2. Cap
- **32 entries per villager**, of which **max 4 pinned** (first meeting, named by player, a death, a big gift).
- Repeated identical events merge (bump `w`, update `t`) instead of new rows.

## 3. Fading / decay
- Start weight: `w0 = 0.3 + 0.15*|mood|` (cap 1.0). Pinned: w = 1, no decay.
- Half-life **7 game days** (`w = w0 * 0.5^(age/7)`), recomputed once per in-game dawn.
- Recall (villager mentions or player asks about it) refreshes: `w = min(1, w+0.2)`.
- Below **0.05** → forgotten (deleted) at dawn.
- Full (32) when adding → evict lowest `w` non-pinned; tie → oldest.

## 4. IndexedDB layout & size
- DB `firstlight`, stores: `saves` (existing `serialize()` JSON), `memories` (key `villagerId`, value array), `books` (§5).
- Per villager: 32 × 150 B ≈ **4.8 KB** (worst 7 KB).
- 25 villagers: **~120 KB** (worst ~175 KB); ×3 save slots ≈ 0.5 MB.
- Browser quotas: Chrome/Edge up to ~60% of free disk per origin; Firefox ~10% of disk (group cap); Safari ~1 GB then prompts/evicts after 7 days idle unless installed. We use <1% of any quota. Call `navigator.storage.persist()` once to reduce eviction risk.
- Write on dawn + on save; one transaction per save.

## 5. Player-writable books
| Field | Type | Cap |
|---|---|---|
| id | str uuid | 36 B |
| title | str | 60 chars |
| author | str (player or villager) | 30 chars |
| created / edited | game time int | |
| pages | str[] | **max 50 pages × 600 chars** |
| sealed | bool | sealed = read-only (like signed books) |
| copies | int | in-world copies (scribe job) |
- Max book ≈ 30 KB raw text (UTF-8 up to ~4 B/char for non-Latin → hard cap 120 KB).
- Library cap **200 books per save** → worst ~6 MB, typical <1 MB. Still tiny vs quotas.
- Store: `books` keyed by `id`; the in-world item holds only `bookId`. Export/import as `.json` file for sharing (no server).
- Sanitize on render (textContent only, never innerHTML).

## 6. Bible text: measured (per-chapter lazy files)
Format measured: one minified JSON array of verse strings per chapter, e.g. `bible/kjv/PSA/119.json`. Gzip = what Pages sends over the wire.
| | KJV raw | KJV gzip | WEB raw | WEB gzip |
|---|---|---|---|---|
| Chapter files | 1,189 | | 1,189 | |
| Typical (median) chapter | ~3.4 KB | ~1.35 KB | 3.2 KB | 1.36 KB |
| Largest file (Psalm 119) | 13.4 KB | 4.4 KB | 13.2 KB | 4.4 KB |
| Genesis (whole book) | 202 KB | 58 KB | 194 KB | 57 KB |
| Psalms (whole book) | — | — | 227 KB | 72 KB |
| Whole Bible, 1 file | 4.25 MB | 1.22 MB | 4.10 MB | 1.20 MB |
| All 1,189 chapter files | 4.21 MB | 1.68 MB* | 4.10 MB | 1.68 MB* |
\*sum of individually gzipped files.
- GitHub Pages limits: **100 MB per file** → largest file is 13 KB (~0.013% of limit). **1 GB per site** → both translations together ≈ 8.3 MB (<1%).
- Recommendation: per-chapter files, fetched on demand and cached into IndexedDB store `scripture` after first read (offline reading). Optional small `index.json` (book names + chapter counts, ~3 KB).
- Both KJV and WEB are public domain — no licence cost.

## 7. Sources
- KJV JSON: https://github.com/thiagobodruk/bible (`json/en_kjv.json`, raw.githubusercontent.com).
- WEB (engwebp, verse-per-line): https://ebible.org/Scriptures/engwebp_vpl.zip (ebible.org/web — public domain).
- GitHub Pages limits: docs.github.com/pages → "GitHub Pages limits" (1 GB site, 100 MB file).
- Quotas: MDN "Storage quotas and eviction criteria".
