# Firstlight: Game Systems (Radix, draft v1, Oct 29 2026)
For Mr Knight to wire in. Design only; no code touched. Names match `js/data.js` (v0.1.0), `QUESTS.md` and Formara's `ART-DIRECTION.md`.
Units: 1 day = `FL.DAY_LEN` = 240 s (day 0–150 s, night 150–240 s proposed). "v0.1" = already in code; everything else is proposed.

## 1. Resource and refining tree
Raw resources gather from world objects (`FL.ODEF`); refined goods are crafted (`FL.RECIPES`) or made in a station.

| Age | Raw (source) | Refined (inputs → output, station) |
|---|---|---|
| Stone (v0.1) | Wood (Tree), Stone (Rock), Flint (Rock 45%), Fiber (Tall grass, Tree 30%), Clay, Hide (raptor), Berries (Berry bush), Bone (Old bones) | 3 Fiber → Cordage (hand); 3 Clay → Clay Pot (hand); 2 Hide+1 Cordage → Hide Wrap (hand) |
| Stone (new) | Meat (raptor, beasts), Reed (water edge) | 1 Meat+fire → Cooked Meat (Campfire); 4 Clay+1 Wood → Fired Brick (Kiln) |
| Bronze | Copper Ore, Tin Ore (Stone tiles beyond fog ring 2) | 2 Copper+1 Tin+2 Wood → Bronze Bar (Smelter); 3 Fiber → Cloth (Loom) |
| Iron | Iron Ore, Coal (deep Stone) | 2 Iron Ore+1 Coal → Iron Bar (Bloomery); 2 Wood → Charcoal (Kiln) |
| Kingdom | Gold Ore, Marble | 2 Stone → Cut Stone (Mason); 1 Gold Ore+1 Coal → Gold Bar; Grain → Flour → Bread (Mill, Oven) |
| Industrial | Oil (seep tiles), Sulfur | 2 Iron Bar+2 Coal → Steel (Foundry); 2 Oil → Fuel (Refinery); Steel+Rubber → Wheel/Engine parts |

## 2. Age progression
Advance at the Campfire (later Town Hall) once all requirements are met. Quest 5 "The First Night" opens the age bar (QUESTS.md).

| Age | Requirements to enter | Unlocks |
|---|---|---|
| Stone | start | Torch, Flint Axe, Flint Spear, Cordage, Hide Wrap, Clay Pot; Hut, Campfire, Storage Pile, Fence |
| Bronze | 6 villagers, 3 Huts, 40% of map explored, Kiln built, 20 Fired Brick | Smelter, Loom, Bronze Axe/Pick/Spear (×3 gather), Raft, Lantern |
| Iron | 12 villagers, Bronze Age 5 days, 60% explored, 30 Bronze Bar, first boss (Sabertooth) down | Bloomery, Iron tools (×4), Boat, Watchtower, Farms |
| Kingdom | 25 villagers, 80% explored, 40 Iron Bar, Mason + 10 Cut Stone walls, boss Mammoth down | Town Hall, Mill, Oven, Cart, Roads, Gold Bar |
| Industrial | 40 villagers, 100% explored, 50 Gold Bar, 30 Steel, boss Ancient Rex down | Foundry, Refinery, Car, Electric light (perma-clears fog) |

## 3. Villagers: jobs, skills, needs, moods
v0.1: villager hp 10, hunger starts 80, drops 100 per day, eats 1 Berries (+60) from storage at <30 (seeks food at <45), auto-gathers. Names: QUESTS.md list (25) vs `FL.NAMES` (16) — see Gaps.

| Job | Unlock | Primary task | Skill gain |
|---|---|---|---|
| Gatherer | Stone | Wood/Stone/Fiber/Clay/Berries | +1 xp per haul |
| Hunter | Flint Spear | hunts beasts → Hide/Bone/Meat | +3 xp per kill |
| Builder | Hut | builds blueprints (×1.5 work rate) | +1 xp per 10 work |
| Torchbearer | Torch | plants/refuels torches at fog edge | +1 xp per tile cleared |
| Cook | Campfire | Cooked Meat, Bread | +1 xp per meal |
| Smith | Smelter | bars and tools | +2 xp per bar |
| Scout | Raft | clears fog by travel | +1 xp per 10 tiles |

Skill levels: 1–5 at xp 0/20/60/140/300; speed multiplier 1.0/1.15/1.3/1.5/1.75.

| Need | Range | Decay/day | Refill |
|---|---|---|---|
| Hunger | 0–100 | 100 (v0.1) | Berries +60, Cooked Meat +80, Bread +100 |
| Warmth | 0–100 | 60 at night only | within light 6 of Campfire +30/min; Hide Wrap halves decay |
| Rest | 0–100 | 50 | sleeping in Hut +100/night |
| Safety | 0–100 | −20 per night creature seen | Fence/Watchtower/torch nearby |

| Mood (avg of needs) | Range | Work speed | Effect |
|---|---|---|---|
| Joyful | ≥80 | ×1.2 | happy idle line |
| Content | 50–79 | ×1.0 | — |
| Uneasy | 25–49 | ×0.8 | "low food / danger" lines |
| Miserable | <25 | ×0.5 | stops working; leaves after 2 days |

## 4. Clearing fog on purpose
Fog is tribe-wide (explored bitset). Clearing is permanent; light only reveals while lit.

| Method | Radius (tiles) | Cost | Notes |
|---|---|---|---|
| Player/villager walking | 3 | — | baseline |
| Torch placed (`FL.TORCH_LIGHT`) | 4 | 1 Wood+1 Fiber | burns 1 day, then must be refueled (1 Wood) |
| Campfire (`light: 6`) | 6 | 4 Wood+3 Stone | permanent |
| Lantern (Bronze) | 6 | 1 Bronze Bar+1 Fiber | burns 3 days |
| Watchtower (Iron) | 12 reveal, 8 light | 10 Wood+6 Stone+2 Iron Bar | permanent |
| Scout on Raft/Boat | 4 along path | — | coastline reveal |
| Electric light (Industrial) | 10 | 1 Steel/day power | permanent light |

Fog rings: ring 1 = 0–12 tiles from cave, ring 2 = 12–24, ring 3 = 24–36, ring 4 = rest. Chest density and odds rise per ring (see §8).

## 5. Travel unlocks
| Vehicle | Age | Cost | Speed (player = 1.0) | Capacity | Terrain |
|---|---|---|---|---|---|
| Raft | Bronze | 10 Wood+4 Cordage | 1.2 | 1 rider, 10 goods | Water (calm, near shore ≤4 tiles) |
| Boat | Iron | 20 Wood+6 Cloth+4 Iron Bar | 1.8 | 3 riders, 40 goods | all Water |
| Cart | Kingdom | 15 Wood+2 Iron Bar+2 Wheel | 1.5 (2.0 on Road) | 1 rider, 60 goods | land |
| Car | Industrial | 10 Steel+2 Engine parts | 3.0 on Road, 1.5 off | 2 riders, 30 goods | land; uses 1 Fuel/day |

## 6. Creatures and bosses
v0.1 has `raptor` (hp 9, drops 3 Hide+2 Bone, 1 cap / 2 from day 3) and `shadow` (hp 4, night). Fences block raptors; light repels shadows.

| Creature | Ages | Time | HP | Dmg | Drops | Spawn |
|---|---|---|---|---|---|---|
| shadow | Stone–Iron | night | 4 | 1 | Bone 1 | fog edge, avoids light |
| raptor | Stone–Bronze | day+night | 9 | 2 | 3 Hide, 2 Bone, 2 Meat | max 1 (2 from day 3) |
| Wolf | Stone–Iron | night | 12 | 2 | 2 Hide, 1 Meat | packs of 2–3, ring 2+ |
| Boar | Bronze–Kingdom | day | 15 | 3 | 3 Meat, 1 Hide | ring 2+ |
| Bandit | Kingdom–Industrial | dusk | 25 | 4 | Gold Ore 1 | raids every 5 days |
| Dire Wolf | Iron+ | night | 30 | 4 | 4 Hide, Bone 3 | ring 3+ |

| Boss | Gate | Time | HP | Drops |
|---|---|---|---|---|
| Sabertooth | to Iron | night, ring 3 | 120 | 10 Hide, guaranteed Sabertooth Charm (Epic) |
| Mammoth | to Kingdom | day, ring 3–4 | 250 | 20 Meat, 15% Mammoth Cloak (Legendary) |
| Ancient Rex | to Industrial | night, ring 4 | 500 | 25% Raptor-Skull Helm (Legendary) |

## 7. Economy rates
Base gather = 1 hit per 0.5 s; `hp` = hits per object (v0.1 `FL.ODEF`).

| Object | Hits | Time (hand) | Drops | Regrow |
|---|---|---|---|---|
| Tree | 4 | 2.0 s (1.0 s Flint Axe) | 3 Wood, 30% 1 Fiber | 2 days (proposed) |
| Rock | 5 | 2.5 s | 2 Stone, 45% 1 Flint | never |
| Berry bush | 2 | 1.0 s | 3 Berries | 1 day (v0.1 regrow) |
| Tall grass | 1 | 0.5 s | 2 Fiber | 1 day |
| Clay | 3 | 1.5 s | 2 Clay | never |
| Old bones | 1 | 0.5 s | 2 Bone | never |
Tool multipliers: Flint ×2 (v0.1 axe), Bronze ×3, Iron ×4, Steel ×5.

| Food | Hunger | Spoils (in hand / storage / Clay Pot) |
|---|---|---|
| Berries | +60 | 1 day / 2 days / never (v0.1: Clay Pot +2 Berries per pot each dawn) |
| Meat (raw) | +40 | 0.5 / 1 / 3 days |
| Cooked Meat | +80 | 2 / 4 / 8 days |
| Bread | +100 | 3 / 6 / 12 days |
Tribe target: 1 food item per villager per day ≈ 1 Berry bush per villager.

## 8. Rare outfit drops (Formara, ART-DIRECTION.md §2)
Cosmetic only. Tier odds from her table: Common 60 / Uncommon 25 / Rare 10 / Epic 4 / Legendary 1. Pity: guaranteed Epic every 40 chests. Host rolls in co-op.

| Source | Chance of a drop | Tier odds |
|---|---|---|
| Fog chest ring 1 | 100% | base |
| Fog chest ring 2 | 100% | Rare+ ×1.5 |
| Fog chest ring 3–4 | 100% | Rare+ ×2.5 |
| raptor / Wolf | 5% | base, no Legendary |
| Night creature (shadow) | 2% | base |
| Boss | 100% | see §6 |
| Age milestone (first Hut, first Raft/Boat) | 100% | guaranteed Rare |
| Crafted | — | Common/Uncommon only |
Chests per ring: 4 / 8 / 12 / 16.

| Item (Formara's name) | Tier | Slot | Signature source |
|---|---|---|---|
| Fiber Headband, Hide Wrap, Grass Skirt, Bare Feet, Twine Bracelet | Common | 1,2,3,4,5 | craft / ring 1 |
| Ochre Face Paint, Stitched Tunic, Hide Boots, Clay Bead Necklace | Uncommon | 7,2,4,5 | craft / ring 1–2 |
| Bone Necklace, Shell Bracelet, Wolf Hood, Woven Cloak | Rare | 5,5,1,6 | Wolf (Wolf Hood), milestones |
| Feather Crown, Painted Hunter Wrap, Sabertooth Charm | Epic | 1,2,5 | Sabertooth boss (Charm) |
| Raptor-Skull Helm, Mammoth Cloak, Firstflame Totem, Starlit Paint | Legendary | 1,6,6,7 | Ancient Rex, Mammoth, ring 4 chest, night ring 4 chest |

## Conflicts and gaps
- `js/data.js` is at `js/data.js`, not repo root. No `data.js` IDs exist for outfits; Formara gives names only — suggest snake_case IDs (e.g. `raptor_skull_helm`).
- "Hide Wrap" is both a v0.1 recipe (+5 max health, a stat) and a Common cosmetic in Formara's set (cosmetic, no stats). Rename one (e.g. cosmetic "Plain Hide Wrap").
- Villager names: `FL.NAMES` (16) differs from QUESTS.md (25); only Fen and Pell overlap.
- Formara's starter set covers Stone Age only; no outfits for Bronze→Industrial yet. Sabertooth/Mammoth/Rex bosses here are proposed to match her trophies.
- Day/night split, warmth/rest/safety needs, regrow times, ages beyond Stone are all proposals, not in code.
