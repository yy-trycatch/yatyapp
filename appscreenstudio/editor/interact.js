// 画布交互：选择、拖动、缩放手柄、卡片工具、集操作、拖放截图
function bindCard(card, cv, scrId) {
  cv.addEventListener('pointerdown', (e) => {
    const f = findScreen(scrId), C = CARDS[scrId];
    const r = cv.getBoundingClientRect();
    const hit = hitTest(ED.boxes[scrId] || {}, f.scr.els, (e.clientX - r.left) * C.dpr, (e.clientY - r.top) * C.dpr);
    select(f.set.id, scrId, hit);
    if (!hit) return;
    const el = f.scr.els.find((x) => x.id === hit);
    const sx = e.clientX, sy = e.clientY, ox = el.x, oy = el.y;
    let moved = false;
    cv.setPointerCapture(e.pointerId);
    const mv = (ev) => {
      const dx = (ev.clientX - sx) / r.width, dy = (ev.clientY - sy) / r.height;
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 2) moved = true;
      if (!moved) return;
      let nx = ox + dx;
      const snap = Math.abs(nx - 0.5) < 0.012;
      if (snap) nx = 0.5;
      el.x = nx; el.y = oy + dy;
      card.classList.toggle('guide', snap);
      drawCard(scrId); updateSel();
    };
    const up = () => {
      cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up);
      card.classList.remove('guide');
      if (moved) { commit(); renderProps(); }
    };
    cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up);
  });
  cv.addEventListener('dblclick', () => { const t = $('pContent'); if (t) { t.focus(); t.select(); } });

  card.querySelector('.hd').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const f = findEl(ED.sel.elId);
    if (!f) return;
    const el = f.el, o = JSON.parse(JSON.stringify(el)), sx = e.clientX, sy = e.clientY;
    const b = ED.boxes[scrId][el.id], C = CARDS[scrId], span = (b.w + b.h) / C.dpr;
    e.target.setPointerCapture(e.pointerId);
    const mv = (ev) => {
      const k = Math.max(0.1, 1 + ((ev.clientX - sx) + (ev.clientY - sy)) / span);
      if (el.type === 'text') { el.fontSize = Math.round(o.fontSize * k * 10) / 10; el.w = Math.min(1.2, o.w * k); }
      else if (el.type === 'phone') el.scale = o.scale * k;
      else { el.w = o.w * k; el.h = o.h * k; }
      if (el.type === 'text') syncLinked(ED.p, f.set.id, f.idx, el, ['fontSize']);
      redrawAll();
    };
    const up = () => { e.target.removeEventListener('pointermove', mv); e.target.removeEventListener('pointerup', up); commit(); renderProps(); };
    e.target.addEventListener('pointermove', mv); e.target.addEventListener('pointerup', up);
  });

  card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('drop'); });
  card.addEventListener('dragleave', () => card.classList.remove('drop'));
  card.addEventListener('drop', async (e) => {
    e.preventDefault(); card.classList.remove('drop');
    const libId = e.dataTransfer.getData('text/x-img');
    const ids = libId ? [libId] : await addFiles(e.dataTransfer.files);
    const f = findScreen(scrId), ph = f && f.scr.els.find((x) => x.type === 'phone');
    if (ph && ids[0]) { ph.imgId = ids[0]; commit(); drawCard(scrId); renderProps(); }
  });
}

async function addFiles(files) {
  const ids = [];
  for (const f of Array.from(files || [])) {
    if (!f.type.startsWith('image/')) continue;
    const id = await addImageFile(f);
    if (id) { ids.push(id); ED.p.library.push(id); }
  }
  if (ids.length) { commit(); if (ED.tab === 'shots') renderDrawer(); }
  return ids;
}

function bindCanvasRoot() {
  const root = $('canvas');
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) {
      if (e.target === root || e.target.classList.contains('strip') || e.target.classList.contains('set-row')) select(null, null, null);
      return;
    }
    const row = btn.closest('.set-row'), set = row && ED.p.sets.find((s) => s.id === row.dataset.set);
    const a = btn.dataset.a, act = btn.dataset.act;
    if (a) {
      const scrId = btn.closest('.card').dataset.scr, f = findScreen(scrId), L = f.set.screens, i = f.idx;
      if (a === 'left' && i > 0) [L[i - 1], L[i]] = [L[i], L[i - 1]];
      else if (a === 'right' && i < L.length - 1) [L[i + 1], L[i]] = [L[i], L[i + 1]];
      else if (a === 'dup') L.splice(i + 1, 0, cloneScreen(L[i]));
      else if (a === 'del') { if (L.length < 2) return; L.splice(i, 1); if (ED.sel.scrId === scrId) ED.sel = { setId: f.set.id, scrId: null, elId: null }; }
      commit(); renderCanvas(); renderProps();
      return;
    }
    if (act === 'addscr') {
      const last = set.screens[set.screens.length - 1], c = cloneScreen(last);
      c.els.forEach((x) => { if (x.type === 'phone') x.imgId = null; });
      set.screens.push(c);
      commit(); renderCanvas(); select(set.id, c.id, null);
    } else if (act === 'addset') {
      const s = newSet(ED.p, btn.dataset.pf);
      ED.p.sets.push(s); commit(); renderCanvas(); select(s.id, null, null);
    } else if (act === 'dupset') {
      const c = JSON.parse(JSON.stringify(set));
      c.id = uid(); c.screens = set.screens.map(cloneScreen);
      ED.p.sets.splice(ED.p.sets.indexOf(set) + 1, 0, c); commit(); renderCanvas();
    } else if (act === 'delset') {
      if (ED.p.sets.length < 2 || !confirm(T('删除「{0}」及其所有画面？', setLabel(set)))) return;
      ED.p.sets.splice(ED.p.sets.indexOf(set), 1);
      ED.sel = { setId: null, scrId: null, elId: null };
      commit(); renderAll();
    } else if (act === 'relayout') {
      if (!confirm(T('按当前模板重新排版此集？此集的文字修改会被替换，截图保留。'))) return;
      ED.p.sets[ED.p.sets.indexOf(set)] = makeSet(set.platform, ED.p.tpl, set.sizeId, set.deviceId, set);
      ED.sel = { setId: set.id, scrId: null, elId: null };
      commit(); renderAll();
    }
  });
  root.addEventListener('change', (e) => {
    const row = e.target.closest('.set-row'), set = row && ED.p.sets.find((s) => s.id === row.dataset.set);
    if (!set) return;
    if (e.target.dataset.act === 'size') set.sizeId = e.target.value;
    if (e.target.dataset.act === 'device') set.deviceId = e.target.value;
    fitSetPhones(set);
    commit(); renderCanvas(); if (ED.tab === 'device') renderDrawer();
  });
  root.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(ED.zoom * (e.deltaY < 0 ? 1.1 : 0.9));
  }, { passive: false });
}

function setZoom(z) {
  ED.zoom = Math.max(0.4, Math.min(2.2, z));
  $('zoomVal').textContent = Math.round(ED.zoom * 100) + '%';
  renderCanvas();
}
