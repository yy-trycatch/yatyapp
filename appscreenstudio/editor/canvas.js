// 画布：每个集一行横向截图条，卡片内直接拖拽元素
const $ = (id) => document.getElementById(id);
const ED = { p: null, sel: { setId: null, scrId: null, elId: null }, zoom: 1, tab: 'templates', boxes: {} };
const CARDS = {}; // scrId -> {el, cv, dpr}
const BASE_H = 440;

function findScreen(scrId) {
  for (const set of ED.p.sets) {
    const idx = set.screens.findIndex((s) => s.id === scrId);
    if (idx >= 0) return { set, scr: set.screens[idx], idx };
  }
  return null;
}
function findEl(elId) {
  for (const set of ED.p.sets) for (let idx = 0; idx < set.screens.length; idx++) {
    const scr = set.screens[idx], el = scr.els.find((e) => e.id === elId);
    if (el) return { set, scr, idx, el };
  }
  return null;
}
const selEl = () => (ED.sel.elId ? findEl(ED.sel.elId) : null);
// 当前上下文画面：选中的画面，否则第一个
function ctxScreen() {
  return (ED.sel.scrId && findScreen(ED.sel.scrId)) || { set: ED.p.sets[0], scr: ED.p.sets[0] && ED.p.sets[0].screens[0], idx: 0 };
}
function ctxSet() {
  return (ED.sel.setId && ED.p.sets.find((s) => s.id === ED.sel.setId)) || ED.p.sets[0];
}

function cardDims(set) {
  const s = sizeById(set.sizeId), land = s.w > s.h, h = BASE_H * ED.zoom * (land ? 0.5 : 1);
  return { w: Math.round((h * s.w) / s.h), h: Math.round(h) };
}

function renderAll() {
  renderCanvas();
  renderDrawer();
  renderProps();
  $('projName').value = ED.p.name;
  $('btnLink').classList.toggle('on', ED.p.linkTexts);
  $('zoomVal').textContent = Math.round(ED.zoom * 100) + '%';
}

function setNum(set) {
  return ED.p.sets.filter((s) => s.platform === set.platform).indexOf(set) + 1;
}
function setLabel(set) {
  return `${set.platform === 'ios' ? 'iOS' : 'Android'} · ${T('集 {0}', setNum(set))}`;
}

function renderCanvas() {
  const root = $('canvas');
  const scroll = [root.scrollLeft, root.scrollTop];
  root.innerHTML = '';
  Object.keys(CARDS).forEach((k) => delete CARDS[k]);
  ED.p.sets.forEach((set) => {
    const row = document.createElement('section');
    row.className = 'set-row' + (set.id === ED.sel.setId ? ' on' : '');
    row.dataset.set = set.id;
    const sz = sizeById(set.sizeId);
    row.innerHTML = `<div class="set-head">
      <span class="pf ${set.platform}">${PLATFORM_NAME[set.platform]}</span><b>${setLabel(set)}</b>
      <select data-act="size">${STORE_SIZES[set.platform].map((z) => `<option value="${z.id}"${z.id === set.sizeId ? ' selected' : ''}>${z.name} · ${z.w}×${z.h}</option>`).join('')}</select>
      <select data-act="device">${DEVICES.filter((d) => d.platform === set.platform).map((d) => `<option value="${d.id}"${d.id === set.deviceId ? ' selected' : ''}>${d.name}</option>`).join('')}</select>
      <span class="meta">${T('{0} 张', set.screens.length)} · ${sz.w}×${sz.h}</span><span class="grow"></span>
      <button data-act="relayout" title="${T('按当前模板重新排版此集，保留截图')}">${T('按模板重排')}</button>
      <button data-act="dupset">${T('复制集')}</button><button data-act="delset">${T('删除集')}</button></div>
      <div class="strip"></div>`;
    const strip = row.querySelector('.strip');
    set.screens.forEach((scr, i) => strip.appendChild(makeCard(set, scr, i)));
    const add = document.createElement('button');
    add.className = 'add-card'; add.dataset.act = 'addscr'; add.textContent = T('+ 添加画面');
    add.style.height = cardDims(set).h + 'px';
    strip.appendChild(add);
    root.appendChild(row);
  });
  const foot = document.createElement('div');
  foot.className = 'set-add';
  foot.innerHTML = `<button data-act="addset" data-pf="ios">${T('+ 添加 App Store 集')}</button><button data-act="addset" data-pf="android">${T('+ 添加 Google Play 集')}</button>`;
  root.appendChild(foot);
  root.scrollLeft = scroll[0]; root.scrollTop = scroll[1];
  updateSel();
}

function makeCard(set, scr, i) {
  const d = cardDims(set), dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement('div');
  c.className = 'card'; c.dataset.scr = scr.id;
  c.style.width = d.w + 'px'; c.style.height = d.h + 'px';
  c.innerHTML = `<canvas></canvas><div class="sel"><i class="hd"></i></div><div class="vguide"></div>
    <div class="tools"><button data-a="left" title="${T('左移')}">‹</button><button data-a="right" title="${T('右移')}">›</button><button data-a="dup">${T('复制')}</button><button data-a="del">${T('删除')}</button></div>
    <span class="num">${i + 1}</span>`;
  const cv = c.querySelector('canvas');
  cv.width = Math.round(d.w * dpr); cv.height = Math.round(d.h * dpr);
  cv.style.width = d.w + 'px'; cv.style.height = d.h + 'px';
  CARDS[scr.id] = { el: c, cv, dpr };
  drawCard(scr.id);
  bindCard(c, cv, scr.id);
  return c;
}

function drawCard(scrId) {
  const C = CARDS[scrId], f = findScreen(scrId);
  if (!C || !f) return;
  ED.boxes[scrId] = renderScreen(C.cv.getContext('2d'), C.cv.width, C.cv.height, f.scr, f.set, f.idx);
}
function redrawAll() { Object.keys(CARDS).forEach(drawCard); updateSel(); }

function updateSel() {
  Object.entries(CARDS).forEach(([id, C]) => {
    C.el.classList.toggle('on', id === ED.sel.scrId);
    const s = C.el.querySelector('.sel'), b = ED.sel.scrId === id && ED.sel.elId && (ED.boxes[id] || {})[ED.sel.elId];
    s.style.display = b ? 'block' : 'none';
    if (b) Object.assign(s.style, { left: b.x / C.dpr + 'px', top: b.y / C.dpr + 'px', width: b.w / C.dpr + 'px', height: b.h / C.dpr + 'px', transform: `rotate(${b.rot}deg)` });
  });
  document.querySelectorAll('.set-row').forEach((r) => r.classList.toggle('on', r.dataset.set === ED.sel.setId));
}

function select(setId, scrId, elId) {
  const tabDep = ED.sel.scrId !== scrId;
  ED.sel = { setId, scrId, elId };
  updateSel();
  renderProps();
  if (tabDep && (ED.tab === 'background' || ED.tab === 'device')) renderDrawer();
}
