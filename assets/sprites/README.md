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
