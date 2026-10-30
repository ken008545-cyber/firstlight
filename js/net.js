// Firstlight 0.2 host-and-join multiplayer (PeerJS, free public broker). The host's browser runs the world;
// clients move their own avatar and send commands. If PeerJS is missing or fails, nothing here runs.
(function (FL) {
  const W = FL.W;
  // Last-write-wins stamp compare from Mythorion's shared-world prototype (world.js `newer`):
  // later timestamp wins; on a tie the higher player id wins.
  const newer = (a, b) => !b || a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  const r1 = n => Math.round(n * 10) / 10;
  const net = FL.net = {
    peer: null, conn: null, client: false, isHost: false, conns: {}, code: null, acc: 0, ops: [], stamps: new Map(), log: [], sent: new Map(), sentG: new Map(), nextN: 2,
    available() { return typeof window.Peer === 'function'; },
    status(msg) { net.last = msg; const el = document.getElementById('netStatus'); if (el) el.textContent = msg; },
    opts() { return FL.PEER_OPTS || { debug: 0 }; },
    host() {
      const g = FL.game; if (!g || !net.available()) { net.status('Multiplayer unavailable (PeerJS not loaded).'); return null; }
      if (net.peer) return net.code;
      try {
        net.code = Math.random().toString(36).slice(2, 7).toUpperCase();
        net.peer = new Peer('firstlight-' + net.code, net.opts()); net.isHost = true; g.net = net;
        net.peer.on('open', () => net.status('Hosting. Code: ' + net.code));
        net.startBeat();
        net.peer.on('error', e => net.status('Network error: ' + (e.type || e)));
        net.peer.on('connection', c => {
          c.on('open', () => {
            const g = FL.game, pid = 'p' + (net.nextN++); net.conns[pid] = c;
            g.addPlayer(pid, g.local.x + 32, g.local.y);
            c.send({ t: 'snap', pid, save: g.serialize() });
            net.status('Hosting. Code: ' + net.code + ' · players: ' + (1 + Object.keys(net.conns).length));
          });
          c.on('data', m => { c.lastSeen = Date.now(); net.onHostMsg(c, m); });
          c.on('close', () => net.dropConn(c));
          c.on('error', () => net.dropConn(c));
        });
      } catch (e) { net.status('Multiplayer failed: ' + e.message); net.peer = null; net.isHost = false; g.net = null; return null; }
      return net.code;
    },
    join(code) {
      code = (code || '').trim().toUpperCase(); if (!code) return;
      if (!net.available()) { net.status('Multiplayer unavailable (PeerJS not loaded).'); return; }
      try {
        net.peer = new Peer(undefined, net.opts()); net.status('Connecting…');
        net.peer.on('error', e => net.status('Network error: ' + (e.type || e)));
        net.peer.on('open', () => {
          const c = net.conn = net.peer.connect('firstlight-' + code, { reliable: true });
          c.on('open', () => { net.hostSeen = Date.now(); net.startBeat(); });
          c.on('data', m => { net.hostSeen = Date.now(); net.onClientMsg(m); });
          c.on('close', () => net.hostLost());
          c.on('error', () => net.hostLost());
        });
      } catch (e) { net.status('Multiplayer failed: ' + e.message); }
    },
    // Heartbeat: ping every 2 s both ways; anyone silent for 6 s is treated as gone.
    BEAT_MS: 2000, TIMEOUT_MS: 6000,
    startBeat() {
      if (net.beat) return;
      net.beat = setInterval(() => {
        const now = Date.now();
        if (net.isHost) {
          for (const id in net.conns) {
            const c = net.conns[id];
            if (now - (c.lastSeen || now) > net.TIMEOUT_MS || c.open === false && c.lastSeen) { net.dropConn(c); continue; }
            if (c.open) try { c.send({ t: 'ping' }); } catch (e) {}
          }
        } else if (net.conn) {
          if (net.hostSeen && now - net.hostSeen > net.TIMEOUT_MS) net.hostLost();
          else net.send({ t: 'ping' });
        }
      }, net.BEAT_MS);
    },
    dropConn(c) {
      for (const id in net.conns) if (net.conns[id] === c) {
        delete net.conns[id]; FL.game && FL.game.removePlayer(id);
        try { c.close(); } catch (e) {}
        net.status('Hosting. Code: ' + net.code + ' · players: ' + (1 + Object.keys(net.conns).length));
        FL.ui && FL.ui.toast && FL.ui.toast(id + ' left the world.');
      }
    },
    hostLost() {
      if (net.lost) return; net.lost = true;
      clearInterval(net.beat); net.beat = null;
      const msg = 'Host closed the world. Connection lost.';
      net.status(msg); FL.ui && FL.ui.toast && FL.ui.toast(msg);
      if (FL.game) FL.game.hostGone = true;
    },
    onClientMsg(m) {
      if (m.t === 'ping') return;
      if (m.t === 'snap') { net.client = true; net.pid = m.pid; FL.ui.startNet(m.save, m.pid); net.status('Joined as ' + m.pid); }
      else if (m.t === 'tick' && FL.game && FL.game.net === net && FL.game.local) net.apply(m);
    },
    onHostMsg(c, m) {
      const pid = Object.keys(net.conns).find(k => net.conns[k] === c), g = FL.game, p = pid && g.players[pid]; if (!p) return;
      if (m.t === 'ping') return;
      if (m.t === 'pos') { p.setPosition(m.x, m.y); p.setFlipX(!!m.flip); if (m.face) p.face = m.face; }
      else if (m.t === 'cmd' && m.cmd && typeof m.cmd.t === 'string') net.ops.push({ cmd: m.cmd, pid, ts: +m.ts || 0 });
    },
    // client side of exec(): own movement stays local, every world-changing command goes to the host
    forward(cmd) {
      const g = FL.game;
      if (cmd.t === 'input') {
        g.local.input = { mx: +cmd.mx || 0, my: +cmd.my || 0, act: false };
        if (cmd.act && performance.now() - (net.actT || 0) > 250) { net.actT = performance.now(); net.send({ t: 'cmd', cmd: { t: 'act' }, ts: Date.now() }); }
        return true;
      }
      net.send({ t: 'cmd', cmd, ts: Date.now() }); return true;
    },
    send(m) { if (net.conn && net.conn.open) net.conn.send(m); },
    frame(dt) {
      const g = FL.game;
      if (net.isHost && net.ops.length) { // apply peer edits in edit-log order (ts, then player id)
        const ops = net.ops.sort((a, b) => a.ts - b.ts || (a.pid > b.pid ? 1 : -1)); net.ops = [];
        for (const { cmd, pid, ts } of ops) {
          if (cmd.t === 'place' || cmd.t === 'dig') {
            const i = (cmd.y | 0) * W + (cmd.x | 0), st = [ts, pid]; if (!newer(st, net.stamps.get(i))) continue;
            if (g.exec({ ...cmd, pid })) { net.stamps.set(i, st); net.log.push({ player: pid, ts, i, to: cmd.t === 'dig' ? 'pit' : cmd.type }); }
          } else g.exec({ ...cmd, pid });
        }
      }
      net.acc += dt; if (net.acc < 0.1) return; net.acc = 0; // ~10 Hz
      if (net.isHost) { const t = net.tick(); for (const id in net.conns) { const c = net.conns[id]; if (c.open) c.send(t); } }
      else if (net.client) { const p = g.local; net.send({ t: 'pos', x: +p.x, y: +p.y, flip: !!p.flipX, face: p.face ? [+p.face[0] || 0, +p.face[1] || 0] : [0, 1] }); }
    },
    tick() {
      const g = FL.game, objs = [];
      for (const i of g.diffs) if (net.sent.get(i) !== g.obj[i]) { net.sent.set(i, g.obj[i]); objs.push([i, g.obj[i]]); }
      const gd = []; for (const i of g.gDiffs || []) if (net.sentG.get(i) !== g.ground[i]) { net.sentG.set(i, g.ground[i]); gd.push([i, g.ground[i]]); }
      return { t: 'tick', time: g.time, storage: g.storage, objs, gd, over: g.over,
        b: g.buildings.map(b => [b.type, b.tx, b.ty, b.done ? 1 : 0, r1(b.work), b.delivered]),
        v: g.villagers.map(v => [Math.round(v.x), Math.round(v.y), r1(v.hp), v.name]),
        e: g.enemies.map(e => [e.kind, Math.round(e.x), Math.round(e.y), r1(e.hp)]),
        p: Object.values(g.players).map(q => [q.id, Math.round(q.x), Math.round(q.y), r1(q.hp), q.inv, q.hotbar, q.sel, Math.round(q.hunger ?? 80)]) };
    },
    dropB(g, b) { g.bAt.delete(b.ty * W + b.tx); g.buildings.splice(g.buildings.indexOf(b), 1); b.img.destroy(); if (b.glow) b.glow.destroy(); },
    apply(m) {
      const g = FL.game; g.time = m.time; g.storage = m.storage;
      for (const [i, v] of m.gd || []) g.setGround(i, v);
      for (const [i, o] of m.objs) { g.obj[i] = o; g.diffs.add(i); g.drawObj(i); }
      const seen = new Set(); let relight = false;
      for (const [type, tx, ty, done, work, del] of m.b) {
        const i = ty * W + tx; seen.add(i); let b = g.bAt.get(i);
        if (b && b.type !== type) { net.dropB(g, b); b = null; }
        if (!b) { b = g.addBuilding(type, tx, ty, !!done); relight = true; }
        b.work = work; b.delivered = del || {}; if (!!done !== b.done) { b.done = !!done; relight = true; } g.styleBuilding(b);
      }
      for (const b of g.buildings.slice()) if (!seen.has(b.ty * W + b.tx)) { net.dropB(g, b); relight = true; }
      if (relight) g.recomputeLight();
      while (g.villagers.length > m.v.length) g.villagers.pop().destroy();
      m.v.forEach((d, k) => { const v = g.villagers[k] || g.addVillager(d[0], d[1]); v.setPosition(d[0], d[1]); v.hp = d[2]; v.name = d[3]; });
      const old = g.enemies.slice(), out = [];
      m.e.forEach((d, k) => {
        let e = old[k]; if (e && e.kind === d[0]) old[k] = null; else { e = g.spawn(d[0], 0, 0); g.enemies.pop(); }
        e.setPosition(d[1], d[2]); e.hp = d[3]; out.push(e);
      });
      for (const e of old) if (e) e.destroy(); g.enemies = out;
      const ids = new Set();
      for (const [id, x, y, hp, inv, hotbar, sel, hunger] of m.p) {
        ids.add(id);
        if (id === g.localId) { const p = g.local; p.hp = hp; p.inv = inv || {}; p.hotbar = hotbar || p.hotbar; p.sel = sel || 0; if (hunger != null) p.hunger = hunger; continue; }
        const q = g.players[id] || g.addPlayer(id, x, y); q.setPosition(x, y); q.hp = hp; if (hunger != null) q.hunger = hunger;
      }
      for (const id in g.players) if (!ids.has(id) && id !== g.localId) g.removePlayer(id);
      if (m.over && !g.over) { g.over = true; FL.ui.toast('The host\'s fire went out.'); }
    }
  };
})(window.FL);
