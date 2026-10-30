// Firstlight prototype: deterministic waterways. A PIT next to WATER becomes WATER.
// One step per tick, scan in index order, using the previous tick's state (no same-tick chaining),
// capped at MAX_FLOW conversions per tick. Never touches non-PIT tiles.
(function (FL) {
  FL.MAX_FLOW = 32;
  FL.waterTick = function (ground) {
    const { W, H, G } = FL, out = [];
    for (let i = 0; i < W * H && out.length < FL.MAX_FLOW; i++) {
      if (ground[i] !== G.PIT) continue;
      const x = i % W, y = (i / W) | 0;
      if ((x > 0 && ground[i - 1] === G.WATER) || (x < W - 1 && ground[i + 1] === G.WATER) ||
          (y > 0 && ground[i - W] === G.WATER) || (y < H - 1 && ground[i + W] === G.WATER)) out.push(i);
    }
    for (const i of out) ground[i] = G.WATER;
    return out; // changed indices -> host sends these like obj diffs
  };
})(typeof window !== 'undefined' ? window.FL : global.FL);
