# Firstlight: Pixel Art Direction and Rare Wardrobe (Formara, draft v1, Oct 29 2026)

## 1. Pixel rules (the "master" standard)
- **Grid:** 16×16 tiles; characters 16×24 (head 6px, body 10px, legs 8px); buildings in multiples of 16.
- **Scale:** render at 3× or 4× integer only, `pixelArt: true` and `roundPixels: true` in Phaser. Never fractional scaling.
- **Light source:** top-left for every sprite. Highlights on top/left edges, shadows bottom/right.
- **Shading:** 3 tones per material (light, base, shadow) + 1 dark outline tone. Hue-shift: shadows lean cooler/purple, highlights lean warmer/yellow, never just darker/lighter of the same hue.
- **Outlines:** dark coloured outline (bark `#4A3420` or a dark version of the fill), not pure black. Selective outlining: lighter outline on lit side.
- **No pillow shading, no banding, no jaggies:** lines step in clean 1-2-3 patterns; clusters of colour stay readable at 1×.
- **Palette cap:** 32 colours for the whole Stone Age (the 10 core colours + shades). Every sprite pulls from it.
- **Animation:** walk 4 frames, idle 2 (breathing bob 1px), chop/mine 3 with 1 smear frame, torch flicker 3. 8–10 fps for characters, 6 fps for fire.
- **Readability test:** every sprite must read as a silhouette in solid black at 1×.
- **Day/night:** don't repaint sprites. Use a tint overlay (night = `#1E2228` multiply ~55%) and additive torch glow `#F2A33A`.

## 2. Wardrobe system
Outfits are **cosmetic only**. They never change stats (keeps the side-grade/fair rule).

### Slots (layered paper-doll sprites, each 16×24 on the same frames)
1. Head (hat, hood, headband, horns)
2. Body (wrap, tunic, cloak)
3. Legs (leggings, skirt wrap)
4. Feet (bare, hide boots)
5. Accessory 1 (necklace, bracelet)
6. Accessory 2 (back item: quiver, cape, totem)
7. Face paint (palette-swap overlay, cheapest to make)

### Rarity tiers
| Tier | Colour | Drop chance | Look |
|---|---|---|---|
| Common | Stone `#8C8C84` | ~60% | plain hide, fiber |
| Uncommon | Grass `#6B8E3A` | ~25% | dyed, stitched trims |
| Rare | Water `#3E7CA6` | ~10% | bone, shell, beads |
| Epic | Torchlight `#F2A33A` | ~4% | feathers, painted patterns, 1 idle sparkle |
| Legendary | Danger red `#C2412F` + glow | ~1% | dinosaur trophies, animated (ember, glow), unique silhouette |

Rule: **rarity must be visible from across the map.** Higher tiers add silhouette changes (feathers, horns, capes), not just colour.

### How you get them (earned only)
- Chests found while clearing fog (deeper fog = better odds).
- Dinosaur and night-creature drops (Legendary trophies come from boss beasts).
- Age milestones (first hut, first boat) give one guaranteed Rare.
- Crafted: Common/Uncommon only, so crafting never replaces discovery.
- Pity rule: a guaranteed Epic every 40 chests so luck never feels cruel.

### Stone Age starter set (20 items)
- Common: Fiber Headband, Hide Wrap, Grass Skirt, Bare Feet, Twine Bracelet
- Uncommon: Ochre Face Paint, Stitched Tunic, Hide Boots, Clay Bead Necklace
- Rare: Bone Necklace, Shell Bracelet, Wolf Hood, Woven Cloak
- Epic: Feather Crown, Painted Hunter Wrap, Sabertooth Charm
- Legendary: Raptor-Skull Helm (glowing eyes), Mammoth Cloak (snow drift idle), Firstflame Totem (ember particles), Starlit Paint (twinkles at night)

### UI
- Wardrobe opens from the inventory: paper-doll on left, slot grid on right, rarity-coloured frame around each item.
- Item cards: name, tier, where it was found ("Found in the fog, day 12").
- Drop moment: chest pops, item flies up with a tier-coloured flash; Legendary gets a 1-second slow beam and a unique sound.
- Villagers can wear hand-me-downs, so a rich tribe looks rich.

### Saves and co-op (from Ordion)
- Unlocked outfits, equipped loadout and the pity counter are stored in the save file, so Export/Import carries them.
- In co-op, the host rolls all chest and beast drops; guests never roll their own.
