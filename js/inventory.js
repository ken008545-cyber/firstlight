// Firstlight inventory slot grid + hunger HUD + eat controls (Radix). Load after ui.js; touches no shared file.
(function (FL) {
  const ui = FL.ui, $ = id => document.getElementById(id);
  const cap = k => FL.STACK[k] || FL.STACK.default;
  const ICON = { Berries: 'berries', 'Raw Meat': 'meat', 'Cooked Meat': 'meat cooked', Wood: 'wood', Stone: 'stone', Torch: 'torch' };
  const css = document.createElement('style');
  css.textContent = `#invSlots{display:grid;grid-template-columns:repeat(4,56px);gap:4px;margin:4px 0}
#invSlots .islot{width:56px;height:56px;touch-action:manipulation}#invSlots .islot.food{box-shadow:inset 0 -4px 0 #6B8E3A}
#invSlots .islot.pick{border-color:var(--torch,#F2A33A)}#invInfo{min-height:2.4em;font-size:13px}
#invInfo .btn{padding:2px 8px;margin-left:4px}.slot .ic{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:20px;height:20px;border-radius:5px}
.slot .ic.berries{border-radius:50%}.slot .ic.meat{border-radius:50% 40% 50% 30%}.slot .ic.cooked{outline:2px solid #4A3420}
#hungerRow{display:flex;align-items:center;gap:4px;font-size:12px}#hungerBar{flex:1;height:6px;background:#0003;border-radius:3px;overflow:hidden;min-width:50px}#hungerBar i{display:block;height:100%;background:#6B8E3A}`;
  document.head.appendChild(css);
  const icon = k => `<span class="ic ${ICON[k] || ''}" style="background:${FL.RES_COLOR[k] || '#999'}"></span>`;
  let picked = null;

  // build stacks: each item split into stacks of its cap, edible first, padded to FL.INV_SLOTS
  FL.invStacks = inv => { const out = []; const keys = Object.keys(inv).filter(k => inv[k] > 0).sort((a, b) => (!FL.FOOD[b] - !FL.FOOD[a]) || a.localeCompare(b));
    for (const k of keys) { let n = inv[k]; while (n > 0) { const s = Math.min(n, cap(k)); out.push([k, s]); n -= s; } } return out; };

  function renderSlots() {
    const g = ui.game; if (!g) return; const grid = $('invGrid'); if (!grid) return;
    let box = $('invSlots'); if (!box) { box = document.createElement('div'); box.id = 'invSlots'; grid.before(box); const info = document.createElement('div'); info.id = 'invInfo'; box.after(info); }
    grid.style.display = 'none';
    const st = FL.invStacks(g.inv); let h = '';
    for (let i = 0; i < Math.max(FL.INV_SLOTS, st.length); i++) { const s = st[i];
      h += s ? `<div class="slot islot ${FL.FOOD[s[0]] ? 'food' : ''} ${picked === s[0] ? 'pick' : ''}" data-iitem="${s[0]}" title="${s[0]} (${s[1]}/${cap(s[0])})${FL.ITEM_DESC[s[0]] ? ' - ' + FL.ITEM_DESC[s[0]] : ''}">${icon(s[0])}<span class="nm">${s[0]}</span><span class="n">${s[1]}</span></div>` : '<div class="slot islot empty"></div>'; }
    h += ''; if (box.dataset.h !== h) { box.innerHTML = h; box.dataset.h = h; }
    const k = picked && g.inv[picked] ? picked : null, f = k && FL.FOOD[k];
    const info = k ? `<b>${k}</b> × ${g.inv[k]} · ${FL.ITEM_DESC[k] || ''}${f ? `<button class="btn ok" data-ieat="${k}">Eat</button>` : ''}${f && f.cooksTo ? `<button class="btn" data-icook="${k}">Cook${g.nearFire() ? '' : ' (at fire)'}</button>` : ''}`
      : `<span class="small">${FL.slotsUsed(g.inv)}/${FL.INV_SLOTS} slots · tap an item for details · R eats</span>`;
    if ($('invInfo').dataset.h !== info) { $('invInfo').innerHTML = info; $('invInfo').dataset.h = info; }
  }
  const refreshInv = ui.refreshInv; ui.refreshInv = function () { const r = refreshInv.apply(this, arguments); renderSlots(); return r; };

  // hunger HUD
  function hud() { const g = ui.game; if (!g || !g.player) return; let row = $('hungerRow');
    if (!row) { const st = document.querySelector('#tribe .stats'); if (!st) return; row = document.createElement('div'); row.id = 'hungerRow'; row.innerHTML = 'Hunger <span id="hungerBar"><i></i></span>'; st.appendChild(row); }
    const v = g.player.hunger ?? 80; row.querySelector('i').style.width = v + '%'; row.querySelector('i').style.background = v < 25 ? '#C2412F' : '#6B8E3A'; row.title = `Hunger ${Math.round(v)}/100`; }
  const refresh = ui.refresh; ui.refresh = function () { const r = refresh.apply(this, arguments); hud(); return r; };

  // input: click/tap (pointerup covers mouse + touch), R key, touch Eat button
  document.addEventListener('click', e => { const g = ui.game; if (!g) return;
    const s = e.target.closest('[data-iitem],[data-ieat],[data-icook]'); if (!s) return; const d = s.dataset;
    if (d.iitem) picked = picked === d.iitem ? null : d.iitem;
    else if (d.ieat) g.exec({ t: 'eat', item: d.ieat });
    else if (d.icook) g.exec({ t: 'cook', item: d.icook });
    renderSlots(); });
  document.addEventListener('dblclick', e => { const s = e.target.closest('[data-iitem]'); if (s && FL.FOOD[s.dataset.iitem]) { ui.game.exec({ t: 'eat', item: s.dataset.iitem }); renderSlots(); } });
  document.addEventListener('keydown', e => { if (!ui.playing || e.repeat || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.code === 'KeyR') { ui.game.exec({ t: 'eat' }); } else if (e.code === 'KeyC') { ui.game.exec({ t: 'cook' }); } else return; if (!$('inv').classList.contains('hidden')) renderSlots(); });
  const tb = $('tbtns'); if (tb && !$('tEat')) { const b = document.createElement('button'); b.id = 'tEat'; b.className = 'tb'; b.textContent = 'Eat'; b.onclick = () => ui.game && ui.game.exec({ t: 'eat' }); tb.prepend(b); }

  if (tb && !$('tFill')) { const T = 32, tc = v => Math.floor(v / T);
    const f = document.createElement('button'); f.id = 'tFill'; f.className = 'tb'; f.textContent = 'Fill pot'; f.onclick = () => ui.game && ui.game.exec({ t: 'water' });
    const d = document.createElement('button'); d.id = 'tDig'; d.className = 'tb'; d.textContent = 'Dig'; d.onclick = () => { const g = ui.game; if (!g || !g.local) return; const p = g.local, fc = p.face || [0, 1]; g.exec({ t: 'dig', x: tc(p.x + fc[0] * T), y: tc(p.y + fc[1] * T) }); };
    $('tEat') ? $('tEat').after(f, d) : tb.prepend(f, d); }
  const hint = $('hint'); if (hint && !/R eat/.test(hint.textContent)) hint.textContent += ' · R eat · C cook (at fire)';
})(window.FL);
