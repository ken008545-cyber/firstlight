# Firstlight: Dialogue Guide for Villagers
Draft by Techknight The Scribe. Drawn from craft long known in public-domain drama (Shakespeare, Chekhov, Wilder's Our Town, Bunyan's Pilgrim's Progress). These are working principles, not quotations.

## Ten rules
1. **Short lines.** One thought per bubble, about 12 words or fewer. Real talk is clipped.
2. **Everyone wants something.** Each villager has one want (Moss wants the fire kept, Wren wants to see past the fog, Garr wants the tribe fed). Their lines lean toward it. (Chekhov)
3. **Show, don't state.** Not "I am afraid," but "Did you hear that? ...Stay by the fire."
4. **Leave room under the words.** What a villager doesn't say matters. Moss never talks about the night his brother walked into the fog; he just goes quiet at the fog's edge. (Chekhov's subtext)
5. **Interruptions and turns.** A line can break off when something happens ("The berries are almost — raptor! Down!"). A scene should turn at least once.
6. **Ordinary things carry weight.** Wilder's Our Town makes breakfast and stars holy. Let villagers notice small things: a warm stone, a child's first torch.
7. **Each voice is distinct.** Moss is slow and uses fire words. Wren is quick, asks questions, and uses "look!" Garr is blunt and talks of tracks, weather, and meat.
8. **Names carry meaning.** Bunyan names people by what they carry (Faithful, Hopeful). Our guides' titles do the same: the Firekeeper, the Scout, the Hunter.
9. **Comic relief beside the serious.** Shakespeare puts the gravedigger's jokes in the tragedy. One villager in every camp should make the player smile.
10. **End on a hook.** Every talk ends with a reason to come back: "Ask me tomorrow about the river people."

## Villagers who ask questions and answer the answers (free, scripted)
Brother wants villagers to ask the player things and respond to what the player says. That works without AI as a question with choices, where each answer leads to its own reply and is remembered.

**Shape:** villager asks, player picks (or says) one of 2 to 3 answers, villager replies to that answer, and the game stores it as a flag the villager remembers later.

**Example: Wren, the Scout**
Wren: "Why do you carry the light so far from camp?"
- A) "So the world can remember." Wren: "Moss says that too. ...I think I believe it now." (flag: wren_believes)
- B) "To find more wood." Wren: "Ha! Honest. Bring me some too." (flag: wren_laughs)
- C) "I don't know yet." Wren: "Then let's find out together. Follow me tomorrow." (flag: wren_follow, which unlocks her tour)

Later, Wren remembers: if wren_believes, she says, "You were right. The land came back where we walked."

**Voice:** the player can speak an answer. The browser's free speech recognition matches it to the closest choice by keywords, and a choice button is shown as a fallback.

**Rules for questions**
- At most one question per conversation, so the player isn't interrogated.
- Every answer gets a warm reply. No answer is punished.
- Remembered answers must come back at least once. Otherwise, asking is pointless.

## Open, AI-driven talk (later)
Truly open conversation, where the villager asks and answers anything, needs an AI service and a cost report from Ordion with Brother's yes. If it ever comes, this guide becomes the villager's character sheet: want, voice, secrets, and the lore it must never contradict.
