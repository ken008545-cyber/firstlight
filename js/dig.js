// Firstlight prototype: digging + water gathering. Plain JS, works in browser (window.FL) or node.
(function (FL) {
  FL.G.PIT = 5;
  const DIGGABLE = new Set([FL.G.GRASS, FL.G.DIRT, FL.G.SAND]);
  const TOOLS = ['Digging Stick', 'Flint Axe'];
  FL.DIG_RECIPE = { out: 'Digging Stick', cost: { Wood: 1, Flint: 1 }, desc: 'Dig pits and channels. Water fills them.' };
  const add = (inv, k, n) => { inv[k] = (inv[k] || 0) + n; if (inv[k] <= 0) delete inv[k]; };
  // w = { ground, obj, occupied?(i) }, p = { inv }, log = array. Returns true if dug.
  FL.dig = function (w, p, x, y, pid, ts, log) {
    if (x < 0 || y < 0 || x >= FL.W || y >= FL.H) return false;
    const i = y * FL.W + x;
    if (!TOOLS.some(t => (p.inv[t] || 0) > 0)) return false;
    if (!DIGGABLE.has(w.ground[i]) || w.obj[i] || (w.occupied && w.occupied(i))) return false;
    if (w.ground[i] === FL.G.DIRT) add(p.inv, 'Clay', 1);
    add(p.inv, 'Dirt', 1);
    w.ground[i] = FL.G.PIT;
    if (log) log.push({ player: pid, ts, i, to: 'pit' });
    return true;
  };
  // replay a log entry on another client/world (to:'pit' only; water is derived by ticks)
  FL.applyDig = function (w, e) { if (e.to === 'pit' && DIGGABLE.has(w.ground[e.i])) { w.ground[e.i] = FL.G.PIT; return true; } return false; };
  FL.gatherWater = function (w, p, x, y) {
    if ((p.inv['Clay Pot'] || 0) < 1) return false;
    let near = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < FL.W && Y < FL.H && w.ground[Y * FL.W + X] === FL.G.WATER) near = true;
    }
    if (!near) return false;
    add(p.inv, 'Clay Pot', -1); add(p.inv, 'Water Pot', 1); return true;
  };
})(typeof window !== 'undefined' ? window.FL : global.FL);
