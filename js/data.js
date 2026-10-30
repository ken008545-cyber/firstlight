// Firstlight data, RNG and seeded world generation
window.FL = window.FL || {};
(function (FL) {
  FL.VERSION = '0.1.0';
  FL.SAVE_VERSION = 1;
  FL.T = 32; FL.W = 80; FL.H = 80;
  FL.DAY_LEN = 240; // seconds per full day+night
  FL.COL = { grass: 0x6B8E3A, dirt: 0x8A6A44, stone: 0x8C8C84, water: 0x3E7CA6, sand: 0xD9C38A,
    fog: 0x1E2228, torch: 0xF2A33A, danger: 0xC2412F, panel: 0xEFE3C8, text: 0x4A3420 };
  FL.G = { WATER: 0, SAND: 1, GRASS: 2, DIRT: 3, STONE: 4 };
  FL.RES = ['Wood', 'Stone', 'Flint', 'Fiber', 'Clay', 'Hide', 'Berries', 'Bone'];
  FL.RES_COLOR = { Wood: '#7a5230', Stone: '#8C8C84', Flint: '#3d3f45', Fiber: '#a8b85a', Clay: '#a8603a',
    Hide: '#b88a5a', Berries: '#7a3a8a', Bone: '#ece6d6', Torch: '#F2A33A', 'Flint Axe': '#5b4a3a',
    'Flint Spear': '#6b5a40', Cordage: '#c9b46a', 'Hide Wrap': '#9a6a40', 'Clay Pot': '#b8704a' };
  FL.RECIPES = [
    { out: 'Torch', cost: { Wood: 1, Fiber: 1 }, desc: 'Carry light. T places one.' },
    { out: 'Flint Axe', cost: { Wood: 2, Flint: 1, Fiber: 1 }, desc: 'Chop trees twice as fast.' },
    { out: 'Flint Spear', cost: { Wood: 3, Flint: 1, Fiber: 1 }, desc: 'Reach and damage in a fight.' },
    { out: 'Cordage', cost: { Fiber: 3 }, desc: 'Strong cord.' },
    { out: 'Hide Wrap', cost: { Hide: 2, Cordage: 1 }, desc: '+5 max health while carried.' },
    { out: 'Clay Pot', cost: { Clay: 3 }, desc: 'Deposit to storage: food keeps (+2 Berries per pot each dawn).' }
  ];
  // objects on tiles
  FL.O = { NONE: 0, TREE: 1, ROCK: 2, BUSH: 3, TUFT: 4, CLAY: 5, BONE: 6, BUSH_EMPTY: 7 };
  FL.ODEF = {
    1: { name: 'Tree', hp: 4, block: true, drops: [['Wood', 3], ['Fiber', 1, 0.3]] },
    2: { name: 'Rock', hp: 5, block: true, drops: [['Stone', 2], ['Flint', 1, 0.45]] },
    3: { name: 'Berry bush', hp: 2, block: false, drops: [['Berries', 3]], regrow: true },
    4: { name: 'Tall grass', hp: 1, block: false, drops: [['Fiber', 2]] },
    5: { name: 'Clay', hp: 3, block: false, drops: [['Clay', 2]] },
    6: { name: 'Old bones', hp: 1, block: false, drops: [['Bone', 2]] },
    7: { name: 'Picked bush', hp: 0, block: false, drops: [] }
  };
  FL.SOURCE = { Wood: 1, Stone: 2, Flint: 2, Fiber: 4, Clay: 5, Berries: 3, Bone: 6 };
  FL.BUILD = {
    hut: { name: 'Hut', cost: { Wood: 8, Fiber: 4, Clay: 3 }, work: 18, block: true, desc: 'Shelter. A new villager joins.' },
    campfire: { name: 'Campfire', cost: { Wood: 4, Stone: 3 }, work: 8, block: true, light: 6, desc: 'Light that shadows fear.' },
    storage: { name: 'Storage Pile', cost: { Wood: 5 }, work: 6, block: false, desc: 'Villagers drop goods here.' },
    fence: { name: 'Fence', cost: { Wood: 2 }, work: 3, block: true, desc: 'Blocks raptors.' }
  };
  FL.TORCH_LIGHT = 4;
  FL.NAMES = ['Ama', 'Bodo', 'Cira', 'Dun', 'Esa', 'Fen', 'Gali', 'Hok', 'Ina', 'Juro', 'Kesh', 'Lom', 'Mira', 'Nok', 'Oru', 'Pell'];

  FL.rng = function (seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  FL.hash2 = function (x, y, s) {
    let h = (s | 0) ^ Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296;
  };
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = FL.hash2(xi, yi, s), b = FL.hash2(xi + 1, yi, s), c = FL.hash2(xi, yi + 1, s), d = FL.hash2(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  FL.fbm = function (x, y, s) { let t = 0, amp = 0.5, f = 1, n = 0;
    for (let o = 0; o < 4; o++) { t += vnoise(x * f, y * f, s + o * 101) * amp; n += amp; amp *= 0.5; f *= 2; } return t / n; };

  FL.genWorld = function (seed) {
    const { W, H, G, O } = FL; const ground = new Uint8Array(W * H), obj = new Uint8Array(W * H);
    const cx = W / 2, cy = H / 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const dc = Math.hypot(x - cx, y - cy) / (W / 2);
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
      let e = FL.fbm(x / 16, y / 16, seed) + 0.25 * (1 - dc) - 0.05;
      if (edge < 6) e -= (6 - edge) * 0.07;
      const m = FL.fbm(x / 9, y / 9, seed + 999);
      let g;
      if (e < 0.36) g = G.WATER; else if (e < 0.40) g = G.SAND; else if (e > 0.70) g = G.STONE; else g = m < 0.40 ? G.DIRT : G.GRASS;
      ground[i] = g;
      const r = FL.hash2(x, y, seed + 7), forest = FL.fbm(x / 7, y / 7, seed + 555);
      let o = 0;
      if (g === G.GRASS) { if (forest > 0.55 && r < 0.45) o = O.TREE; else if (r < 0.025) o = O.BUSH; else if (r < 0.09) o = O.TUFT; else if (r < 0.1) o = O.TREE; else if (r < 0.104) o = O.BONE; }
      else if (g === G.DIRT) { if (r < 0.07) o = O.CLAY; else if (r < 0.11) o = O.TUFT; else if (r < 0.13) o = O.BUSH; else if (r < 0.15) o = O.TREE; else if (r < 0.155) o = O.BONE; }
      else if (g === G.STONE) { if (r < 0.32) o = O.ROCK; else if (r < 0.34) o = O.BONE; }
      else if (g === G.SAND) { if (r < 0.08) o = O.CLAY; else if (r < 0.1) o = O.BONE; else if (r < 0.13) o = O.ROCK; }
      obj[i] = o;
    }
    // home: a cave mouth of stone to the north, clearing around the fire
    for (let y = cy - 9; y <= cy + 9; y++) for (let x = cx - 9; x <= cx + 9; x++) {
      const i = y * W + x, d = Math.hypot(x - cx, y - cy);
      if (d <= 5.5) { ground[i] = d < 3 ? G.DIRT : G.GRASS; obj[i] = 0; }
      else if (d <= 8 && ground[i] === G.WATER) ground[i] = G.GRASS;
      if (d > 3.5 && d < 5.5 && y < cy - 1) { ground[i] = G.STONE; obj[i] = O.ROCK; }
    }
    // guaranteed starter resources near home
    const r2 = FL.rng(seed ^ 0xbeef);
    const put = (o, n) => { let k = 0, tries = 0; while (k < n && tries++ < 500) { const a = r2() * Math.PI * 2, d = 6 + r2() * 6;
      const x = Math.round(cx + Math.cos(a) * d), y = Math.round(cy + Math.sin(a) * d), i = y * W + x;
      if (ground[i] !== G.WATER && obj[i] === 0) { obj[i] = o; k++; } } };
    put(O.TREE, 10); put(O.BUSH, 5); put(O.TUFT, 8); put(O.ROCK, 4); put(O.CLAY, 3);
    return { ground, obj };
  };
})(window.FL);
