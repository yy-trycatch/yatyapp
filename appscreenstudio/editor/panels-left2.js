// 左侧抽屉（续）：文字预设、元素、背景、设备
const TEXT_PRESETS = [
  { name: T('标题'), content: T('大标题'), fontSize: 130, weight: 800 },
  { name: T('副标题'), content: T('一句清楚的副标题'), fontSize: 96, weight: 600, lh: 1.25 },
  { name: T('正文'), content: T('正文文字'), fontSize: 70, weight: 400, lh: 1.45 },
  { name: T('说明'), content: T('小字说明或注释'), fontSize: 52, weight: 400, align: 'left', color: '#64748b', lh: 1.35 },
  { name: T('醒目'), content: T('在商店里脱颖而出'), fontSize: 150, weight: 800, lh: 1.1, shadow: true },
  { name: T('标注'), content: T('1 亿+\n下载'), fontSize: 64, weight: 800, color: '#111111', bg: '#ffffff', border: '#111111', radius: 30, shadow: true },
  { name: T('标语'), content: T('适合每一个人的 App'), fontSize: 80, weight: 500, lh: 1.35 },
  { name: T('手写批注'), content: T('超好用！'), font: 'hand', fontSize: 64, weight: 700, rot: -6, color: '#ef5a22' },
  { name: T('评分'), content: '★★★★★', fontSize: 72, weight: 400, color: '#ffc531', spacing: 6 },
  { name: T('胶囊标签'), content: T('编辑推荐'), fontSize: 44, weight: 700, color: '#ffffff', bg: '#111111', radius: 999 },
];
const BLOCK_PRESETS = [
  { name: T('光晕'), color: '#a855f7', w: 0.6, h: 0.35, radius: 400, blur: 90, opacity: 0.7 },
  { name: T('高亮'), color: '#fde047', w: 0.62, h: 0.06, radius: 14 },
  { name: T('卡片'), color: '#ffffff', w: 0.5, h: 0.33, radius: 60 },
  { name: T('胶囊'), color: 'rgba(148,163,184,.35)', w: 0.62, h: 0.11, radius: 999 },
  { name: T('描边框'), color: '#6366f1', w: 0.55, h: 0.36, radius: 50, outline: true },
  { name: T('强调条'), color: '#a78bfa', w: 0.8, h: 0.09, radius: 40 },
  { name: T('深色块'), color: '#0f172a', w: 0.5, h: 0.4, radius: 80 },
];

function addElement(el) {
  const c = ctxScreen();
  if (!c.scr) return;
  c.scr.els.push(el);
  commit();
  drawCard(c.scr.id);
  select(c.set.id, c.scr.id, el.id);
}

function drawerText(d) {
  d.innerHTML = `<h3>${T('文字')}</h3><p class="hint">${T('添加到当前选中的画面。双击画布上的文字可直接编辑内容。')}</p><div class="preset-list"></div>`;
  const L = d.querySelector('.preset-list');
  TEXT_PRESETS.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'preset';
    const st = `font-family:${FONTS[p.font || 'sans']};font-weight:${p.weight};font-size:${Math.min(26, Math.max(12, p.fontSize / 5))}px;` +
      (p.bg ? `background:${p.bg};color:${p.color};border:2px solid ${p.border || p.bg};border-radius:999px;padding:2px 10px;` : p.color ? `color:${p.color};` : '');
    b.innerHTML = `<small>${p.name}</small><span style="${st}">${esc(p.content.replace('\n', ' '))}</span>`;
    b.onclick = () => {
      const c = ctxScreen(), tColor = c.scr ? (c.scr.els.find((e) => e.type === 'text') || {}).color : null;
      const o = Object.assign({}, p);
      delete o.name;
      addElement(textEl(Object.assign({ y: 0.45, w: 0.8, color: tColor || '#ffffff' }, o)));
    };
    L.appendChild(b);
  });
}

function drawerElements(d) {
  d.innerHTML = `<h3>${T('元素')}</h3><button class="btn wide" id="addPhone">${T('+ 添加一台手机')}</button>
    <p class="hint">${T('形状块会添加到当前画面，可在右侧调整颜色、模糊和圆角。')}</p><div class="block-grid"></div>`;
  $('addPhone').onclick = () => {
    const c = ctxScreen(), ref = c.scr && c.scr.els.find((e) => e.type === 'phone');
    addElement(phoneEl({ x: 0.68, y: 0.42, scale: 0.55, rot: 8, pal: ref ? ref.pal : null, variant: 2 }));
  };
  const g = d.querySelector('.block-grid');
  BLOCK_PRESETS.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'block-pre';
    const st = p.outline ? `border:3px solid ${p.color};` : `background:${p.color};${p.blur ? 'filter:blur(6px);' : ''}`;
    b.innerHTML = `<i style="${st}border-radius:${Math.min(p.radius / 6, 30)}px"></i><span>${p.name}</span>`;
    b.onclick = () => { const o = Object.assign({}, p); delete o.name; addElement(blockEl(o)); };
    g.appendChild(b);
  });
}

const PATTERNS = [['none', '无'], ['blobs', '圆斑'], ['rings', '圆环'], ['dots', '圆点'], ['grid', '点阵'], ['stripes', '斜纹'],
  ['glow', '光晕'], ['stars', '星空'], ['speed', '速度线'], ['hills', '山丘'], ['leaves', '叶片'], ['robot', '圆形']].map(([a, b]) => [a, T(b)]);

function bgControls(box, scr, set) {
  const bg = scr.bg;
  box.insertAdjacentHTML('beforeend', `<div class="bgc">
    <div class="seg" data-seg="type"><button data-v="gradient" class="${bg.type === 'gradient' ? 'on' : ''}">${T('渐变')}</button><button data-v="solid" class="${bg.type === 'solid' ? 'on' : ''}">${T('纯色')}</button></div>
    <div class="row">${color(bg.type === 'solid' ? T('颜色') : T('起始色'), 'c1', bg.c1)}${bg.type === 'gradient' ? color(T('结束色'), 'c2', bg.c2) : ''}</div>
    ${bg.type === 'gradient' ? range(T('角度'), 'angle', bg.angle, 0, 360, 1) : ''}
    ${pick(T('图案'), 'pattern', bg.pattern, PATTERNS)}
    <div class="row">${color(T('图案颜色'), 'pcHex', bg.patternColor)}${range(T('不透明度'), 'pcA', alphaOf(bg.patternColor), 0, 1, 0.01)}</div>
    <div class="swatches">${TEMPLATES.map((t) => `<button data-sw="${t.id}" title="${esc(t.name)}" style="background:linear-gradient(${t.angle}deg,${t.stops[0]},${t.stops[1]})"></button>`).join('')}</div>
    <div class="row"><button class="btn" data-apply="set">${T('应用到本集全部')}</button><button class="btn" data-apply="all">${T('应用到所有集')}</button></div></div>`);
  const el = box.lastElementChild;
  const proxy = { c1: bg.c1, c2: bg.c2, angle: bg.angle, pattern: bg.pattern, pcHex: toHex(bg.patternColor), pcA: alphaOf(bg.patternColor) };
  bindFields(el, proxy, (k) => {
    if (k === 'pcHex' || k === 'pcA') bg.patternColor = withAlpha(proxy.pcHex, proxy.pcA);
    else bg[k] = proxy[k];
    drawCard(scr.id);
  });
  const rerender = () => { box.innerHTML = ''; (box.dataset.ctx === 'drawer' ? drawerBackground : renderProps)(box); };
  el.querySelector('[data-seg]').onclick = (e) => {
    if (!e.target.dataset.v) return;
    bg.type = e.target.dataset.v; commit(); drawCard(scr.id); rerender();
  };
  el.querySelector('.swatches').onclick = (e) => {
    const t = e.target.dataset.sw && tplById(e.target.dataset.sw);
    if (!t) return;
    Object.assign(bg, { type: 'gradient', c1: t.stops[0], c2: t.stops[1], angle: t.angle });
    commit(); drawCard(scr.id); rerender();
  };
  el.querySelectorAll('[data-apply]').forEach((b) => (b.onclick = () => {
    const sets = b.dataset.apply === 'set' ? [set] : ED.p.sets;
    sets.forEach((s) => s.screens.forEach((sc) => (sc.bg = Object.assign({}, bg))));
    commit(); redrawAll();
  }));
}

function drawerBackground(d) {
  d.dataset.ctx = 'drawer';
  const c = ctxScreen();
  d.innerHTML = `<h3>${T('背景')}</h3><p class="hint">${T('正在编辑：{0} · 画面 {1}。点击画布切换画面。', c.set ? setLabel(c.set) : '', c.idx + 1)}</p>`;
  if (c.scr) bgControls(d, c.scr, c.set);
}

function drawerDevice(d) {
  const set = ctxSet();
  d.innerHTML = `<h3>${T('设备边框')}</h3><p class="hint">${T('作用于整个「{0}」。', setLabel(set))}</p><div class="dev-list">${DEVICES.filter((x) => x.platform === set.platform).map((x) =>
    `<button data-dev="${x.id}" class="${x.id === set.deviceId ? 'on' : ''}"><b>${x.name}</b><span>${x.w}×${x.h}${x.bezel ? '' : ' · ' + T('无边框')}</span></button>`).join('')}</div>
    <div class="row">${color(T('边框颜色'), 'frame', set.frame)}</div>
    <div class="swatches">${['#111111', '#2b2b31', '#e8e6e1', '#c9b28f', '#3a4a6b', '#ffffff', '#ff2daa', '#1f7a2e'].map((c) => `<button data-fc="${c}" style="background:${c}"></button>`).join('')}</div>`;
  bindFields(d, set, () => redrawAll());
  d.onclick = (e) => {
    const b = e.target.closest('[data-dev]'), fc = e.target.dataset.fc;
    if (b) { set.deviceId = b.dataset.dev; fitSetPhones(set); commit(); renderCanvas(); renderDrawer(); }
    if (fc) { set.frame = fc; commit(); redrawAll(); renderDrawer(); }
  };
}
