# Zoom-in (Formara, design only, Oct 29 2026)
Brother wanted an up-close feel without first person. We keep the top-down god view and add camera zoom.

- **Levels:** 1x (god view), 2x, 3x (close on your fella). Integer only, per ART-DIRECTION, so pixels stay crisp.
- **Controls:** mouse wheel / `+` `-` on desktop; pinch on phones, plus a small 🔍 toggle button on the touch bar (cycles 1x→2x→3x).
- **Follow:** at 2x and 3x the camera follows your player with light lerp (0.15); at 1x it's free-pan like WorldBox.
- **Smooth step:** tween 250 ms between levels, snap to integer zoom at the end.
- **HUD:** hint bar, bag and hotbar stay screen-fixed (don't scale with zoom).
- **Fog/night:** fog-of-war and night tint unaffected; torch glow scales with the world.
- **Multiplayer:** zoom is local only, never sent over the wire.
- **Save:** last zoom level stored in settings.
- Wiring is Dotorion's (Phaser `cameras.main.setZoom` + `startFollow`); this doc is the spec. Veritor test: each level reachable on keys, wheel and pinch; HUD unchanged; no blur.
