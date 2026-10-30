# Firstlight: Guide Tour Scripts
Draft by Techknight The Scribe for Mr Knight. Scripted, free, read in the browser voice. Each stop: walk-to target, picture card, lines.

## Guide 1: Elder Moss, the Firekeeper (camp tour)
Triggers: tap Moss, or say "show me around" / "tell me the story" / "what's that?"

**Greeting**
"Ah, you're awake. Walk with me, little ember. There's much to see, and the night won't wait."

**Stop 1: The Fire** (card: campfire)
"This is the hearth. It is the last of the Firstlight that we know of. Feed it, and it keeps the cold and the shadows away. Let it die, and so do we."
(If asked "what's that?": "Our fire. No one keeps it alone.")

**Stop 2: The Huts** (card: hut rising in 4 stages)
"Here we build. You set the plan, and our hands raise the walls. A hut is warmth, and warmth is life. Every hut means another family sleeps safe."

**Stop 3: The Fog's Edge** (card: torch pushing back fog)
"And there is the Fog. It isn't a beast. It's forgetting: the world no longer remembers its own shape. But watch." (the player's torch clears a patch) "Where light goes, the land remembers."

**Stop 4: The Story** (card: one great flame breaking into embers)
"Long ago there was one great flame, the Firstlight, and all people lived in its warmth. They tried to own it, and it broke into a thousand embers. Now the cold covers the world. But the light was first, and the light will be last. Carry it outward, and maybe one day the flame will be whole again."

**Farewell**
"That's enough for one walk. Go now, gather wood, light a torch, and come find me if you lose your way."


## Elder Moss: questions he asks (one per talk, remembered as flags)
**Q1, after Stop 1 (the fire):** "Tell me, little ember. Are you afraid of the dark?"
- A) "Yes." Moss: "Good. Fear keeps you near the light. Tonight, I'll leave a torch by your bed." (flag: moss_afraid; next evening a free Torch appears by the player's hut)
- B) "No." Moss: "Brave words. The night will test them. Stay close anyway." (flag: moss_brave)
- C) "Only a little." Moss: "Honest. That's the best kind of courage." (flag: moss_honest)

**Q2, after Stop 4 (the story):** "Do you think the flame can be whole again?"
- A) "Yes, I'll carry it." Moss: "Then I've waited for you a long time." (flag: moss_hope; unlocks Moss's idle line "The ember-carrier walks among us.")
- B) "I don't know." Moss: "Neither did I, once. Keep walking. You'll know." (flag: moss_doubt)
- C) "Why did they break it?" Moss: "Because they wanted it more than they wanted each other. Don't make their mistake." (flag: moss_lesson)

**Callbacks (he remembers)**
- moss_afraid: "Did the torch keep you warm?"
- moss_brave: (after the player's first night attack) "Still not afraid? ...Me neither. Mostly."
- moss_hope: on age-up: "You see? The light grows when it's carried."

## Fallback lines (unrecognized speech)
- "I'm old, and my ears are older. Ask me to show you around, or to tell the story."
- "Say that again, slowly, like the river."

## Next guides (planned)
- **Wren, the Scout:** a tour of the fog's edge, the scout posts, and the danger signs (raptor tracks, night eyes).
- **Garr, the Hunter:** a tour of the hunting grounds, the Elders (dinosaurs), and why the tribe leaves their nests in peace.
