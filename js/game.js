// Firstlight world scene
(function (FL) {
  const { T, W, H, G, O, ODEF, BUILD } = FL;
  const C = FL.COL;
  const css = c => '#' + c.toString(16).padStart(6, '0');
  const idx = (x, y) => y * W + x;
  const inB = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const tc = p => Math.floor(p / T);
  const center = t => t * T + T / 2;
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  FL.input = FL.input || { stick: { x: 0, y: 0 }, actionHeld: false };

  class World extends Phaser.Scene {
    constructor() { super('world'); }
    init(data) { this.startData = data || {}; }

    create() {
      FL.game = this;
      this.makeTextures();
      const sd = this.startData.save;
      this.seed = sd ? sd.seed : (this.startData.seed >>> 0);
      this.slot = this.startData.slot || 1;
      const wg = FL.genWorld(this.seed);
      this.ground = wg.ground; this.obj = wg.obj;
      this.objHp = new Map(); this.regrow = new Map(); this.diffs = new Set();
      this.explored = new Uint8Array(W * H); this.vis = new Uint8Array(W * H); this.light = new Uint8Array(W * H);
      this.bAt = new Map(); this.buildings = []; this.villagers = []; this.enemies = []; this.claims = new Set();
      this.players = {}; this._actor = null; this.localId = 'p1';
      this.storage = {}; this.over = false; this.fogTimer = 0; this.uiTimer = 0; this.autoTimer = 0; this.spawnTimer = 0;
      this.nextVid = 1;

      // tilemap
      this.map = this.make.tilemap({ tileWidth: T, tileHeight: T, width: W, height: H });
      const tsG = this.map.addTilesetImage('tiles', 'tiles', T, T, 0, 0, 0);
      const tsO = this.map.addTilesetImage('objs', 'objs', T, T, 0, 0, 10);
      const tsF = this.map.addTilesetImage('fogt', 'fogt', T, T, 0, 0, 20);
      this.gLayer = this.map.createBlankLayer('ground', tsG).setDepth(0);
      this.oLayer = this.map.createBlankLayer('objs', tsO).setDepth(1);
      this.fLayer = this.map.createBlankLayer('fog', tsF).setDepth(50);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { this.gLayer.putTileAt(this.ground[idx(x, y)], x, y); this.fLayer.putTileAt(20, x, y).alpha = 0.97; }

      this.bars = this.add.graphics().setDepth(60);
      this.tint = this.add.rectangle(0, 0, 10, 10, 0x2a3560, 1).setOrigin(0).setScrollFactor(0).setDepth(49).setBlendMode(Phaser.BlendModes.MULTIPLY).setAlpha(0);
      this.animT = 0; this.waterFrame = 0;
      this.ghost = this.add.graphics().setDepth(70); this.ghostType = null; this.ghostTile = null;
      this.local = this.addPlayer(this.localId);

      if (sd) this.loadSave(sd); else this.newWorld();
      for (let i = 0; i < W * H; i++) this.drawObj(i);
      this.recomputeLight();

      // camera
      const cam = this.cameras.main;
      cam.setBounds(0, 0, W * T, H * T); cam.startFollow(this.local, true, 0.15, 0.15);
      cam.setBackgroundColor(css(C.fog));
      const fitZoom = () => cam.setZoom(Math.min(this.scale.width, this.scale.height) < 600 ? 0.8 : 1);
      fitZoom(); this.scale.on('resize', fitZoom);

      // input
      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,F');
      this.input.keyboard.addCapture('SPACE,UP,DOWN,LEFT,RIGHT');
      const kb = this.input.keyboard;
      kb.on('keydown-E', () => FL.ui.toggleInv());
      kb.on('keydown-B', () => FL.ui.toggleBuild());
      kb.on('keydown-T', () => this.exec({ t: 'torch' }));
      kb.on('keydown-Q', () => this.exec({ t: 'deposit' }));
      kb.on('keydown-ESC', () => { if (this.ghostType) this.cancelGhost(); else FL.ui.closeAll(); });
      kb.on('keydown-ENTER', () => { if (this.ghostType) this.tryPlace(); });
      for (let n = 1; n <= 8; n++) kb.on('keydown-' + ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'][n - 1], () => this.exec({ t: 'select', slot: n - 1 }));
      this.input.on('wheel', (p, o, dx, dy) => this.exec({ t: 'select', slot: (this.sel + (dy > 0 ? 1 : 7)) % 8 }));
      this.input.on('pointermove', p => { if (this.ghostType && !FL.isTouch) this.ghostTile = [tc(p.worldX), tc(p.worldY)]; });
      this.input.on('pointerdown', p => this.onTap(p));
      this.events.on('shutdown', () => { this.scale.off('resize', fitZoom); });

      this.updateFog(true);
      FL.ui.onGameStart(this);
    }

    // ---------- textures (all procedural) ----------
    makeTextures() {
      if (this.textures.exists('tiles')) return;
      const mk = (key, w, h, fn) => { const t = this.textures.createCanvas(key, w, h); fn(t.getContext(), w, h); t.refresh(); };
      const r = FL.rng(42);
      const shade = (hex, f) => { const c = Phaser.Display.Color.IntegerToColor(hex); return `rgb(${Math.min(255, c.red * f) | 0},${Math.min(255, c.green * f) | 0},${Math.min(255, c.blue * f) | 0})`; };
      mk('tiles', T * 6, T, ctx => {
        [C.water, C.sand, C.grass, C.dirt, C.stone].forEach((c, k) => {
          ctx.fillStyle = css(c); ctx.fillRect(k * T, 0, T, T);
          for (let n = 0; n < 14; n++) { ctx.fillStyle = shade(c, r() < 0.5 ? 0.88 : 1.1); ctx.fillRect(k * T + r() * 30, r() * 30, 2, 2); }
          if (k === 0) { ctx.strokeStyle = shade(c, 1.25); ctx.beginPath(); ctx.moveTo(k * T + 6, 10); ctx.lineTo(k * T + 14, 8); ctx.moveTo(k * T + 16, 22); ctx.lineTo(k * T + 26, 20); ctx.stroke(); }
        });
        ctx.fillStyle = css(C.water); ctx.fillRect(5 * T, 0, T, T); ctx.strokeStyle = shade(C.water, 1.25);
        ctx.beginPath(); ctx.moveTo(5 * T + 3, 14); ctx.lineTo(5 * T + 12, 12); ctx.moveTo(5 * T + 18, 26); ctx.lineTo(5 * T + 29, 24); ctx.moveTo(5 * T + 20, 6); ctx.lineTo(5 * T + 26, 5); ctx.stroke();
      });
      mk('objs', T * 8, T, ctx => {
        const at = k => k * T;
        // tree
        ctx.fillStyle = '#5a3d22'; ctx.fillRect(at(1) + 13, 18, 6, 12);
        ctx.fillStyle = '#3f6626'; ctx.beginPath(); ctx.arc(at(1) + 16, 13, 11, 0, 7); ctx.fill();
        ctx.fillStyle = '#4f7a2e'; ctx.beginPath(); ctx.arc(at(1) + 13, 11, 6, 0, 7); ctx.fill();
        // rock
        ctx.fillStyle = '#6f6f68'; ctx.beginPath(); ctx.moveTo(at(2) + 4, 26); ctx.lineTo(at(2) + 8, 9); ctx.lineTo(at(2) + 20, 5); ctx.lineTo(at(2) + 29, 15); ctx.lineTo(at(2) + 27, 27); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#a5a59c'; ctx.beginPath(); ctx.moveTo(at(2) + 9, 12); ctx.lineTo(at(2) + 19, 8); ctx.lineTo(at(2) + 15, 15); ctx.fill();
        // bush full + empty
        [3, 7].forEach(k => { ctx.fillStyle = '#4c7a2a'; ctx.beginPath(); ctx.arc(at(k) + 11, 18, 8, 0, 7); ctx.arc(at(k) + 21, 18, 8, 0, 7); ctx.arc(at(k) + 16, 12, 8, 0, 7); ctx.fill(); });
        ctx.fillStyle = '#7a3a8a'; [[10, 14], [20, 12], [15, 20], [23, 20], [12, 22]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(at(3) + x, y, 2.4, 0, 7); ctx.fill(); });
        // tuft
        ctx.strokeStyle = '#a8b85a'; ctx.lineWidth = 2; for (let n = 0; n < 6; n++) { ctx.beginPath(); ctx.moveTo(at(4) + 9 + n * 3, 27); ctx.lineTo(at(4) + 6 + n * 4, 9 + (n % 2) * 5); ctx.stroke(); }
        // clay
        ctx.fillStyle = '#a8603a'; ctx.beginPath(); ctx.ellipse(at(5) + 16, 19, 11, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#c47a50'; ctx.beginPath(); ctx.ellipse(at(5) + 13, 17, 4, 2, 0, 0, 7); ctx.fill();
        // bones
        ctx.strokeStyle = '#ece6d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(at(6) + 7, 22); ctx.lineTo(at(6) + 24, 12); ctx.moveTo(at(6) + 9, 12); ctx.lineTo(at(6) + 22, 24); ctx.stroke();
      });
      mk('fogt', T, T, ctx => { ctx.fillStyle = css(C.fog); ctx.fillRect(0, 0, T, T); });
      const body = (key, fill, band) => mk(key, 24, 24, ctx => { ctx.fillStyle = fill; ctx.strokeStyle = css(C.text); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(12, 12, 9, 0, 7); ctx.fill(); ctx.stroke(); if (band) { ctx.fillStyle = band; ctx.fillRect(4, 7, 16, 3); } });
      body('player', '#d9a874', css(C.torch)); body('villager', '#b88a5a', '#6B8E3A');
      mk('shadow', 26, 26, ctx => { ctx.fillStyle = 'rgba(20,10,30,0.9)'; ctx.beginPath(); ctx.arc(13, 14, 11, 0, 7); ctx.fill(); ctx.fillStyle = css(C.danger); ctx.fillRect(8, 11, 3, 3); ctx.fillRect(15, 11, 3, 3); });
      mk('raptor', 34, 22, ctx => { ctx.fillStyle = '#5d6b3a'; ctx.beginPath(); ctx.ellipse(15, 12, 12, 7, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(27, 8, 6, 4, 0, 0, 7); ctx.fill(); ctx.fillStyle = css(C.danger); ctx.fillRect(8, 9, 12, 2); ctx.fillStyle = '#000'; ctx.fillRect(29, 6, 2, 2); });
      mk('hut', T, T, ctx => { ctx.fillStyle = css(C.sand); ctx.beginPath(); ctx.arc(16, 17, 14, 0, 7); ctx.fill(); ctx.strokeStyle = css(C.dirt); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#3a2a18'; ctx.fillRect(13, 22, 7, 9); ctx.strokeStyle = '#b8a066'; ctx.lineWidth = 1; for (let a = 0; a < 6; a++) { ctx.beginPath(); ctx.moveTo(16, 17); ctx.lineTo(16 + Math.cos(a) * 13, 17 + Math.sin(a) * 13); ctx.stroke(); } });
      mk('campfire', T, T, ctx => { ctx.fillStyle = css(C.stone); for (let a = 0; a < 8; a++) { ctx.beginPath(); ctx.arc(16 + Math.cos(a * 0.785) * 11, 17 + Math.sin(a * 0.785) * 11, 3.5, 0, 7); ctx.fill(); } ctx.fillStyle = css(C.torch); ctx.beginPath(); ctx.moveTo(10, 22); ctx.quadraticCurveTo(16, 0, 22, 22); ctx.fill(); ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.moveTo(13, 22); ctx.quadraticCurveTo(16, 10, 19, 22); ctx.fill(); });
      mk('storage', T, T, ctx => { ctx.fillStyle = '#7a5230'; for (let n = 0; n < 3; n++) ctx.fillRect(4, 18 + n * 4 - n * 0, 24 - n * 4, 4); ctx.fillStyle = css(C.stone); ctx.beginPath(); ctx.arc(10, 12, 5, 0, 7); ctx.arc(20, 11, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#7a3a8a'; ctx.beginPath(); ctx.arc(24, 18, 3, 0, 7); ctx.fill(); });
      mk('fence', T, T, ctx => { ctx.fillStyle = '#6a4626'; [4, 14, 24].forEach(x => ctx.fillRect(x, 6, 5, 22)); ctx.fillRect(2, 11, 28, 3); ctx.fillRect(2, 20, 28, 3); });
      mk('torchpost', T, T, ctx => { ctx.fillStyle = '#5a3d22'; ctx.fillRect(14, 12, 4, 18); ctx.fillStyle = css(C.torch); ctx.beginPath(); ctx.arc(16, 10, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(16, 11, 2.5, 0, 7); ctx.fill(); });
      mk('glow', 256, 256, ctx => { const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(242,163,58,0.9)'); g.addColorStop(0.5, 'rgba(242,163,58,0.35)'); g.addColorStop(1, 'rgba(242,163,58,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256); });
      mk('spark', 6, 6, ctx => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 6, 6); });
    }

    // ---------- world state ----------
    newWorld() {
      const cx = W / 2, cy = H / 2;
      this.time = { day: 1, t: 0.05 };
      this.addBuilding('campfire', cx, cy, true);
      this.addBuilding('storage', cx + 2, cy + 1, true);
      this.storage = { Wood: 6, Fiber: 4, Berries: 12, Stone: 2 };
      this.inv = { Wood: 2, Fiber: 2 };
      this.player.setPosition(center(cx), center(cy + 2));
      for (let k = 0; k < 3; k++) this.addVillager(center(cx - 2 + k * 2), center(cy - 2));
      this.syncHotbar();
    }
    addVillager(x, y, d) {
      const v = this.add.image(x, y, 'villager').setDepth(5);
      Object.assign(v, { vid: this.nextVid++, hp: 10, hunger: 80, name: FL.NAMES[(this.nextVid * 7) % FL.NAMES.length], path: null, state: null, timer: 0, carry: null, haul: null, target: null, cd: 0, think: 0 }, d || {});
      this.villagers.push(v); return v;
    }
    addBuilding(type, tx, ty, done, extra) {
      const b = { type, tx, ty, done: !!done, delivered: {}, incoming: {}, work: 0, ...(extra || {}) };
      b.img = this.add.image(center(tx), center(ty), type === 'torch' ? 'torchpost' : type).setDepth(2);
      this.buildings.push(b); this.bAt.set(idx(tx, ty), b);
      this.styleBuilding(b);
      if (this.player && this.villagers && FL.ui.playing) { b.img.setScale(1, 0.1); this.tweens.add({ targets: b.img, scaleY: 1, duration: 350, ease: 'Back.Out' }); }
      return b;
    }
    styleBuilding(b) {
      b.img.setAlpha(b.done ? 1 : 0.45);
      if (b.done && (b.type === 'campfire' || b.type === 'torch') && !b.glow) b.glow = this.add.image(b.img.x, b.img.y, 'glow').setDepth(51).setBlendMode(Phaser.BlendModes.ADD).setScale(b.type === 'torch' ? 0.9 : 1.4);
    }
    drawObj(i) {
      const o = this.obj[i], x = i % W, y = (i / W) | 0;
      if (o) this.oLayer.putTileAt(10 + o, x, y); else this.oLayer.removeTileAt(x, y);
    }
    setObj(i, o) { this.obj[i] = o; this.objHp.delete(i); this.diffs.add(i); this.drawObj(i); }

    blocked(x, y) {
      if (!inB(x, y)) return true;
      const i = idx(x, y);
      if (this.ground[i] === G.WATER) return true;
      const o = this.obj[i]; if (o && ODEF[o].block) return true;
      const b = this.bAt.get(i); return !!(b && b.done && BUILD[b.type] && BUILD[b.type].block);
    }
    blockedPx(px, py) { return this.blocked(tc(px), tc(py)); }
    moveEnt(e, dx, dy, ghost) {
      const r = 9;
      const hit = (x, y) => !ghost && [[-r, -r], [r, -r], [-r, r], [r, r]].some(([ox, oy]) => this.blockedPx(x + ox, y + oy));
      const stuck = hit(e.x, e.y);
      if (stuck || !hit(e.x + dx, e.y)) e.x += dx;
      if (stuck || !hit(e.x, e.y + dy)) e.y += dy;
      e.x = Phaser.Math.Clamp(e.x, 4, W * T - 4); e.y = Phaser.Math.Clamp(e.y, 4, H * T - 4);
    }
    // BFS: goal(x,y) returns truthy target when tile is a goal
    bfs(sx, sy, goal, max = 7000) {
      const prev = new Int32Array(W * H).fill(-2); const q = [idx(sx, sy)]; prev[q[0]] = -1;
      for (let h = 0; h < q.length && h < max; h++) {
        const i = q[h], x = i % W, y = (i / W) | 0;
        const g = goal(x, y);
        if (g) { const path = []; let c = i; while (c !== -1 && prev[c] !== -1) { path.push([c % W, (c / W) | 0]); c = prev[c]; } path.reverse(); return { path, target: g }; }
        for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (!inB(nx, ny)) continue; const ni = idx(nx, ny); if (prev[ni] !== -2 || this.blocked(nx, ny)) continue; prev[ni] = i; q.push(ni); }
      }
      return null;
    }
    adjTo(x, y, tx, ty) { return Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1; }
    followPath(e, dt, speed) {
      if (!e.path || !e.path.length) { e.path = null; return true; }
      const [nx, ny] = e.path[0]; const gx = center(nx), gy = center(ny);
      const dx = gx - e.x, dy = gy - e.y, d = Math.hypot(dx, dy), step = speed * dt;
      if (d <= step) { e.x = gx; e.y = gy; e.path.shift(); if (!e.path.length) { e.path = null; return true; } }
      else { e.x += dx / d * step; e.y += dy / d * step; if (e.setFlipX) e.setFlipX(dx < 0); }
      return false;
    }

    // ---------- time & light ----------
    nightF() { const t = this.time.t; if (t < 0.6) return 0; if (t < 0.68) return (t - 0.6) / 0.08; if (t < 0.95) return 1; return 1 - (t - 0.95) / 0.05; }
    isNight() { return this.nightF() > 0.5; }
    playerTorch() { return this.hotbar[this.sel] === 'Torch' && (this.inv.Torch || 0) > 0; }
    recomputeLight() {
      this.light.fill(0);
      for (const b of this.buildings) {
        if (!b.done) continue;
        const r = b.type === 'campfire' ? BUILD.campfire.light : b.type === 'torch' ? FL.TORCH_LIGHT : 0; if (!r) continue;
        this.disc(b.tx, b.ty, r, i => { this.light[i] = 1; });
      }
    }
    disc(cx, cy, r, fn) { const R = Math.ceil(r); for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) if (inB(x, y) && (x - cx) ** 2 + (y - cy) ** 2 <= r * r) fn(idx(x, y), x, y); }
    isLit(x, y) {
      if (!inB(x, y)) return false; if (this.light[idx(x, y)]) return true;
      for (const id in this.players) { const q = this.players[id]; if (q.hotbar[q.sel] === 'Torch' && (q.inv.Torch || 0) > 0) { const px = tc(q.x), py = tc(q.y); if ((x - px) ** 2 + (y - py) ** 2 <= FL.TORCH_LIGHT ** 2) return true; } }
      return false;
    }
    updateFog(force) {
      const nf = this.nightF(); this.vstamp = (this.vstamp || 0) % 250 + 1; const s = this.vstamp;
      const mark = i => { this.vis[i] = s; this.explored[i] = 1; };
      const p = this.player, pr = nf > 0.5 ? (this.playerTorch() ? 5 : 2.5) : 7;
      this.disc(tc(p.x), tc(p.y), pr, mark);
      for (const v of this.villagers) this.disc(tc(v.x), tc(v.y), nf > 0.5 ? 2 : 4, mark);
      for (const b of this.buildings) if (b.done && (b.type === 'campfire' || b.type === 'torch')) this.disc(b.tx, b.ty, b.type === 'torch' ? FL.TORCH_LIGHT : 6, mark);
      const cam = this.cameras.main, v = cam.worldView;
      const x0 = Math.max(0, tc(v.x) - 2), y0 = Math.max(0, tc(v.y) - 2), x1 = Math.min(W - 1, tc(v.right) + 2), y1 = Math.min(H - 1, tc(v.bottom) + 2);
      const dimA = 0.55 + 0.25 * nf, visNight = 0.4 * nf;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const i = idx(x, y), tile = this.fLayer.getTileAt(x, y);
        let a = 0.97;
        if (this.vis[i] === s) a = this.isLit(x, y) ? 0 : visNight; else if (this.explored[i]) a = dimA;
        tile.alpha = a;
        if (a < 0.9) { if (this.obj[i] === O.TREE) { const ot = this.oLayer.getTileAt(x, y); if (ot) ot.rotation = Math.sin(this.animT * 1.6 + x * 0.7 + y * 0.3) * 0.06; }
          if (this.ground[i] === G.WATER) { const gt = this.gLayer.getTileAt(x, y); const f = ((x + y + this.waterFrame) >> 1) & 1 ? 5 : 0; if (gt.index !== f) gt.index = f; } }
      }
      // hide what you cannot see
      const seen = e => { const i = idx(Phaser.Math.Clamp(tc(e.x), 0, W - 1), Phaser.Math.Clamp(tc(e.y), 0, H - 1)); return this.vis[i] === s; };
      for (const e of this.enemies) e.setVisible(seen(e));
      for (const v2 of this.villagers) v2.setVisible(seen(v2) || this.explored[idx(tc(v2.x), tc(v2.y))] === 1);
    }

    // ---------- player ----------
    select(n) { this.sel = n; if (this.isLocalActor()) FL.ui.refreshHotbar(); }
    addItem(k, n) {
      this.inv[k] = (this.inv[k] || 0) + n; if (this.inv[k] <= 0) delete this.inv[k];
      this.syncHotbar();
    }
    syncHotbar() {
      for (let s = 0; s < 8; s++) if (this.hotbar[s] && !this.inv[this.hotbar[s]]) this.hotbar[s] = null;
      const pri = ['Flint Spear', 'Torch', 'Flint Axe'];
      const keys = Object.keys(this.inv).sort((a, b) => (pri.indexOf(b) - pri.indexOf(a)));
      for (const k of keys) if (!this.hotbar.includes(k)) { const e = this.hotbar.indexOf(null); if (e >= 0) this.hotbar[e] = k; }
      if (FL.ui && this.isLocalActor()) FL.ui.refreshHotbar();
    }
    maxHp() { return 10 + (this.inv['Hide Wrap'] ? 5 : 0); }
    craft(r) {
      for (const k in r.cost) if ((this.inv[k] || 0) < r.cost[k]) return false;
      for (const k in r.cost) this.addItem(k, -r.cost[k]);
      this.addItem(r.out, 1); this.say(`Crafted ${r.out}`); return true;
    }
    deposit(manual) {
      const st = this.nearestBuilding('storage', tc(this.player.x), tc(this.player.y));
      if (!st || Math.hypot(center(st.tx) - this.player.x, center(st.ty) - this.player.y) > T * 2.2) { if (manual) this.say('Stand next to a storage pile to deposit.'); return false; }
      let n = 0; for (const k of [...FL.RES, 'Clay Pot']) { const c = this.inv[k] || 0; if (c > 0) { this.storage[k] = (this.storage[k] || 0) + c; n += c; delete this.inv[k]; } }
      this.syncHotbar(); this.say(n ? `Deposited ${n} items to the tribe` : 'Nothing to deposit'); return true;
    }
    placeTorch() {
      if (!(this.inv.Torch > 0)) { this.say('Craft a Torch first (E): 1 Wood, 1 Fiber'); return; }
      const x = tc(this.player.x), y = tc(this.player.y);
      const spot = [[0, 0], ...DIRS8].map(([dx, dy]) => [x + dx, y + dy]).find(([a, b]) => inB(a, b) && !this.blocked(a, b) && !this.bAt.has(idx(a, b)) && !this.obj[idx(a, b)]);
      if (!spot) { this.say('No room for a torch here'); return; }
      this.addItem('Torch', -1); this.addBuilding('torch', spot[0], spot[1], true); this.recomputeLight(); this.say('Torch placed. The fog draws back.');
    }
    nearestEnemy(x, y, range) { let best = null, bd = range; for (const e of this.enemies) { const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; best = e; } } return best; }
    act(tile) {
      const p = this.player; if (p.cd > 0) return; p.cd = 0.4;
      const spear = (this.inv['Flint Spear'] || 0) > 0;
      const en = this.nearestEnemy(p.x, p.y, (spear ? 2.4 : 1.5) * T);
      if (en) { this.hurt(en, spear ? 3 : 1, p); this.swing(en.x, en.y); return; }
      const px = tc(p.x), py = tc(p.y);
      let target = null;
      if (tile && this.adjTo(px, py, tile[0], tile[1]) && this.obj[idx(tile[0], tile[1])] && ODEF[this.obj[idx(tile[0], tile[1])]].hp) target = tile;
      if (!target) { let bd = 9; for (const [dx, dy] of [[0, 0], ...DIRS8]) { const x = px + dx, y = py + dy; if (!inB(x, y)) continue; const o = this.obj[idx(x, y)]; if (!o || !ODEF[o].hp) continue; const d = Math.hypot(center(x) - p.x - p.face[0] * 12, center(y) - p.y - p.face[1] * 12); if (d < bd * T) { bd = d / T; target = [x, y]; } } }
      if (target) { this.hitObj(target[0], target[1], (this.inv['Flint Axe'] && this.obj[idx(target[0], target[1])] === O.TREE) ? 2 : 1, true); this.swing(center(target[0]), center(target[1])); return; }
      const bp = this.buildings.find(b => !b.done && this.adjTo(px, py, b.tx, b.ty) && this.bpReady(b));
      if (bp) { bp.work += 2; this.swing(bp.img.x, bp.img.y); this.checkDone(bp); return; }
      p.cd = 0.1;
    }
    swing(x, y, from) {
      const p = from || this.player, a = Math.atan2(y - p.y, x - p.x), g = this.add.graphics().setDepth(55);
      g.lineStyle(4, C.panel, 0.9).beginPath().arc(p.x, p.y, 22, a - 0.9, a + 0.9).strokePath();
      this.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() });
      if (p.setAngle) { p.setAngle(Math.cos(a) >= 0 ? 18 : -18); this.tweens.add({ targets: p, angle: 0, duration: 180 }); }
    }
    burst(x, y, col, n) {
      if ((this.fx = this.fx || 0) > 60) return;
      for (let k = 0; k < n; k++) { this.fx++; const s = this.add.image(x, y, 'spark').setDepth(55).setTint(col).setScale(0.6 + Math.random() * 0.6);
        const a = Math.random() * 6.283, d = 10 + Math.random() * 18;
        this.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - 8, alpha: 0, angle: 180, duration: 350 + Math.random() * 200, onComplete: () => { s.destroy(); this.fx--; } }); }
    }
    hitObj(x, y, dmg, byPlayer, v) {
      const i = idx(x, y), o = this.obj[i]; if (!o || !ODEF[o].hp) return null;
      if (this.vis[i] === this.vstamp) this.burst(center(x), center(y), [0, 0x7a5230, 0xa5a59c, 0x7a3a8a, 0xa8b85a, 0xa8603a, 0xece6d6][o], byPlayer ? 6 : 3);
      const hp = (this.objHp.has(i) ? this.objHp.get(i) : ODEF[o].hp) - dmg;
      if (hp > 0) { this.objHp.set(i, hp); this.diffs.add(i); return null; }
      const got = {};
      for (const [k, n, ch] of ODEF[o].drops) if (ch === undefined || Math.random() < ch) got[k] = (got[k] || 0) + n;
      if (ODEF[o].regrow) { this.setObj(i, O.BUSH_EMPTY); this.regrow.set(i, this.worldTime() + FL.DAY_LEN * 0.8); } else this.setObj(i, 0);
      if (byPlayer) { for (const k in got) this.addItem(k, got[k]); this.say('+ ' + Object.entries(got).map(([k, n]) => n + ' ' + k).join(', ')); }
      return got;
    }
    worldTime() { return (this.time.day - 1 + this.time.t) * FL.DAY_LEN; }
    onTap(p) {
      if (this.over || !FL.ui.playing) return;
      const x = tc(p.worldX), y = tc(p.worldY); if (!inB(x, y)) return;
      if (this.ghostType) { this.ghostTile = [x, y]; if (!FL.isTouch) this.tryPlace(); return; }
      const pl = this.player, px = tc(pl.x), py = tc(pl.y);
      const en = this.nearestEnemy(p.worldX, p.worldY, T);
      if (en && Math.hypot(en.x - pl.x, en.y - pl.y) < 2.6 * T) { this.exec({ t: 'act' }); return; }
      const o = this.obj[idx(x, y)];
      this.exec({ t: 'goto', x, y });
    }
    gotoCmd(x, y) {
      const pl = this.player, px = tc(pl.x), py = tc(pl.y), o = this.obj[idx(x, y)];
      if (o && ODEF[o].hp && this.adjTo(px, py, x, y)) { this.act([x, y]); pl.autoTile = [x, y]; return; }
      const goal = (o && ODEF[o].hp) || this.blocked(x, y) ? (a, b) => this.adjTo(a, b, x, y) && !(a === x && b === y && this.blocked(x, y)) : (a, b) => a === x && b === y;
      const r = this.bfs(px, py, goal, 4000);
      if (r) { pl.path = r.path; pl.autoTile = (o && ODEF[o].hp) ? [x, y] : null; }
    }

    // ---------- build ----------
    startGhost(type) { this.ghostType = type; const p = this.player; this.ghostTile = [tc(p.x) + 2, tc(p.y)]; }
    cancelGhost() { this.ghostType = null; this.ghostTile = null; this.ghost.clear(); FL.ui.refreshBuild(); }
    canPlace(x, y) {
      if (!inB(x, y) || !this.explored[idx(x, y)]) return false;
      const i = idx(x, y); if (this.ground[i] === G.WATER || this.bAt.has(i)) return false;
      const o = this.obj[i]; if (o && o !== O.TUFT) return false;
      for (const id in this.players) if (tc(this.players[id].x) === x && tc(this.players[id].y) === y) return false;
      return true;
    }
    tryPlace() {
      if (!this.ghostType || !this.ghostTile) return;
      this.exec({ t: 'place', type: this.ghostType, x: this.ghostTile[0], y: this.ghostTile[1] });
    }
    placeCmd(type, x, y) {
      if (!BUILD[type]) return false;
      if (!this.canPlace(x, y)) { this.say("Can't build there"); return false; }
      if (this.obj[idx(x, y)]) this.setObj(idx(x, y), 0);
      this.addBuilding(type, x, y, false);
      this.say(`${BUILD[type].name} blueprint placed. Villagers will haul and build it.`);
      if (!this.isLocalActor()) return true;
      if (!FL.isTouch && this.input.keyboard.checkDown(this.input.keyboard.addKey('SHIFT'), 0)) return true; // shift = keep placing
      this.cancelGhost(); return true;
    }
    need(b, k) { return BUILD[b.type].cost[k] - (b.delivered[k] || 0) - (b.incoming[k] || 0); }
    bpReady(b) { const c = BUILD[b.type].cost; for (const k in c) if ((b.delivered[k] || 0) < c[k]) return false; return true; }
    checkDone(b) {
      if (b.done || b.work < BUILD[b.type].work) return;
      b.done = true; this.styleBuilding(b); b.img.setScale(1, 0.2); this.tweens.add({ targets: b.img, scaleY: 1, duration: 600, ease: 'Bounce.Out' }); this.burst(b.img.x, b.img.y, 0xD9C38A, 10); this.recomputeLight();
      FL.ui.toast(`${BUILD[b.type].name} finished!`);
      if (b.type === 'hut') { this.addVillager(center(b.tx), center(b.ty + 1)); FL.ui.toast('A new family joins the tribe.'); }
      for (const v of this.villagers) if (v.target === b) { v.state = null; v.target = null; }
    }
    nearestBuilding(type, x, y, pred) { let best = null, bd = 1e9; for (const b of this.buildings) { if (b.type !== type || !b.done || (pred && !pred(b))) continue; const d = Math.abs(b.tx - x) + Math.abs(b.ty - y); if (d < bd) { bd = d; best = b; } } return best; }

    // ---------- villagers ----------
    goTo(v, goal, state, target) { const r = this.bfs(tc(v.x), tc(v.y), goal); if (!r) return false; v.path = r.path; v.state = state; v.target = target !== undefined ? target : r.target; if (!v.path.length) v.path = null; return true; }
    goStore(v, state) { return this.goTo(v, (x, y) => this.buildings.find(b => b.type === 'storage' && b.done && this.adjTo(x, y, b.tx, b.ty)) || false, state); }
    goGather(v, oType) {
      const ok = this.goTo(v, (x, y) => { for (const [dx, dy] of [[0, 0], ...DIRS8]) { const a = x + dx, b = y + dy; if (!inB(a, b)) continue; const i = idx(a, b); if (this.obj[i] === oType && !this.claims.has(i)) return [a, b]; } return false; }, 'gather');
      if (ok) { v.claim = idx(v.target[0], v.target[1]); this.claims.add(v.claim); }
      return ok;
    }
    release(v) { if (v.claim !== undefined) { this.claims.delete(v.claim); v.claim = undefined; } }
    assign(v) {
      this.release(v); v.target = null; v.state = null;
      if (v.haul) { const b = v.haul.b; if (this.buildings.includes(b) && this.goTo(v, (x, y) => this.adjTo(x, y, b.tx, b.ty) || false, 'deliver', b)) return; v.carry = { [v.haul.k]: v.haul.n }; v.haul = null; }
      if (v.carry) { if (this.goStore(v, 'store')) return; }
      if (this.isNight()) { const f = this.nearestBuilding('campfire', tc(v.x), tc(v.y)); if (f && this.goTo(v, (x, y) => (Math.hypot(x - f.tx, y - f.ty) <= 2.3 && !(x === f.tx && y === f.ty)) || false, 'sleep', f)) return; }
      if (v.hunger < 45 && (this.storage.Berries || 0) > 0) { if (this.goStore(v, 'eat')) return; }
      const bps = this.buildings.filter(b => !b.done);
      for (const b of bps) for (const k in BUILD[b.type].cost) {
        const n = Math.min(this.need(b, k), this.storage[k] || 0, 4);
        if (n > 0 && this.goStore(v, 'take')) { this.storage[k] -= n; b.incoming[k] = (b.incoming[k] || 0) + n; v.haul = { b, k, n }; return; }
      }
      for (const b of bps) if (this.bpReady(b) && this.villagers.filter(o => o.target === b).length < 2 && this.goTo(v, (x, y) => this.adjTo(x, y, b.tx, b.ty) && !(x === b.tx && y === b.ty) || false, 'build', b)) return;
      for (const b of bps) for (const k in BUILD[b.type].cost) if (this.need(b, k) > 0 && FL.SOURCE[k] && this.goGather(v, FL.SOURCE[k])) return;
      const pop = this.villagers.length;
      if ((this.storage.Berries || 0) < pop * 4 && this.goGather(v, O.BUSH)) return;
      const order = ['Wood', 'Fiber', 'Stone', 'Clay'].sort((a, b) => ((this.storage[a] || 0) / (a === 'Wood' ? 2 : 1)) - ((this.storage[b] || 0) / (b === 'Wood' ? 2 : 1)));
      const pick = order[(v.vid + this.time.day) % 2 === 0 ? 0 : 1];
      if (this.goGather(v, FL.SOURCE[pick])) return;
      if (this.goGather(v, FL.SOURCE[order[0]])) return;
      v.timer = 2; v.state = 'idle';
    }
    arrive(v) {
      const s = v.state;
      if (s === 'gather') { const [x, y] = v.target; if (this.obj[idx(x, y)]) { v.state = 'chop'; v.timer = 1.4; } else v.state = null; }
      else if (s === 'store') { for (const k in v.carry) this.storage[k] = (this.storage[k] || 0) + v.carry[k]; v.carry = null; v.state = null; }
      else if (s === 'take') { v.state = null; }
      else if (s === 'deliver') { const { b, k, n } = v.haul; b.incoming[k] -= n; b.delivered[k] = (b.delivered[k] || 0) + n; v.haul = null; v.state = null; }
      else if (s === 'eat') { if ((this.storage.Berries || 0) > 0) { this.storage.Berries--; v.hunger = Math.min(100, v.hunger + 60); } v.state = null; }
      else if (s === 'build') { v.state = 'building'; }
      else if (s === 'sleep') { v.state = 'sleeping'; }
      else v.state = null;
    }
    updateVillager(v, dt) {
      v.hunger -= dt * 100 / FL.DAY_LEN;
      if (v.hunger <= 0) { v.hunger = 0; v.hp -= dt * 0.12; }
      else if (v.hp < 10 && this.light[idx(tc(v.x), tc(v.y))]) v.hp = Math.min(10, v.hp + dt * 0.2);
      if (v.path) { if (this.followPath(v, dt, 85)) this.arrive(v); return; }
      if (v.state === 'chop') {
        v.timer -= dt; if (v.timer > 0) return;
        const [x, y] = v.target; this.swing(center(x), center(y), v); const got = this.hitObj(x, y, 1, false, v);
        if (got) { this.release(v); v.carry = got; v.state = null; } else if (!this.obj[idx(x, y)]) v.state = null; else v.timer = 1.4;
        return;
      }
      if (v.state === 'building') { const b = v.target; if (!b || b.done || !this.buildings.includes(b)) { v.state = null; return; } b.work += dt; this.checkDone(b); return; }
      if (v.state === 'sleeping') { if (!this.isNight()) v.state = null; else if (v.hunger < 30 && (this.storage.Berries || 0) > 0) { this.storage.Berries--; v.hunger += 60; } return; }
      if (v.state === 'idle') { v.timer -= dt; if (v.timer > 0) return; }
      v.think -= dt; if (v.think > 0) return; v.think = 0.3 + Math.random() * 0.3;
      this.assign(v);
    }

    // ---------- enemies ----------
    hurt(e, dmg, from) {
      e.hp -= dmg; e.setTintFill && e.setTintFill(C.danger); this.time2 = 0;
      this.timeEvent(() => e.active && e.clearTint && e.clearTint(), 120);
      if (from && e.kind) { const a = Math.atan2(e.y - from.y, e.x - from.x); this.moveEnt(e, Math.cos(a) * 14, Math.sin(a) * 14, e.kind === 'shadow'); }
      if (e.isPlayer) { e.hurtT = 4; if (e === this.local) FL.ui.flash(); }
    }
    timeEvent(fn, ms) { this.time_ ? 0 : 0; this.sys.time.delayedCall(ms, fn); }
    spawn(kind, x, y) {
      const e = this.add.image(center(x), center(y), kind).setDepth(5);
      Object.assign(e, { kind, hp: kind === 'raptor' ? 9 : 4, cd: 0, wander: 0, dir: [0, 0] });
      if (kind === 'shadow') e.setAlpha(0.9);
      this.enemies.push(e); return e;
    }
    findSpawn(minD, maxD, pred) {
      const px = tc(this.player.x), py = tc(this.player.y);
      for (let k = 0; k < 40; k++) { const a = Math.random() * 6.283, d = minD + Math.random() * (maxD - minD); const x = Math.round(px + Math.cos(a) * d), y = Math.round(py + Math.sin(a) * d); if (inB(x, y) && !this.blocked(x, y) && pred(x, y)) return [x, y]; }
      return null;
    }
    updateEnemies(dt) {
      const night = this.isNight();
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = 4;
        const shadows = this.enemies.filter(e => e.kind === 'shadow').length;
        if (night && shadows < Math.min(10, 2 + this.time.day)) { const s = this.findSpawn(9, 15, (x, y) => !this.isLit(x, y)); if (s) this.spawn('shadow', ...s); }
        const raptors = this.enemies.filter(e => e.kind === 'raptor').length;
        if (!night && this.time.t < 0.55 && raptors < (this.time.day >= 3 ? 2 : 1) && Math.random() < 0.25) { const s = this.findSpawn(16, 28, (x, y) => !this.light[idx(x, y)]); if (s) this.spawn('raptor', ...s); }
      }
      const targets = [...Object.values(this.players), ...this.villagers];
      for (const e of this.enemies) {
        e.cd -= dt;
        const ex = tc(e.x), ey = tc(e.y);
        let tgt = null, td = (e.kind === 'shadow' ? 14 : 7) * T;
        for (const t of targets) { const d = Math.hypot(t.x - e.x, t.y - e.y); if (d < td && !(e.kind === 'raptor' && this.light[idx(tc(t.x), tc(t.y))])) { td = d; tgt = t; } }
        if (e.kind === 'shadow') {
          if (!night) e.hp -= dt * 1.5;
          if (this.isLit(ex, ey)) {
            e.hp -= dt * 2.5;
            let lx = 0, ly = 0; for (const [dx, dy] of DIRS8) if (!this.isLit(ex + dx * 2, ey + dy * 2)) { lx += dx; ly += dy; }
            const l = Math.hypot(lx, ly) || 1; this.moveEnt(e, lx / l * 70 * dt, ly / l * 70 * dt, true); continue;
          }
          if (tgt) {
            const a = Math.atan2(tgt.y - e.y, tgt.x - e.x), nx = e.x + Math.cos(a) * 60 * dt, ny = e.y + Math.sin(a) * 60 * dt;
            if (!this.isLit(tc(nx), tc(ny))) { e.x = nx; e.y = ny; }
          } else this.wander(e, dt, 30, true);
        } else {
          if (night) { e.hp = 0; continue; }
          if (tgt) { const a = Math.atan2(tgt.y - e.y, tgt.x - e.x); this.moveEnt(e, Math.cos(a) * 105 * dt, Math.sin(a) * 105 * dt); e.setFlipX(Math.cos(a) < 0); }
          else this.wander(e, dt, 50, false);
        }
        if (tgt && td < 22 && e.cd <= 0) { e.cd = e.kind === 'raptor' ? 1.2 : 1; this.hurt(tgt, e.kind === 'raptor' ? 2 : 1); }
      }
      for (const e of this.enemies.slice()) if (e.hp <= 0) {
        if (e.kind === 'raptor' && this.isNight() === false && (this._actor = Object.values(this.players).find(q => Math.hypot(e.x - q.x, e.y - q.y) < 4 * T))) { this.addItem('Hide', 3); this.addItem('Bone', 2); this._actor = null; FL.ui.toast('Raptor down! +3 Hide, +2 Bone'); }
        this.tweens.add({ targets: e, alpha: 0, duration: 300, onComplete: () => e.destroy() });
        this.enemies.splice(this.enemies.indexOf(e), 1);
      }
    }
    wander(e, dt, sp, ghost) { e.wander -= dt; if (e.wander <= 0) { e.wander = 1.5 + Math.random() * 2; const a = Math.random() * 6.283; e.dir = [Math.cos(a), Math.sin(a)]; } this.moveEnt(e, e.dir[0] * sp * dt, e.dir[1] * sp * dt, ghost); }

    // ---------- main loop ----------
    update(_, dms) {
      if (this.over || !FL.ui.playing) return;
      const dt = Math.min(0.05, dms / 1000);
      // time
      const prevNight = this.isNight();
      this.time.t += dt / FL.DAY_LEN;
      if (this.time.t >= 1) { this.time.t -= 1; this.time.day++; this.onDawn(); }
      if (this.isNight() !== prevNight) { FL.ui.toast(this.isNight() ? 'Night falls. Stay in the light.' : 'Dawn. The shadows melt away.'); for (const v of this.villagers) if (!v.haul && v.state !== 'chop' && v.state !== 'building') { v.path = null; this.release(v); v.state = null; v.think = 0; } }
      // player
      // local input becomes a command each frame (a network host would receive these from peers)
      { const k = this.keys; let mx = 0, my = 0;
        if (k.A.isDown || k.LEFT.isDown) mx -= 1; if (k.D.isDown || k.RIGHT.isDown) mx += 1;
        if (k.W.isDown || k.UP.isDown) my -= 1; if (k.S.isDown || k.DOWN.isDown) my += 1;
        if (FL.input.stick.x || FL.input.stick.y) { mx = FL.input.stick.x; my = FL.input.stick.y; }
        this.exec({ t: 'input', mx, my, act: !!(k.SPACE.isDown || k.F.isDown || FL.input.actionHeld) }); }
      for (const id in this.players) this.as(id, () => this.stepPlayer(dt));
      // villagers
      for (const v of this.villagers) if (v.hp > 0) this.updateVillager(v, dt);
      for (const v of this.villagers.slice()) if (v.hp <= 0) { this.release(v); if (v.haul) { this.storage[v.haul.k] = (this.storage[v.haul.k] || 0) + v.haul.n; v.haul.b.incoming[v.haul.k] -= v.haul.n; } FL.ui.toast(`${v.name} has died.`); v.destroy(); this.villagers.splice(this.villagers.indexOf(v), 1); }
      if (!this.villagers.length) { this.over = true; FL.ui.gameOver(this.time.day); return; }
      this.updateEnemies(dt);
      // regrow
      if (this.regrow.size) { const now = this.worldTime(); for (const [i, at] of this.regrow) if (now >= at) { this.regrow.delete(i); if (this.obj[i] === O.BUSH_EMPTY) this.setObj(i, O.BUSH); } }
      // glows
      const nf = this.nightF();
      for (const b of this.buildings) if (b.glow) { const f = Math.sin(this.animT * 9 + b.tx) * 0.04 + Math.random() * 0.04; b.glow.setAlpha(0.15 + 0.35 * nf + f).setScale((b.type === 'torch' ? 0.9 : 1.4) * (1 + f)); }
      for (const id in this.players) this.players[id].glow.setAlpha(0.2 + 0.4 * nf);
      // fog, bars, ghost
      this.fogTimer -= dt; if (this.fogTimer <= 0) { this.fogTimer = 0.15; this.updateFog(); }
      this.animT += dt; this.wfT = (this.wfT || 0) + dt; if (this.wfT > 0.7) { this.wfT = 0; this.waterFrame++; }
      this.tint.setSize(this.scale.width, this.scale.height).setAlpha(0.55 * nf); this.tint.fillColor = nf > 0 && nf < 1 ? 0x6a4a6a : 0x2a3560;
      for (const id in this.players) this.animEnt(this.players[id], dt, 0.08); for (const v of this.villagers) this.animEnt(v, dt, 0.08); for (const e of this.enemies) this.animEnt(e, dt, e.kind === 'shadow' ? 0.15 : 0.1, true);
      this.drawBars(); this.drawGhost();
      this.uiTimer -= dt; if (this.uiTimer <= 0) { this.uiTimer = 0.25; FL.ui.refresh(); }
      this.autoTimer += dt; if (this.autoTimer > 60) { this.autoTimer = 0; FL.ui.autosave(); }
    }
    animEnt(e, dt, amp, wob) {
      const moved = e._px !== undefined && Math.hypot(e.x - e._px, e.y - e._py) > 0.3; e._px = e.x; e._py = e.y;
      e._ph = (e._ph || Math.random() * 6) + dt * (moved ? 14 : 3);
      const s = Math.sin(e._ph), k = moved ? amp : amp * 0.25;
      e.setScale((1 + k * 0.6 * Math.abs(s)) * (e.flipX ? 1 : 1), 1 - k * Math.abs(s));
      if (wob) e.rotation = Math.sin(e._ph * 0.5) * (moved ? 0.12 : 0.05);
      if (e.kind === 'shadow') e.setAlpha(0.7 + 0.2 * Math.sin(e._ph * 0.7));
    }
    onDawn() {
      const pots = this.storage['Clay Pot'] || 0; if (pots) this.storage.Berries = (this.storage.Berries || 0) + pots * 2;
      FL.ui.toast(`Day ${this.time.day} begins.` + (pots ? ` Pots kept ${pots * 2} berries.` : '')); FL.ui.autosave();
    }
    drawBars() {
      const g = this.bars; g.clear();
      const bar = (x, y, f, col) => { g.fillStyle(0x000000, 0.5).fillRect(x - 12, y, 24, 4); g.fillStyle(col, 1).fillRect(x - 12, y, 24 * Phaser.Math.Clamp(f, 0, 1), 4); };
      const p = this.player; if (p.hp < this.maxHp()) bar(p.x, p.y - 18, p.hp / this.maxHp(), C.danger);
      for (const v of this.villagers) { if (v.hp < 10 && v.visible) bar(v.x, v.y - 18, v.hp / 10, C.danger); if (v.carry || v.haul) g.fillStyle(C.torch, 1).fillRect(v.x + 6, v.y - 12, 5, 5); }
      for (const e of this.enemies) if (e.visible) bar(e.x, e.y - 18, e.hp / (e.kind === 'raptor' ? 9 : 4), C.danger);
      for (const b of this.buildings) if (!b.done) {
        const c = BUILD[b.type].cost; let have = 0, all = 0; for (const k in c) { have += Math.min(c[k], b.delivered[k] || 0); all += c[k]; }
        bar(b.img.x, b.img.y + 14, have / all, C.torch); bar(b.img.x, b.img.y + 19, b.work / BUILD[b.type].work, C.grass);
      }
    }
    drawGhost() {
      const g = this.ghost; g.clear(); if (!this.ghostType || !this.ghostTile) return;
      const [x, y] = this.ghostTile, ok = this.canPlace(x, y), col = ok ? 0x3fbf3f : C.danger;
      g.lineStyle(3, col, 1).strokeRect(x * T + 1, y * T + 1, T - 2, T - 2); g.fillStyle(col, 0.25).fillRect(x * T, y * T, T, T);
    }

    stepPlayer(dt) {
      const p = this.player; p.cd -= dt; p.hurtT -= dt;
      const { mx, my, act } = p.input, ml = Math.hypot(mx, my);
      if (ml > 0.1) { const s = 150 * dt * Math.min(1, ml) / ml; this.moveEnt(p, mx * s, my * s); p.path = null; p.autoTile = null; p.face = [mx / ml, my / ml]; p.setFlipX(mx < 0); }
      else if (p.path) { this.followPath(p, dt, 150); }
      else if (p.autoTile) { const [ax, ay] = p.autoTile; if (this.obj[idx(ax, ay)] && ODEF[this.obj[idx(ax, ay)]].hp && this.adjTo(tc(p.x), tc(p.y), ax, ay)) { if (p.cd <= 0) this.act(p.autoTile); } else p.autoTile = null; }
      if (act) this.act();
      if (p.hp <= 0) { const f = this.nearestBuilding('campfire', W / 2, H / 2); p.setPosition(center(f ? f.tx : W / 2), center(f ? f.ty + 1 : H / 2)); p.hp = this.maxHp(); p.path = null; this.say('You wake by the fire, bruised.'); }
      if (p.hurtT < 0 && p.hp < this.maxHp() && this.light[idx(tc(p.x), tc(p.y))]) p.hp = Math.min(this.maxHp(), p.hp + dt * 0.4);
      p.glow.setVisible(this.playerTorch()).setPosition(p.x, p.y).setScale(0.75 + Math.random() * 0.03);
    }

    // ---------- players & commands (multiplayer-ready seam) ----------
    // All player-driven changes go through exec(cmd). cmd = { t, pid?, ... } is plain JSON, so a
    // future host can apply commands received from peers exactly like local ones.
    get player() { return this._actor || this.local; }
    get inv() { return this.player.inv; } set inv(v) { this.player.inv = v; }
    get hotbar() { return this.player.hotbar; } set hotbar(v) { this.player.hotbar = v; }
    get sel() { return this.player.sel; } set sel(v) { this.player.sel = v; }
    addPlayer(id, x, y) {
      const p = this.add.image(x || 0, y || 0, 'player').setDepth(6);
      Object.assign(p, { id, isPlayer: true, hp: 10, cd: 0, hurtT: 0, path: null, autoTile: null, face: [0, 1], inv: {}, hotbar: new Array(8).fill(null), sel: 0, input: { mx: 0, my: 0, act: false } });
      p.glow = this.add.image(0, 0, 'glow').setDepth(51).setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
      if (id !== this.localId) p.setTint(0xd9c38a);
      this.players[id] = p; return p;
    }
    removePlayer(id) { const p = this.players[id]; if (!p || p === this.local) return; p.glow.destroy(); p.destroy(); delete this.players[id]; }
    as(id, fn) { const prev = this._actor; this._actor = this.players[id] || this.local; try { return fn(); } finally { this._actor = prev; } }
    isLocalActor() { return this.player === this.local; }
    say(msg) { if (this.isLocalActor()) FL.ui.toast(msg); }
    exec(cmd) {
      if (this.over || !FL.ui.playing) return false;
      const pid = cmd.pid || this.localId; if (!this.players[pid]) return false;
      if (this.onCommand) this.onCommand({ ...cmd, pid }); // hook for a future network layer
      return this.as(pid, () => {
        switch (cmd.t) {
          case 'input': this.player.input = { mx: +cmd.mx || 0, my: +cmd.my || 0, act: !!cmd.act }; return true;
          case 'act': this.act(cmd.tile); return true;
          case 'goto': this.gotoCmd(cmd.x | 0, cmd.y | 0); return true;
          case 'craft': { const r = FL.RECIPES.find(r => r.out === cmd.out); return !!r && this.craft(r); }
          case 'deposit': return this.deposit(true);
          case 'torch': this.placeTorch(); return true;
          case 'select': this.select(cmd.slot | 0); return true;
          case 'place': return this.placeCmd(cmd.type, cmd.x | 0, cmd.y | 0);
        }
        return false;
      });
    }

    // ---------- save / load ----------
    serialize() {
      const changes = {};
      for (const i of this.diffs) changes[i] = [this.obj[i], this.objHp.get(i) || 0, this.regrow.get(i) || 0];
      let bin = ''; for (let i = 0; i < W * H; i += 8) { let b = 0; for (let j = 0; j < 8; j++) if (this.explored[i + j]) b |= 1 << j; bin += String.fromCharCode(b); }
      const p = this.local;
      return { game: 'firstlight', v: FL.SAVE_VERSION, appVersion: FL.VERSION, seed: this.seed, savedAt: Date.now(), time: { ...this.time },
        player: { x: p.x, y: p.y, hp: p.hp }, inv: this.inv, hotbar: this.hotbar, sel: this.sel,
        players: Object.values(this.players).map(q => ({ id: q.id, x: q.x, y: q.y, hp: q.hp, inv: q.inv, hotbar: q.hotbar, sel: q.sel })), storage: this.storage, changes,
        buildings: this.buildings.map(b => ({ type: b.type, tx: b.tx, ty: b.ty, done: b.done, delivered: b.delivered, work: b.work })),
        villagers: this.villagers.map(v => ({ x: v.x, y: v.y, hp: v.hp, hunger: v.hunger, name: v.name, carry: v.carry, haul: v.haul ? { k: v.haul.k, n: v.haul.n } : null })),
        explored: btoa(bin), summary: { day: this.time.day, pop: this.villagers.length } };
    }
    loadSave(s) {
      this.time = { ...s.time }; this.inv = s.inv || {}; this.hotbar = s.hotbar || new Array(8).fill(null); this.sel = s.sel || 0; this.storage = s.storage || {};
      for (const i in s.changes) { const [o, hp, rg] = s.changes[i]; const n = +i; this.obj[n] = o; this.diffs.add(n); if (hp) this.objHp.set(n, hp); if (rg) this.regrow.set(n, rg); }
      for (const b of s.buildings) this.addBuilding(b.type, b.tx, b.ty, b.done, { delivered: b.delivered || {}, work: b.work || 0 });
      for (const v of s.villagers) { let carry = v.carry; if (v.haul) { carry = carry || {}; carry[v.haul.k] = (carry[v.haul.k] || 0) + v.haul.n; } this.addVillager(v.x, v.y, { hp: v.hp, hunger: v.hunger, name: v.name, carry }); }
      const bin = atob(s.explored || ''); for (let k = 0; k < bin.length; k++) { const b = bin.charCodeAt(k); for (let j = 0; j < 8; j++) if (b & (1 << j)) this.explored[k * 8 + j] = 1; }
      this.local.setPosition(s.player.x, s.player.y); this.local.hp = s.player.hp;
      for (const q of s.players || []) if (q.id === this.localId) Object.assign(this.local, { inv: q.inv || {}, hotbar: q.hotbar || this.local.hotbar, sel: q.sel || 0 });
      this.syncHotbar();
    }
  }
  FL.World = World;
})(window.FL);
