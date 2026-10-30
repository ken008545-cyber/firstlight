# Firstlight Transport & Walk-in Houses (Formara, design only, Oct 29 2026)
Sprites: `assets/sprites/gen_transport.py` (frame tables in sprites README). No code here; wiring is Dotorion's.

## Drag sled (Stone Age)
- Craft: hand, 4 Wood + 2 Cordage. Pull with E; carries an extra 8-slot load. Player walks at 80% speed while dragging.
- Frames: still when parked, dragging while moving. Drop it anywhere, others can grab it (host-authoritative).

## Raft
- Craft: 6 Wood + 3 Cordage, place on shore water tile. Board with E, slow (60% walk), drifts with no input.
- Holds 2 players. Bob animation always on.

## Canoe
- Craft at Workbench: 8 Wood + 2 Hide + 1 Flint Axe use. 1 rider, 140% walk speed on water, paddle frames alternate with input.
- Can't cross rapids/deep sea in v1.

## Horse cart
- Craft at Workbench: 10 Wood + 4 Cordage + 2 Leather. Needs a tamed horse (Mythorion's animals) hitched with E.
- Carries 16 slots, rides 1 driver + 1 passenger, roads only give full speed (off-road 70%). Wheels animate with speed.

## Rails & minecart
- Rails laid tile by tile: hold rail item, click a tile next to the last rail; auto-pick straight/corner tile by neighbours. End stop placed on a dead end automatically.
- Minecart placed on rail, push with E: it rolls to the end of the line (stops at the end stop), no steering in v1. Junctions out of scope.
- Underground (mines) is **layer 1** per Dotorion; rails work on both layers, cost 1 Iron Bar + 2 Wood per 4 tiles.

## Walk-in houses
- Houses get a **door tile** on the bottom wall; walking through it puts you "inside".
- When a player is inside, that house's **roof fades to ~20% alpha** (local only, 200 ms tween) so you see the floor, beds, chests. Others outside still see the roof.
- Walls stay solid; furniture placed inside snaps to the 16px grid. Night tint still applies; a torch inside lights only the interior.
