# Borrowed patterns (ideas only, no code copied yet)
- Fog: per-tile state grid 0=black,1=dim(explored),2=lit; a screen-sized RenderTexture filled #1E2228@0.85 with
  inverted BitmapMask / erase() circles at torches each frame (Ourcade blog, 2020). Persist "explored" grid as bitset in save.
- Tilemap: Phaser createBlankLayer + putTileAt from seeded noise; shadow layer with per-tile alpha (mikewesthad/phaser-3-tilemap-blog-posts post-3).
- Crafting/inventory: data-driven RECIPES table -> canCraft(inv) sorts craftable first, missing counts in red.
- Villager AI: small finite-state machine (idle -> seekTask -> gather -> return -> sleep at night near fire).
