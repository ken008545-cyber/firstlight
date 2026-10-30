// Firstlight food & player hunger (Radix). Patches FL.World at runtime; load after game.js.
(function (FL) {
  const P = FL.World.prototype, T = FL.T;
  const stackCap = k => FL.STACK[k] || FL.STACK.default;
  FL.slotsUsed = inv => Object.entries(inv).reduce((s, [k, n]) => s + (n > 0 ? Math.ceil(n / stackCap(k)) : 0), 0);
  FL.roomFor = (inv, k) => { const free = FL.INV_SLOTS - FL.slotsUsed(inv), n = inv[k] || 0, partial = n % stackCap(k) ? stackCap(k) - n % stackCap(k) : 0; return partial + Math.max(0, free) * stackCap(k); };

  // stack caps: adds beyond bag space are refused (removals untouched)
  const addItem = P.addItem;
  P.addItem = function (k, n) {
    if (n > 0) {
      if (k === 'Hide' && n === 3) addItem.call(this, 'Raw Meat', Math.min(2, FL.roomFor(this.inv, 'Raw Meat'))); // raptor kill
      const room = FL.roomFor(this.inv, k); if (n > room) { if (this.say) this.say('Bag full'); n = room; } if (!n) return;
    }
    return addItem.call(this, k, n);
  };

  P.nearFire = function () { const p = this.player; return this.buildings.some(b => b.done && b.type === 'campfire' && Math.hypot(b.tx * T + T / 2 - p.x, b.ty * T + T / 2 - p.y) <= FL.COOK_RANGE * T); };
  P.bestFood = function () { const p = this.player, need = 100 - (p.hunger ?? 100); return Object.keys(FL.FOOD).filter(k => (this.inv[k] || 0) > 0).sort((a, b) => (!!FL.FOOD[a].sick - !!FL.FOOD[b].sick) || Math.abs(FL.FOOD[a].hunger - need) - Math.abs(FL.FOOD[b].hunger - need))[0]; };
  P.eat = function (k) {
    k = k || this.bestFood(); const f = FL.FOOD[k], p = this.player;
    if (!f || !(this.inv[k] > 0)) { this.say('Nothing to eat'); return false; }
    if ((p.hunger ?? 100) >= 99) { this.say('Not hungry'); return false; }
    this.addItem(k, -1); p.hunger = Math.min(100, (p.hunger ?? 100) + f.hunger);
    if (f.sick) { p.hp = Math.max(1, p.hp - f.sick); this.say(`Ate ${k} (raw!) +${f.hunger}`); } else this.say(`Ate ${k} +${f.hunger}`);
    this.sfx && this.sfx('pick_berries'); return true;
  };
  P.cook = function (k) {
    k = k || Object.keys(FL.FOOD).find(x => FL.FOOD[x].cooksTo && this.inv[x] > 0); const f = FL.FOOD[k];
    if (!f || !f.cooksTo || !(this.inv[k] > 0)) { this.say('Nothing to cook'); return false; }
    if (!this.nearFire()) { this.say('Stand by a campfire to cook.'); return false; }
    const n = this.inv[k]; this.addItem(k, -n); this.addItem(f.cooksTo, n); this.say(`Cooked ${n} ${f.cooksTo}`); this.sfx && this.sfx('craft'); return true;
  };

  // new commands go through exec so clients forward them to the host like any other
  const exec = P.exec;
  P.exec = function (cmd) {
    if (cmd.t !== 'eat' && cmd.t !== 'cook') return exec.call(this, cmd);
    if (this.over || !FL.ui.playing) return false;
    const pid = cmd.pid || this.localId; if (!this.players[pid]) return false;
    if (this.onCommand) this.onCommand({ ...cmd, pid });
    if (this.net && this.net.client && pid === this.localId) return this.net.forward(cmd);
    return this.as(pid, () => cmd.t === 'eat' ? this.eat(cmd.item) : this.cook(cmd.item));
  };

  // player hunger (host-authoritative, like hp)
  const stepPlayer = P.stepPlayer;
  P.stepPlayer = function (dt) {
    const p = this.player, hp0 = p.hp; if (p.hunger == null) p.hunger = 80;
    stepPlayer.call(this, dt);
    if (hp0 <= 0 || (p.hp === this.maxHp() && hp0 < p.hp - 1)) p.hunger = Math.max(p.hunger, 60); // respawn
    p.hunger = Math.max(0, p.hunger - dt * FL.HUNGER_DAY / FL.DAY_LEN);
    if (p.hunger <= 0) { p.hp -= dt * 0.12; p.hurtT = Math.max(p.hurtT, 0.5); }
  };

  // spoilage at dawn: each day removes ceil(count / spoilDays) (all if days <= 1)
  const rot = (bag, k, days) => { const n = bag[k] || 0; if (!n || !days) return 0; const r = days <= 1 ? n : Math.ceil(n / days); bag[k] = n - r; if (bag[k] <= 0) delete bag[k]; return r; };
  const onDawn = P.onDawn;
  P.onDawn = function () {
    onDawn.call(this); let lost = 0, mine = 0;
    for (const k in FL.FOOD) { for (const id in this.players) { const r = rot(this.players[id].inv, k, FL.FOOD[k].spoil[0]); if (this.players[id] === this.local) mine += r; } lost += rot(this.storage, k, FL.FOOD[k].spoil[1]); }
    for (const id in this.players) this.as(id, () => this.syncHotbar());
    if (mine || lost) FL.ui.toast(`Food spoiled overnight${mine ? `: ${mine} from your bag` : ''}${lost ? `, ${lost} in storage` : ''}.`);
  };

  // save/load: hunger per player (inv itself is already a plain {item:count} object)
  const ser = P.serialize, load = P.loadSave;
  P.serialize = function () { const s = ser.call(this); s.hunger = {}; for (const id in this.players) s.hunger[id] = Math.round(this.players[id].hunger ?? 80); return s; };
  P.loadSave = function (s) { const r = load.apply(this, arguments); const h = s.hunger || {}; for (const id in this.players) this.players[id].hunger = h[id] ?? h[this.localId] ?? 80; if (this.local && h[Object.keys(h)[0]] != null && h[this.localId] == null) this.local.hunger = h[Object.keys(h)[0]]; return r; };
})(window.FL);
