# Firstlight: Weapons and Crafting (Radix, draft v2, Oct 29 2026)

> **Ruled 2026-10-29 by Dotorion:** weapons and tools never stack; each takes its own bag slot with its own durability; food and materials keep stacking. Real enemy HP from `game.js:482`: raptor 9, shadow 4 (raptor hits 2 per 1.2s, shadow 1 per 1s). Damage tables below are tuned to these real numbers (v2). No code until the current wiring clears Veritor.
Design only; no code touched. Names, costs and style match `js/data.js` (`FL.RECIPES`, `FL.BUILD`), `js/items-data.js` (`FL.STACK`, `FL.ITEM_DESC`), `js/food.js` (host-authoritative `exec`) and `SYSTEMS.md` §1–2.
"v0.1" = already in code; everything else is proposed. Taming, riding and farm animals belong to Mythorion; carts and boats to Formara (see §7 Interfaces).

## 1. New materials
| Item | Source | Stack | Notes |
|---|---|---|---|
| Flint (v0.1) | Rock 45% | 20 | |
| Bone (v0.1) | Old bones | 20 | |
| Feather | Bird kill, raptor 30% | 30 | arrow fletching |
| Sinew | Any beast kill (1) | 20 | bowstring; Cordage works at -20% bow damage |
| Sling Stone | 1 Stone → 3 (hand) | 30 | ammo |
| Arrow | 1 Wood + 1 Flint + 1 Feather → 4 (Workbench) | 40 | ammo |
| Bronze Bar | Smelter (SYSTEMS §1) | 20 | |
| Iron Bar | Bloomery (SYSTEMS §1) | 20 | |
| Leather | 2 Hide + 1 Bark/Clay Pot of water → 1 (Tanning Rack) | 20 | grips, quivers, saddle |

## 2. Weapon tiers
Damage per hit; **Hits R/S** = hits to kill raptor (9 HP) / shadow (4 HP). Durability = hits/uses. Cooldown in s. Stack 1 for all weapons (own slot, own durability).
| Weapon | Age | Recipe | Station | Dmg | Hits R/S | Range | Cooldown | Durability | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Bare hands | — | — | — | 1 | 9/4 | 1 | 0.6 | ∞ | |
| Club | Stone | 3 Wood | hand | 3 | 3/2 | 1 | 0.8 | 40 | stuns 0.3 s |
| Flint Spear (v0.1) | Stone | 3 Wood, 1 Flint, 1 Fiber | hand | 3 | 3/2 | 1.5 | 0.9 | 60 | reach |
| Flint Axe (v0.1) | Stone | 2 Wood, 1 Flint, 1 Fiber | hand | 2 | 5/2 | 1 | 0.9 | 80 | tool first; chop ×2 |
| Stone Axe | Stone | 2 Wood, 2 Stone, 2 Cordage | Workbench | 3 | 3/2 | 1 | 1.0 | 120 | chop ×2.5 |
| Bone Knife | Stone | 2 Bone, 1 Cordage | hand | 2 | 5/2 | 1 | 0.4 | 50 | +1 Hide on kill |
| Sling | Stone | 2 Cordage, 1 Hide | hand | 2 | 5/2 | 6 | 1.2 | 100 | Sling Stone ammo |
| Bow | Stone (late) | 3 Wood, 1 Sinew (or 2 Cordage) | Workbench | 4 | 3/1 | 9 | 1.4 | 120 | +Arrow; 50% recoverable |
| Copper Knife | Copper | 1 Wood, 1 Copper Bar | Anvil | 3 | 3/2 | 1 | 0.4 | 120 | fast; +1 Hide |
| Copper Spear | Copper | 2 Wood, 2 Copper Bar | Anvil | 4 | 3/1 | 1.5 | 0.9 | 140 | soft metal |
| Bronze Spear | Bronze | 2 Wood, 2 Bronze Bar, 1 Leather | Anvil | 5 | 2/1 | 1.5 | 0.9 | 200 | |
| Bronze Axe | Bronze | 2 Wood, 2 Bronze Bar | Anvil | 4 | 3/1 | 1 | 1.0 | 280 | chop ×4 |
| Bronze Sword | Bronze | 1 Wood, 2 Bronze Bar | Anvil | 5 | 2/1 | 1.2 | 0.7 | 250 | |
| Iron Spear | Iron | 2 Wood, 2 Iron Bar, 1 Leather | Anvil | 7 | 2/1 | 1.5 | 0.9 | 350 | |
| Iron Axe | Iron | 2 Wood, 3 Iron Bar | Anvil | 5 | 2/1 | 1 | 1.0 | 450 | chop ×5 |
| Iron Sword | Iron | 1 Wood, 3 Iron Bar | Anvil | 9 | 1/1 | 1.2 | 0.7 | 400 | |
| Longbow | Iron | 4 Wood, 2 Sinew, 1 Iron Bar | Workbench | 6 | 2/1 | 12 | 1.6 | 250 | +Arrow |
| Silver Blade | Iron | 1 Wood, 2 Silver Bar, 1 Iron Bar | Anvil | 5 | 2/1 | 1.2 | 0.7 | 150 | ×2 vs shadows; glows at night |
| Crystal Spear | Late | 2 Wood, 1 Glowstone, 2 Iron Bar | Anvil | 9 | 1/1 | 1.5 | 0.8 | 500 | light radius 3; rare |
| Ammo | Recipe | Dmg add |
|---|---|---|
| Arrow | 1 Wood, 1 Flint, 1 Feather → 4 (Workbench) | +0 |
| Bronze Arrow | 1 Wood, 1 Bronze Bar, 2 Feather → 8 | +1 (bow 2 hits raptor) |
| Iron Arrow | 1 Wood, 1 Iron Bar, 2 Feather → 8 | +3 (longbow 1 hit) |
Ammo damage adds to bow damage. Sling/bow without ammo: "No ammo" toast.

## 2b. Ores (all veins on underground layer 1 only)
Layer 1 is generated from the world seed like the surface (seed 12345 = same veins for everyone). Digging/tunnels = Mythorion; map storage = Dotorion. Saves hold only changed tiles keyed `"layer,x,y"`, one format for both floors (Ordion's ~5 MB limit).
| Ore | Color (Formara) | Depth / where | Mine with | Smelt at | Output |
|---|---|---|---|---|---|
| Stone, Flint (v0.1) | grey | surface rocks + all cave walls | hand / any pick | — | Stone, Flint |
| Coal (optional) | black | common, cave walls | Stone Pick | — | Coal: smelter fuel (else 2 Wood) |
| Copper | orange-green | shallow, common | Stone Pick | Smelter | 2 Copper Ore → 1 Copper Bar |
| Tin | dull silver | shallow, uncommon | Stone Pick | Smelter | 2 Copper Bar + 1 Tin Ore → 2 Bronze Bar |
| Iron | rusty red | mid, common | Bronze Pick | Bloomery | 2 Iron Ore + 1 Coal → 1 Iron Bar |
| Silver | pale white | mid, rare | Bronze Pick | Bloomery | 2 Silver Ore → 1 Silver Bar (trade, Silver Blade) |
| Gold | yellow | deep, rare | Iron Pick | Bloomery | 2 Gold Ore → 1 Gold Bar (trade only) |
| Glowstone (crystal) | glowing teal | deepest, very rare, lights tiles | Iron Pick | — (cut at Anvil) | Glowstone: Crystal Spear, lamps, top trade good |
Picks: Stone Pick = 2 Wood, 3 Stone, 1 Cordage (Workbench); Bronze Pick = 2 Wood, 2 Bronze Bar (Anvil); Iron Pick = 2 Wood, 3 Iron Bar (Anvil). Picks are tools: stack 1, own durability. Ore items stack 20.

## 2c. Trade values (base unit: Shell)
For Formara's barter screen: tap villager, fairness check = sum(offer) ≥ sum(ask) × 0.9 (proposal). Same IDs as `FL.STACK`.
| Item | Shells | Item | Shells |
|---|---|---|---|
| Wood, Stone, Fiber | 1 | Copper Bar | 8 |
| Berries, Flint, Bone | 2 | Tin Ore / Bronze Bar | 6 / 15 |
| Raw Meat, Feather, Sinew | 3 | Iron Bar | 20 |
| Hide, Cordage, Coal | 4 | Silver Bar | 40 |
| Cooked Meat, Arrow ×4 | 6 | Gold Bar | 60 |
| Leather, Clay Pot | 8 | Glowstone | 120 |
| Copper Ore / Iron Ore | 3 / 8 | Weapons | recipe sum × 1.5 × (dur left / max) |
Host-authoritative like `eat`/`cook`: `{t:'trade', npc, give:{item:n}, take:{item:n}}`; host checks range (2 tiles), stock, bag space and fairness, then swaps. Wandering trader logic = Mythorion.

## 2d. Loot chest interface (chests owned by Mythorion)
Chests may use any item ID above; suggested tier values: Common ≤ 30 Shells (flint, cordage, arrows, copper), Rare ≤ 120 (bronze/iron bars, silver, a worn weapon), Deep ≤ 300 (gold, Glowstone, Silver Blade). Weapons from chests arrive as single-slot items with random 40–90% durability.

## 3. Armor (light, so weapons have something to beat)
| Item | Age | Recipe | Station | Armor | Durability |
|---|---|---|---|---|---|
| Hide Wrap (v0.1) | Stone | 2 Hide, 1 Cordage | hand | 1 | 80 |
| Bone Shield | Stone | 3 Bone, 2 Wood, 1 Hide | Workbench | 2 (blocks front) | 100 |
| Bronze Helm | Bronze | 2 Bronze Bar, 1 Leather | Anvil | 2 | 200 |
| Iron Mail | Iron | 5 Iron Bar, 2 Leather | Anvil | 4 | 400 |
Armor subtracts from each hit, min 1 damage. Formara's outfit IDs still pending (SYSTEMS gap).

## 4. Stations (new `FL.BUILD` entries)
| Key | Name | Cost | Work | Age | Unlocks |
|---|---|---|---|---|---|
| workbench | Workbench | 6 Wood, 2 Stone | 4 | Stone | Stone Axe, Bow, Arrows, Bone Shield |
| tanning | Tanning Rack | 4 Wood, 2 Cordage | 3 | Stone | Leather |
| anvil | Anvil | 4 Stone, 3 Bronze Bar | 6 | Bronze | bronze/iron weapons + armor |
| smelter / bloomery | per SYSTEMS §1 | — | — | Bronze / Iron | bars |
Station rule: recipe needs a finished station within 2.5 tiles (reuse `FL.COOK_RANGE` logic from `nearFire`). `station` field added to `FL.RECIPES` entries; missing = hand.

## 5. Mechanics
| Topic | Rule |
|---|---|
| Equip | Weapons in bag; number keys 1–4 or tap to equip one; equipped weapon shown on player sprite |
| Durability | `-1` per hit (melee) or shot (ranged); at 0 the item is removed, "Your Club broke" toast |
| Repair | Workbench/Anvil: 50% of recipe cost restores full durability |
| Villagers | Hunter job picks the best weapon from Storage Pile; guards use spear/bow vs raptors at night |
| Gathering | Axes keep chop multiplier; weapons wielded as tools gather at ×1 |
| Balance target | Club 3 hits on raptor, Flint Spear 3, Bow 3 (2 w/ Bronze Arrow), Bronze 2, Iron Sword 1; see Hits R/S column |

## 6. Suggested build order
1. Add `dur` + `station` fields to `FL.RECIPES`; Club, Sling Stone, Sling (hand recipes).
2. Equip slot + durability in new `js/weapons.js` (patch pattern of `food.js`, no `ui.js`/`net.js` edits).
3. Workbench + Stone Axe, Bone Knife; raptor drops Sinew/Feather.
4. Projectiles (sling, bow, arrows) with simple straight-line hit test.
5. Tanning Rack + Leather (shared with Mythorion's saddle).
6. Bronze tier after Smelter lands; Iron tier after Bloomery; armor last.

## 7. Interfaces for other teams
| Need | Owner | What we provide |
|---|---|---|
| Saddle | Mythorion | Leather from Tanning Rack; suggest Saddle = 3 Leather, 2 Cordage, 1 Wood (Workbench) |
| Rope/halter for taming | Mythorion | Cordage (v0.1); Lasso = 4 Cordage (hand) |
| Hunting animals → meat/hide | Mythorion | weapon damage table above; Bone Knife +1 Hide |
| Cart/boat parts | Formara | Workbench as shared station; Bronze/Iron Bar for axles, nails |
| Mounted combat | both | spear/bow usable while riding at -25% accuracy (proposal) |

## 8. Multiplayer notes
- New commands, same pattern as `eat`/`cook` in `food.js` `exec`: `{t:'craft', item}`, `{t:'equip', item}`, `{t:'attack', tx, ty}`, `{t:'shoot', dx, dy}`, `{t:'repair', item}`.
- Clients forward via `net.forward(cmd)`; host validates station range, cost, cooldown, ammo; host rolls hits and durability.
- Host broadcasts projectiles as short-lived entities in state; clients only draw them.
- Cooldown checked host-side by `pid` timestamp to block spam.

## 9. Save fields
| Field | Where | Shape |
|---|---|---|
| `inv` | player | unchanged counts; weapons count 1 each |
| `dur` | player | `{ 'Club#1': 32, ... }` or per-slot `{slot, item, dur}` |
| `equip` | player | item key or null |
| `buildings[].type` | world | adds `workbench`, `tanning`, `anvil` |
| `projectiles` | not saved | transient |

## 10. Open questions
- Settled: weapons/tools get one slot each with instance durability (Dotorion).
- Keep v0.1 "Flint Spear" name or rename to "Stone Spear"? (Doc keeps Flint.)
- Friendly fire between players: off by default?
- Should villagers craft weapons themselves (Smith job) or only players?
- Ammo recovery on miss, and does arrow spoil/break in rain?
- Iron-tier boss (Mammoth) tuned around Iron Spear 7 / Iron Sword 9 dmg — needs Veritor sim.

## Sheep, wool, beds and village claims (numbers for Mythorion, 2026-10-29)
- Shears: 2 Flint + 1 Cordage at Workbench, 40 uses. Shear = 1-2 Wool (2 if sheep fed); bare hands 1 Wool at 50%.
- Regrow: 1 full game day (240s = 150 day + 90 night); use game time, not frames.
- Bed: 3 Wool + 3 Wood at Workbench; tool-like, does not stack.
- Claims: 1 bed = camp claim, radius 6. Village = 3+ beds within 8 tiles of a campfire; radius 8 + 1 per extra bed, cap 16. No overlap, first placed wins; claim lost when all its beds are broken.
- Save: claims [{id, owner, cx, cy, r, beds:[[x,y],...]}], placed beds only.
- Gap (Mythorion run2, 6/6 pass): no Workbench building exists in code yet; station only checked by name. Workbench must be added to FL.BUILD before beds/shears ship.

## Tools (tiers, recipes, durability, speed) — Radix, Oct 29 2026
**Base from game.js (v0.1):** player swing cooldown 0.4 s (`act`, game.js ~320); bare hands deal 1 per swing to objects. Tree 4 HP → 4 swings = **1.6 s**; Rock 5 HP → 5 swings = **2.0 s**. Digging (dig.js) is one G press per tile but needs a digging tool; bare hands may not dig (treated as ×1 = one dig per 0.4 s cooldown if later allowed). The Flint Axe today chops trees at dmg 2 (×2).
**Speed multiplier** = object damage per swing vs bare hands (×1). Chop = trees, Dig = rock/ore and G-dig tiles (dig cooldown ÷ mult). All tools stack 1, own durability (−1 per use), break at 0. Stations: hand / Workbench / Anvil (Bars from Furnace, §ores).

| Tool | Tier | Recipe | Station | Durability | Chop × | Dig × | Combat dmg |
|---|---|---|---|---|---|---|---|
| Flint Pick | Flint/Stone | 2 Wood, 2 Flint, 1 Cordage | hand | 60 | ×1 | ×2 | 1 |
| Stone Pick | Flint/Stone | 2 Wood, 3 Stone, 1 Cordage | Workbench | 100 | ×1 | ×2.5 | 2 |
| Copper Pick | Copper | 2 Wood, 3 Copper Bar | Anvil | 150 | ×1 | ×3 | 2 |
| Bronze Pick | Bronze | 2 Wood, 2 Bronze Bar | Anvil | 250 | ×1 | ×4 | 3 |
| Iron Pick | Iron | 2 Wood, 3 Iron Bar | Anvil | 400 | ×1 | ×5 | 3 |
| Flint Axe | Flint/Stone | 2 Wood, 1 Flint, 1 Fiber | hand | 80 | ×2 | ×1 | 2 |
| Stone Axe | Flint/Stone | 2 Wood, 2 Stone, 2 Cordage | Workbench | 120 | ×2.5 | ×1 | 3 |
| Copper Axe | Copper | 2 Wood, 2 Copper Bar | Anvil | 180 | ×3 | ×1 | 3 |
| Bronze Axe | Bronze | 2 Wood, 2 Bronze Bar | Anvil | 280 | ×4 | ×1 | 4 |
| Iron Axe | Iron | 2 Wood, 3 Iron Bar | Anvil | 450 | ×5 | ×1 | 5 |
| Digging Stick / Flint Shovel | Flint/Stone | 1 Wood, 1 Flint | hand | 60 | ×1 | G-dig ×1 (one tile / 0.4 s) | 1 |
| Stone Shovel | Flint/Stone | 2 Wood, 2 Stone, 1 Cordage | Workbench | 100 | ×1 | G-dig ×1.5 | 1 |
| Copper Shovel | Copper | 2 Wood, 1 Copper Bar | Anvil | 150 | ×1 | G-dig ×2 | 2 |
| Bronze Shovel | Bronze | 2 Wood, 1 Bronze Bar | Anvil | 250 | ×1 | G-dig ×2.5 | 2 |
| Iron Shovel | Iron | 2 Wood, 2 Iron Bar | Anvil | 400 | ×1 | G-dig ×3 | 2 |
| Flint Knife-Sword (Bone Knife) | Flint/Stone | 2 Bone, 1 Cordage | hand | 50 | ×1 | ×1 | 2 (R5/S2) |
| Flint Sword | Flint/Stone | 2 Wood, 2 Flint, 1 Cordage | Workbench | 60 | ×1 | ×1 | 3 (R3/S2) |
| Copper Sword | Copper | 1 Wood, 2 Copper Bar | Anvil | 150 | ×1 | ×1 | 4 (R3/S1) |
| Bronze Sword | Bronze | 1 Wood, 2 Bronze Bar | Anvil | 250 | ×1 | ×1 | 5 (R2/S1) |
| Iron Sword | Iron | 1 Wood, 3 Iron Bar | Anvil | 400 | ×1 | ×1 | 9 (R1/S1) |
| Bow | Flint/Stone | 3 Wood, 1 Sinew (or 2 Cordage) | Workbench | 120 | — | — | +arrow |
| Copper-backed Bow | Copper | 3 Wood, 1 Sinew, 1 Copper Bar | Anvil | 180 | — | — | +arrow, +1 |
| Bronze Bow | Bronze | 3 Wood, 2 Sinew, 1 Bronze Bar | Anvil | 220 | — | — | +arrow, +1 |
| Longbow | Iron | 4 Wood, 2 Sinew, 1 Iron Bar | Workbench | 250 | — | — | 6 +arrow |
| Flint Arrow ×4 | Flint/Stone | 1 Wood, 1 Flint, 1 Feather | Workbench | ammo (50% recover) | — | — | 3 |
| Copper Arrow ×4 | Copper | 1 Wood, 1 Copper Bar, 2 Feather → 8 | Anvil | ammo | — | — | 4 |
| Bronze Arrow ×4 | Bronze | 1 Wood, 1 Bronze Bar, 2 Feather → 8 | Anvil | ammo | — | — | 5 (bow R2) |
| Iron Arrow ×4 | Iron | 1 Wood, 1 Iron Bar, 2 Feather → 8 | Anvil | ammo | — | — | 6 |

Resulting times vs bare hands: Tree 1.6 s → Flint Axe 0.8 s, Stone Axe 0.8 s (4 HP / dmg 2.5 rounds up to 2 swings), Iron Axe 0.4 s. Rock 2.0 s → Stone Pick 0.8 s, Iron Pick 0.4 s. Bare hands may still chop/mine surface rock but cannot mine ore (needs Stone Pick+ for copper/tin, Bronze Pick+ for iron/silver).
