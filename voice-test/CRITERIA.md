# Tap-to-talk villager speech experiment: pass criteria (locked 2026-10-29 10:10 PM CT, before any run)
Free browser APIs only: Web Speech API SpeechRecognition (voice input) + speechSynthesis (read-aloud). No paid service, no keys.
Per browser (Chrome desktop, Edge desktop, phone Chrome/Android, phone Safari/iOS):
1. Feature detect: page reports whether recognition and synthesis exist. PASS = synthesis present.
2. Read-aloud: tapping a villager speaks its line within 1 s. PASS = audible on 3 of 3 taps.
3. Voice input: tap mic, say "hello", transcript appears within 3 s. PASS = 2 of 3 tries correct.
4. Round trip: spoken input -> villager reply spoken. PASS = works end to end once.
5. Graceful fallback: if recognition missing, a text box appears instead and read-aloud still works. PASS = no errors, game playable.
Overall PASS = 1,2,5 on all four; 3,4 on Chrome and Edge desktop. Anything else reported as FAIL with the reason.
Known going in (from spec, not tested): Chrome's recognition sends audio to Google's servers (free, needs network); Firefox has no recognition; iOS Safari recognition is partial.
