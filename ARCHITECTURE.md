# Firstlight architecture (v0.1) — multiplayer-ready seams

Co-op (host-authoritative, peer-to-peer, join by code) is planned. No networking is built yet; v0.1 prepares for it with these seams:

## 1. Commands
All player-driven changes go through `World.exec(cmd)` in `js/game.js`. A command is plain JSON:

| t | fields | effect |
|---|---|---|
| `input` | `mx, my, act` | movement vector + held action (sent every frame by local input) |
| `act` | `tile?` | attack / gather / help build |
| `goto` | `x, y` | path to tile (tap-to-move, auto-gather) |
| `craft` | `out` | craft a recipe by output name |
| `deposit` | — | deposit carried goods at nearby storage |
| `torch` | — | plant a torch |
| `select` | `slot` | choose hotbar slot |
| `place` | `type, x, y` | place a build blueprint |

`cmd.pid` picks the player (defaults to the local `p1`). Keyboard, touch, tap and the DOM UI all send commands, so they never mutate state directly. `World.onCommand` is an empty hook where a future net layer can forward commands to the host.

## 2. Multiple players
`World.players` is keyed by id; `addPlayer(id)` / `removePlayer(id)` exist. Each player owns `inv`, `hotbar`, `sel`, `hp`, `input`. `exec` / `as(id, fn)` bind the acting player, so `this.player`, `this.inv` etc. resolve to that player. Every player steps each frame (`stepPlayer`), every player's torch lights the map, enemies target all players, and toasts and hotbar refreshes only show for the local player.

## 3. Serializable state
`serialize()` returns plain JSON: seed, time, object diffs, buildings, villagers, tribe storage, explored bitset and `players[]`. The world is regenerated from the seed plus diffs, which suits a join snapshot.

## Known coupling still to remove before networking
- Entities (players, villagers, enemies) are Phaser `Image` objects that carry their sim fields. Next step: plain entity records plus a render sync pass.
- Simulation runs in `update()` with `Math.random()`. A host-authoritative sim is fine with that (clients only render snapshots), but deterministic lockstep would need the seeded RNG.
- Fog and explored state are shared per world (tribe-wide), and the camera and UI follow `local` only.
