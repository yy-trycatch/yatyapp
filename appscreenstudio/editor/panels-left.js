// 左侧：图标栏 + 抽屉（模板 / 截图 / 文字 / 元素 / 背景 / 设备）
const _cctx = document.createElement('canvas').getContext('2d');
function toHex(c) {
  _cctx.fillStyle = '#000'; _cctx.fillStyle = c || '#000';
  const v = _cctx.fillStyle;
  if (v[0] === '#') return v;
  const m = v.match(/[\d.]+/g);
  return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('');
}
function alphaOf(c) {
  _cctx.fillStyle = c || '#000';
  const m = _cctx.fillStyle.match(/rgba\([^)]*,\s*([\d.]+)\)/);
  return m ? +m[1] : 1;
}
function withAlpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// data-k 绑定：input 事件实时预览，change 事件写入历史
function bindFields(box, obj, onInput) {
  box.querySelectorAll('[data-k]').forEach((inp) => {
    const k = inp.dataset.k;
    const read = () => (inp.type === 'checkbox' ? inp.checked : inp.type === 'range' || inp.type === 'number' ? +inp.value : inp.value);
    inp.addEventListener('input', () => {
      obj[k] = read();
      const out = box.querySelector(`[data-out="${k}"]`);
      if (out) out.textContent = fmt(obj[k]);
      onInput(k);
    });
    inp.addEventListener('change', () => commit());
  });
}
const fmt = (v) => (typeof v === 'number' ? (Math.abs(v) < 3 ? v.toFixed(2) : Math.round(v)) : v);
const range = (label, k, v, min, max, step) =>
  `<label class="fld">${label}<span class="val" data-out="${k}">${fmt(v)}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`;
const color = (label, k, v) => `<label class="fld col">${label}<input type="color" data-k="${k}" value="${toHex(v)}"></label>`;
const check = (label, k, v) => `<label class="chk"><input type="checkbox" data-k="${k}"${v ? ' checked' : ''}> ${label}</label>`;
const pick = (label, k, v, opts) =>
  `<label class="fld">${label}<select data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${String(a) === String(v) ? ' selected' : ''}>${b}</option>`).join('')}</select></label>`;

const TABS = [
  ['templates', '模板', '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'],
  ['shots', '截图', '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'],
  ['text', '文字', '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'],
  ['elements', '元素', '<circle cx="7.5" cy="7.5" r="4"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M17 3l4 7h-8z"/>'],
  ['background', '背景', '<path d="M12 3a9 9 0 100 18c1.7 0 2-1.3 1.2-2.2-.8-1-.3-2.3 1-2.3H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="11" r="1"/>'],
  ['device', '设备', '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>'],
];

function renderRail() {
  $('rail').innerHTML = TABS.map(([id, label, svg]) =>
    `<button data-tab="${id}" class="${id === ED.tab ? 'on' : ''}"><svg viewBox="0 0 24 24">${svg}</svg><span>${T(label)}</span></button>`).join('');
  $('rail').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    ED.tab = b.dataset.tab;
    renderRail(); renderDrawer();
  };
}

function renderDrawer() {
  const d = $('drawer');
  d.innerHTML = '';
  d.onclick = null;
  delete d.dataset.ctx;
  d.scrollTop = 0;
  ({ templates: drawerTemplates, shots: drawerShots, text: drawerText, elements: drawerElements,
    background: drawerBackground, device: drawerDevice })[ED.tab](d);
}

const TPL_THUMBS = {};
function tplThumb(t) {
  if (TPL_THUMBS[t.id]) return TPL_THUMBS[t.id];
  const size = sizeById('ios-69'), dev = deviceOf('iphone-17-pro-max');
  const cv = document.createElement('canvas');
  cv.width = 200; cv.height = Math.round((200 * size.h) / size.w);
  const s = tplSlides(t)[0];
  renderScreen(cv.getContext('2d'), cv.width, cv.height, buildScreen(t, s, 0, size, dev), { deviceId: dev.id, frame: t.frame }, 0);
  return (TPL_THUMBS[t.id] = cv);
}

function drawerTemplates(d) {
  d.innerHTML = `<h3>${T('模板')}</h3><p class="hint">${T('应用后替换所有集的文字和样式，已放入的截图会保留。')}</p><div class="tpl-grid"></div>`;
  const g = d.querySelector('.tpl-grid');
  TEMPLATES.forEach((t) => {
    const b = document.createElement('button');
    b.className = 'tpl' + (t.id === ED.p.tpl ? ' on' : '');
    b.appendChild(tplThumb(t));
    b.insertAdjacentHTML('beforeend', `<span>${esc(t.name)}</span>`);
    b.onclick = () => {
      if (t.id !== ED.p.tpl && !confirm(T('应用模板「{0}」？当前文字和样式会被替换。', t.name))) return;
      applyTemplateToProject(ED.p, t.id);
      ED.sel = { setId: null, scrId: null, elId: null };
      commit(); renderAll();
    };
    g.appendChild(b);
  });
}

function drawerShots(d) {
  d.innerHTML = `<h3>${T('截图库')}</h3>
    <label class="drop-zone" id="shotDrop"><input type="file" accept="image/*" multiple hidden id="shotFile">
      <b>${T('上传 App 截图')}</b><span>${T('点击或拖入图片，可多选')}</span></label>
    <div class="row"><button class="btn" data-fill="ios">${T('按顺序填入 App Store 集')}</button><button class="btn" data-fill="android">${T('按顺序填入 Google Play 集')}</button></div>
    <p class="hint">${T('点击截图放入选中的手机；也可以把截图拖到画布卡片上。')}</p>
    <div class="shot-grid">${ED.p.library.filter((id) => IMGS[id]).map((id) => `<div class="shot" draggable="true" data-id="${id}"><img src="${IMGS[id].src}"><button data-del="${id}">×</button></div>`).join('') || `<p class="hint">${T('还没有截图。')}</p>`}</div>`;
  $('shotFile').onchange = (e) => addFiles(e.target.files);
  const z = $('shotDrop');
  z.ondragover = (e) => { e.preventDefault(); z.classList.add('drop'); };
  z.ondragleave = () => z.classList.remove('drop');
  z.ondrop = (e) => { e.preventDefault(); z.classList.remove('drop'); addFiles(e.dataTransfer.files); };
  d.querySelectorAll('.shot').forEach((s) => s.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/x-img', s.dataset.id)));
  d.onclick = (e) => {
    const del = e.target.dataset.del, fill = e.target.dataset.fill, shot = e.target.closest('.shot');
    if (del) {
      ED.p.library = ED.p.library.filter((x) => x !== del);
      ED.p.sets.forEach((s) => s.screens.forEach((sc) => sc.els.forEach((el) => { if (el.imgId === del) el.imgId = null; })));
      imgDel(del); commit(); renderDrawer(); redrawAll(); renderProps();
    } else if (fill) {
      const lib = ED.p.library.filter((id) => IMGS[id]);
      ED.p.sets.filter((s) => s.platform === fill).forEach((s) => s.screens.forEach((sc, i) => {
        const ph = sc.els.find((x) => x.type === 'phone');
        if (ph && lib[i]) ph.imgId = lib[i];
      }));
      commit(); redrawAll(); renderProps();
    } else if (shot) assignShot(shot.dataset.id);
  };
}

function assignShot(id) {
  const f = selEl();
  let ph = f && f.el.type === 'phone' ? f.el : null;
  if (!ph) { const c = ctxScreen(); ph = c.scr && c.scr.els.find((x) => x.type === 'phone'); }
  if (!ph) ED.p.sets.some((s) => s.screens.some((sc) => (ph = sc.els.find((x) => x.type === 'phone' && !x.imgId))));
  if (!ph) return;
  ph.imgId = id;
  commit(); redrawAll(); renderProps();
}
