# Firstlight sprites (Formara, v1, Oct 29 2026)
All art follows `design/ART-DIRECTION.md`: top-left light, dark-brown outlines, Stone Age palette.
Load with `pixelArt: true`, scale by whole numbers (3x or 4x). Regenerate with `python3 gen_sprites.py`.

| File | Frame size | Frames (left to right) | Suggested fps |
|---|---|---|---|
| player.png | 16x24 | 0-3 walk, 4-5 idle, 6-8 chop/mine (7 = smear) | walk 8, idle 2, chop 10 |
| villager_a.png | 16x24 | same layout as player (hide wrap) | same |
| villager_b.png | 16x24 | same layout (green tunic, headband) | same |
| raptor.png | 32x24 | 0-3 run, faces right (flip for left) | 10 |
| shadow_creature.png | 24x24 | 0-2 float/bob | 6 |
| tree.png | 32x48 | 0-1 sway | 2 |
| rocks.png | 16x16 | 0 boulder (stone), 1 flint, 2 clay | static |
| hut.png | 48x48 | 0 blueprint ghost, 1 frame, 2 half walls, 3 finished | swap by build % |

Phaser: `this.load.spritesheet('player','assets/sprites/player.png',{frameWidth:16,frameHeight:24})`.
Origin suggestion: characters (0.5, 1) so feet sit on the tile. Characters face right; use `flipX` for left.
`preview.png` shows everything at 4x.

## Books (v1)
| File | Frame size | Frames | Notes |
|---|---|---|---|
| book.png | 16x16 | 0 closed (inventory icon), 1 open, 2 open with glow | world pickup / hotbar |
| lectern.png | 16x32 | 0 empty, 1 with book, 2 with torch glow | place-able stand; origin (0.5,1) |
| reader_frame.png | 48x48 | single 9-slice, 16px corners | use `this.add.nineslice(...,16,16,16,16)` for the reader panel |
| reader_tab.png | 24x12 | 0 normal, 1 selected | chapter tabs along the reader top |
Reader text: bark `#4A3420` on parchment `#EFE3C8`; words of Christ in danger red `#C2412F`.

## Ores, chests, trader (v1, `gen_ores_chests.py`)
| File | Frame size | Frames | Notes |
|---|---|---|---|
| ore_tiles.png | 16x16 | 0 cave stone, 1 copper, 2 tin, 3 iron, 4 coal, 5 silver, 6 gold, 7-9 Glowstone pulse (7 base, 8 soft glow, 9 bright + glints) | layer-1 tiles; Glowstone pulse 7-8-9-8 at 4 fps; names match WEAPONS-CRAFTING.md |
| chests.png | 16x16 | 0-2 wooden (beat-up), 3-5 stone, 6-8 ornate guarded; each closed, opening, open | play opening at 8 fps, hold on open |
| chest_sparkle.png | 16x16 | 0-2 sparkle grow | overlay on chest at open, 10 fps, then destroy |
| trader.png | 16x24 | 0-3 walk, 4-5 idle | wide hat, blue robe, big pack + staff; faces right, origin (0.5,1) |
`preview_ores_chests.png` shows everything at 4x.

## Tools & weapons (v1, `gen_tools.py`)
| File | Frame size | Frames | Notes |
|---|---|---|---|
| tools.png | 16x16 | 0 Flint Axe, 1 Stone Axe, 2 Bronze Axe, 3 Iron Axe, 4 Stone Pick, 5 Bronze Pick, 6 Iron Pick, 7 Flint Spear, 8 Copper Spear, 9 Bronze Spear, 10 Iron Spear, 11 Crystal Spear, 12 Bone Knife, 13 Copper Knife, 14 Copper Axe, 15 Copper Pick, 16 Flint Sword, 17 Copper Sword, 18 Bronze Sword, 19 Iron Sword, 20 Club, 21 Shears | inventory/hotbar icons, head points up-right; names match WEAPONS-CRAFTING.md |
| workbench.png | 32x16 | 0 idle, 1 in use (flint chips/sparks) | texture key `workbench` (what firstlight-weapons-stage/CHANGES.md asks for); 2 tiles wide, bench with hammerstone, flint core, axe |
`preview_tools.png` shows tools + workbench at 4x.

## Transport (v1, `gen_transport.py`)
| File | Frame size | Frames | Notes |
|---|---|---|---|
| drag_sled.png | 16x16 | 0 still, 1 dragging (lifted, tow rope up, dust) | faces right, rope off right edge |
| raft.png | 32x16 | 0-1 bob (1px) | log raft with cord lashings, 3 fps |
| canoe.png | 32x16 | 0 paddle right, 1 paddle left + splash | bob 1px between frames, 4 fps |
| cart.png | 32x24 | 0-2 wheel rotation | shafts point right to the horse; 8 fps while moving |
| rails.png | 16x16 | 0 horizontal, 1 vertical, 2 corner N-E, 3 corner N-W, 4 corner S-E, 5 corner S-W, 6 end stop (east) | flipX the end stop for west |
| minecart.png | 16x16 | 0 empty, 1 loaded + wheel shift | roll 6 fps |
`preview_transport.png` shows everything at 4x.
