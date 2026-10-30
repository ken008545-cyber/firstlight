# Transport numbers: Radix review of Formara's TRANSPORT.md (Oct 29 2026)
Source reviewed: /workspace/firstlight/design/TRANSPORT.md (no copy exists at /workspace/formara-staging). Her file is unedited.
Base values: player walk = 150 px/s = 4.7 tiles/s (game.js:614, T = 32). Raptor chase = 105 px/s (game.js:522). Shell values and tiers come from WEAPONS-CRAFTING.md §2c.

| Item | Formara | Radix | Shells | Reason |
|---|---|---|---|---|
| Drag sled | 4 Wood + 2 Cordage, hand, 80% walk (120 px/s), +8 slots | **Approved** | 12 | Cheap Stone Age item. 120 px/s still outruns a raptor (105). |
| Raft | 6 Wood + 3 Cordage, hand, 60% (90 px/s), 2 riders | **Approved**, durability 200 tiles of travel | 18 | The cost fits. Raptors don't swim, so the slow speed is safe. |
| Canoe | 8 Wood + 2 Hide + 1 Flint Axe use, Workbench, 140% (210 px/s) | **Approved**, with "Flint Axe use" written as −5 durability on the axe | 16 + wear | Workbench tier fits. "1 use" needed a number. |
| Horse cart | 10 Wood + 4 Cordage + 2 Leather, Workbench, off-road 70% | Cost **approved**. Add speed: **200% (300 px/s) on road, 140% off-road**. Also need the horse's own speed from Mythorion | 42 | Her doc gave only the off-road penalty and no base speed. A cart must beat walking or nobody builds it. |
| Rails | 1 Iron Bar + 2 Wood per 4 tiles | **Adjusted**: Wood Rail (Workbench) = 2 Wood + 1 Cordage per 4 tiles, max 1.5× cart speed. Iron Rail (Anvil) = 1 Iron Bar + 2 Wood per 4 tiles, full speed | 6 / 22 per 4 tiles | Iron needs a Bronze Pick and the Bloomery, so iron-only rails can't help with the first copper and tin mines. A cheap wooden rail tier fills that gap. |
| Minecart | No recipe or speed given | **Add**: 6 Wood + 2 Copper Bar, Workbench. Speed 250% (375 px/s) on Iron Rail, 150% on Wood Rail. 8 slots | 22 | Missing numbers. A Copper tier cart matches when mines open. |

Flags (not numbers):
- **E key clash:** E opens the bag, and V is now taken by the staged craft menu. Suggest **H** for board, hitch and push (Dotorion to confirm it's free).
- **Furniture grid:** her doc says furniture snaps to a 16 px grid, but game tiles are T = 32. Use 32, or call it a half-tile on purpose.
- **Durability:** sled 150, canoe 250, cart 400, minecart 400 (worn per tile moved / 10). Repair at 50% of the recipe cost, the same rule as WEAPONS-CRAFTING.md.
