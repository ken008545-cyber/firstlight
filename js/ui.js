// Firstlight DOM UI: title, saves, HUD, inventory/crafting, build tray, touch controls
(function (FL) {
  const $ = id => document.getElementById(id);
  const KEY = n => 'firstlight.slot' + n;
  FL.isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (FL.isTouch) document.body.classList.add('touch');

  const saves = FL.saves = {
    read(n) { try { const s = JSON.parse(localStorage.getItem(KEY(n))); return s && saves.migrate(s); } catch (e) { return null; } },
    write(n, s) { try { localStorage.setItem(KEY(n), JSON.stringify(s)); return true; } catch (e) { ui.toast('Save failed: ' + e.message); return false; } },
    migrate(s) {
      if (!s || s.game !== 'firstlight' || typeof s.v !== 'number') return null;
      if (s.v > FL.SAVE_VERSION) { ui.toast('That save is from a newer version.'); return null; }
      // future: if (s.v === 1) { ...; s.v = 2; }
      return s;
    }
  };

  const ui = FL.ui = {
    playing: false, slot: 1, game: null,
    toast(msg) {
      const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('toasts').appendChild(t);
      while ($('toasts').children.length > 4) $('toasts').firstChild.remove();
      setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 500); }, 2600);
    },
    flash() { $('flash').style.opacity = 1; setTimeout(() => $('flash').style.opacity = 0, 150); },
    sw(k) { return `<span class="sw" style="background:${FL.RES_COLOR[k] || '#999'}"></span>`; },
    renderSlots() {
      let h = '';
      for (let n = 1; n <= 3; n++) {
        const s = saves.read(n);
        const info = s ? `Day ${s.time.day} · tribe ${s.summary ? s.summary.pop : '?'} · seed ${s.seed}<br><span class="small">${new Date(s.savedAt).toLocaleString()}</span>` : '<i>Empty</i>';
        h += `<div class="slotc"><div><b>Slot ${n}</b><br>${info}</div><div>${s ? `<button class="btn ok" data-cont="${n}">Continue</button>` : ''}<button class="btn" data-new="${n}">New World</button>${s ? `<button class="btn" data-exp="${n}">Export</button>` : ''}<button class="btn" data-imp="${n}">Import</button></div></div>`;
      }
      $('slots').innerHTML = h;
    },
    start(slot, save, seed) {
      ui.slot = slot; ui.playing = false;
      $('title').classList.add('hidden'); $('over').classList.add('hidden'); ui.closeAll();
      const data = { slot, save, seed: save ? save.seed : (seed >>> 0) };
      const sc = FL.phaser.scene.getScene('world');
      if (sc && sc.sys.settings.active) sc.scene.restart(data); else FL.phaser.scene.start('world', data);
      if (!save) $('intro').classList.remove('hidden');
    },
    newSeed() { const v = $('seedIn').value.trim(); if (!v) return (Math.random() * 1e9) >>> 0; if (/^\d+$/.test(v)) return +v >>> 0; let h = 2166136261; for (const c of v) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; },
    onGameStart(g) {
      ui.game = g; $('hud').classList.remove('hidden');
      if ($('intro').classList.contains('hidden')) ui.playing = true;
      ui.refresh(); ui.refreshHotbar(); if (!g.startData.save) ui.autosave();
    },
    autosave() { const g = ui.game; if (!g || g.over) return; saves.write(ui.slot, g.serialize()); },
    exportSlot(n) {
      const s = n ? saves.read(n) : ui.game.serialize(); if (!s) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' }));
      a.download = `firstlight-slot${n || ui.slot}-day${s.time.day}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    importTo(n) {
      const f = $('importFile'); f.value = '';
      f.onchange = () => { const file = f.files[0]; if (!file) return; file.text().then(t => {
        let s; try { s = saves.migrate(JSON.parse(t)); } catch (e) { s = null; }
        if (!s) { ui.toast('Not a valid Firstlight save'); alert('Not a valid Firstlight save file.'); return; }
        saves.write(n, s); ui.toast(`Imported into slot ${n}`); ui.renderSlots();
        if (ui.game && ui.playing && n === ui.slot) ui.start(n, s);
      }); };
      f.click();
    },
    gameOver(day) { ui.playing = false; $('overTxt').textContent = `Your tribe lasted ${day} day${day > 1 ? 's' : ''}. The fog takes the cave.`; $('over').classList.remove('hidden'); localStorage.removeItem(KEY(ui.slot)); },
    toTitle() { ui.autosave(); ui.playing = false; ui.closeAll(); $('hud').classList.add('hidden'); ui.renderSlots(); $('title').classList.remove('hidden'); },
    closeAll() { ['inv', 'menu', 'build'].forEach(i => $(i).classList.add('hidden')); if (ui.game && ui.game.ghostType) ui.game.cancelGhost(); },
    toggleInv() { if (!ui.playing) return; const h = $('inv').classList.contains('hidden'); ui.closeAll(); if (h) { $('inv').classList.remove('hidden'); ui.refreshInv(); } },
    toggleBuild() { if (!ui.playing) return; const h = $('build').classList.contains('hidden'); ui.closeAll(); if (h) { $('build').classList.remove('hidden'); ui.refreshBuild(); } },
    refresh() {
      const g = ui.game; if (!g) return;
      $('pop').textContent = g.villagers.length; $('food').textContent = g.storage.Berries || 0;
      $('dayl').textContent = `Day ${g.time.day} · ${g.isNight() ? 'Night' : 'Day'}`;
      $('hp').style.width = (100 * g.player.hp / g.maxHp()) + '%';
      const t = g.time.t, day = t < 0.65, f = day ? t / 0.65 : (t - 0.65) / 0.35, a = Math.PI * (1 - f);
      const sun = $('sun'); sun.setAttribute('cx', 42 + 36 * Math.cos(a)); sun.setAttribute('cy', 42 - 36 * Math.sin(a)); sun.setAttribute('fill', day ? '#F2A33A' : '#EFE3C8');
      if (!$('inv').classList.contains('hidden')) ui.refreshInv();
      if (!$('build').classList.contains('hidden')) ui.refreshBuild();
    },
    refreshHotbar() {
      const g = ui.game; if (!g) return; let h = '';
      g.hotbar.forEach((k, s) => { h += `<div class="slot ${s === g.sel ? 'sel' : ''}" data-slot="${s}"><span class="k">${s + 1}</span>${k ? `${ui.sw(k)}<span class="nm">${k}</span><span class="n">${g.inv[k] || 0}</span>` : ''}</div>`; });
      $('hotbar').innerHTML = h;
    },
    refreshInv() {
      const g = ui.game, chips = o => Object.entries(o).filter(([, n]) => n > 0).map(([k, n]) => `<span class="chip">${ui.sw(k)}${k} ${n}</span>`).join('') || '<i class="small">nothing</i>';
      $('invGrid').innerHTML = chips(g.inv); $('storeGrid').innerHTML = chips(g.storage);
      const can = r => Object.entries(r.cost).every(([k, n]) => (g.inv[k] || 0) >= n);
      const list = FL.RECIPES.slice().sort((a, b) => can(b) - can(a));
      const html = list.map(r => `<div class="rec ${can(r) ? '' : 'no'}"><div><b>${ui.sw(r.out)}${r.out}</b><br>${Object.entries(r.cost).map(([k, n]) => `<span class="${(g.inv[k] || 0) >= n ? '' : 'miss'}">${n} ${k}${(g.inv[k] || 0) < n ? ` (${g.inv[k] || 0})` : ''}</span>`).join(', ')}<div class="d">${r.desc}</div></div><button class="btn ${can(r) ? 'ok' : ''}" data-craft="${r.out}" ${can(r) ? '' : 'disabled'}>Craft</button></div>`).join('');
      if ($('recipes').dataset.h !== html) { $('recipes').innerHTML = html; $('recipes').dataset.h = html; }
    },
    refreshBuild() {
      const g = ui.game; if (!g) return;
      const html = Object.entries(FL.BUILD).map(([k, b]) => `<div class="card ${g.ghostType === k ? 'on' : ''}" data-build="${k}"><b>${b.name}</b><br>${Object.entries(b.cost).map(([r, n]) => `<span class="${(g.storage[r] || 0) >= n ? '' : 'miss'}">${n} ${r}</span>`).join(', ')}<br><span class="small">${b.desc}</span></div>`).join('');
      if ($('cards').dataset.h !== html) { $('cards').innerHTML = html; $('cards').dataset.h = html; }
      $('ghostBtns').classList.toggle('hidden', !g.ghostType);
    }
  };

  // ---- wiring ----
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cont],[data-new],[data-exp],[data-imp],[data-craft],[data-build],[data-slot],[data-close]'); if (!t) return;
    const d = t.dataset;
    if (d.cont) { const s = saves.read(+d.cont); if (s) ui.start(+d.cont, s); }
    else if (d.new) { if (!saves.read(+d.new) || confirm(`Start a new world in slot ${d.new}? The old one is overwritten.`)) ui.start(+d.new, null, ui.newSeed()); }
    else if (d.exp) ui.exportSlot(+d.exp);
    else if (d.imp) ui.importTo(+d.imp);
    else if (d.craft) { ui.game.exec({ t: 'craft', out: d.craft }); ui.refreshInv(); }
    else if (d.build) { ui.game.startGhost(d.build); $('cards').dataset.h = ''; ui.refreshBuild(); }
    else if (d.slot) ui.game.select(+d.slot);
    else if (d.close !== undefined) ui.closeAll();
  });
  $('menuBtn').onclick = () => { const h = $('menu').classList.contains('hidden'); ui.closeAll(); if (h) { $('menu').classList.remove('hidden'); $('menuInfo').textContent = `Slot ${ui.slot} · seed ${ui.game.seed} · save v${FL.SAVE_VERSION} · autosaves every minute and at dawn`; } };
  $('saveBtn').onclick = () => { ui.autosave(); ui.toast('Saved'); };
  $('expBtn').onclick = () => { ui.autosave(); ui.exportSlot(ui.slot); };
  $('impBtn').onclick = () => ui.importTo(ui.slot);
  $('newBtn').onclick = () => { if (confirm('Abandon this world and start a new one in this slot?')) ui.start(ui.slot, null, (Math.random() * 1e9) >>> 0); };
  $('titleBtn').onclick = () => ui.toTitle();
  $('depBtn').onclick = () => { ui.game.exec({ t: 'deposit' }); ui.refreshInv(); };
  $('placeBtn').onclick = () => ui.game.tryPlace();
  $('cancelBtn').onclick = () => ui.game.cancelGhost();
  $('beginBtn').onclick = () => { $('intro').classList.add('hidden'); ui.playing = true; };
  $('overNew').onclick = () => ui.start(ui.slot, null, (Math.random() * 1e9) >>> 0);
  $('overTitle').onclick = () => { $('over').classList.add('hidden'); ui.toTitle(); };
  $('tBuild').onclick = () => ui.toggleBuild();
  $('tTorch').onclick = () => ui.game && ui.game.exec({ t: 'torch' });
  $('tInv').onclick = () => ui.toggleInv();
  const act = $('tAct');
  act.addEventListener('pointerdown', e => { e.preventDefault(); FL.input.actionHeld = true; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => act.addEventListener(ev, () => FL.input.actionHeld = false));
  // stick
  const stick = $('stick'), knob = $('knob'); let sid = null;
  const setK = (x, y) => { knob.style.left = (40 + x * 40) + 'px'; knob.style.top = (40 + y * 40) + 'px'; FL.input.stick = { x, y }; };
  stick.addEventListener('pointerdown', e => { sid = e.pointerId; stick.setPointerCapture(sid); move(e); });
  const move = e => { if (e.pointerId !== sid) return; const r = stick.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / 50, y = (e.clientY - r.top - r.height / 2) / 50; const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } setK(x, y); };
  stick.addEventListener('pointermove', move);
  ['pointerup', 'pointercancel'].forEach(ev => stick.addEventListener(ev, () => { sid = null; setK(0, 0); }));
  window.addEventListener('beforeunload', () => ui.playing && ui.autosave());
  document.addEventListener('visibilitychange', () => { if (document.hidden && ui.playing) ui.autosave(); });

  // ---- boot ----
  $('ver').textContent = FL.VERSION;
  FL.phaser = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#1E2228', scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [], input: { activePointers: 3 } });
  FL.phaser.scene.add('world', FL.World, false);
  ui.renderSlots();
})(window.FL);
