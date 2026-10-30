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
