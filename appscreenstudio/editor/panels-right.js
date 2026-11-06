// 右侧属性面板：随选中对象切换（无选择 / 画面 / 文字 / 手机 / 形状）
const FONT_OPTS = [['sans', '黑体'], ['serif', '衬线/宋体'], ['round', '圆体'], ['cond', '窄体 Impact'], ['hand', '手写']].map(([a, b]) => [a, T(b)]);
const WEIGHT_OPTS = [[400, '常规'], [500, '中等'], [600, '半粗'], [700, '粗体'], [800, '特粗'], [900, '黑']].map(([a, b]) => [a, `${T(b)} ${a}`]);

function renderProps() {
  const P = $('props');
  P.innerHTML = '';
  const f = selEl();
  if (f) return (f.el.type === 'text' ? propsText : f.el.type === 'phone' ? propsPhone : propsBlock)(P, f);
  const c = ED.sel.scrId && findScreen(ED.sel.scrId);
  if (c) return propsScreen(P, c);
  P.innerHTML = `<h3>${T('属性')}</h3><p class="hint">${T('点击画布上的画面或元素进行编辑。')}</p>
    <div class="tips"><b>${T('快捷键')}</b>
    <p>${T('<kbd>⌘Z</kbd> 撤销　<kbd>⇧⌘Z</kbd> 重做')}</p><p>${T('<kbd>Delete</kbd> 删除元素　<kbd>⌘D</kbd> 复制')}</p>
    <p>${T('<kbd>方向键</kbd> 微移（<kbd>Shift</kbd> 加大）')}</p><p>${T('<kbd>⌘ + 滚轮</kbd> 缩放画布　<kbd>Esc</kbd> 取消选择')}</p></div>
    <div class="tips"><b>${T('跨平台同步')}</b><p>${T('顶部「链接文字」开启后，App Store 集和 Google Play 集中相同位置的文字会同步内容和样式，位置各自独立。')}</p></div>`;
}

function elActions(P, f) {
  P.insertAdjacentHTML('beforeend', `<div class="row acts"><button class="btn" data-x="up">${T('上移一层')}</button><button class="btn" data-x="down">${T('下移一层')}</button></div>
    <div class="row acts"><button class="btn" data-x="dup">${T('复制')}</button><button class="btn danger" data-x="del">${T('删除')}</button></div>`);
  P.querySelectorAll('[data-x]').forEach((b) => (b.onclick = () => elAction(b.dataset.x)));
}
function elAction(x) {
  const f = selEl();
  if (!f) return;
  const L = f.scr.els, i = L.indexOf(f.el);
  if (x === 'up' && i < L.length - 1) [L[i], L[i + 1]] = [L[i + 1], L[i]];
  else if (x === 'down' && i > 0) [L[i], L[i - 1]] = [L[i - 1], L[i]];
  else if (x === 'dup') {
    const c = Object.assign(JSON.parse(JSON.stringify(f.el)), { id: uid(), linkKey: null });
    c.x += 0.03; c.y += 0.02; L.splice(i + 1, 0, c); ED.sel.elId = c.id;
  } else if (x === 'del') { L.splice(i, 1); ED.sel.elId = null; }
  commit(); drawCard(f.scr.id); updateSel(); renderProps();
}

function propsText(P, f) {
  const el = f.el, peers = linkedPeers(ED.p, f.set.id, f.idx, el);
  P.innerHTML = `<h3>${T('文字')} <small>${setLabel(f.set)} · ${T('画面 {0}', f.idx + 1)}</small></h3>
    ${peers.length ? `<p class="link-note">${T('已链接 {0} 处：{1}', peers.length, peers.map((o) => setLabel(findEl(o.id).set)).join(T('、')))}</p>` : ''}
    <textarea id="pContent" data-k="content" rows="3">${esc(el.content)}</textarea>
    <div class="row">${pick(T('字体'), 'font', el.font, FONT_OPTS)}${pick(T('字重'), 'weight', el.weight, WEIGHT_OPTS)}</div>
    ${range(T('字号'), 'fontSize', el.fontSize, 12, 240, 1)}
    <div class="seg" data-seg="align">${[['left', '左对齐'], ['center', '居中'], ['right', '右对齐']].map(([v, l]) => `<button data-v="${v}" class="${el.align === v ? 'on' : ''}">${T(l)}</button>`).join('')}</div>
    <div class="row">${color(T('颜色'), 'color', el.color)}${color(T('末段颜色'), 'color2', el.color2 || el.color)}</div>
    <div class="row">${check(T('全部大写'), 'upper', el.upper)}${check(T('阴影'), 'shadow', el.shadow)}</div>
    ${range(T('行高'), 'lh', el.lh, 0.8, 2, 0.01)}${range(T('字间距'), 'spacing', el.spacing, 0, 30, 1)}
    ${range(T('文本框宽度'), 'w', el.w, 0.1, 1.2, 0.01)}${range(T('旋转'), 'rot', el.rot, -45, 45, 1)}
    <h4>${T('底框')}</h4>
    <div class="row">${color(T('底色'), 'bg', el.bg || '#ffffff')}${color(T('描边'), 'border', el.border || '#000000')}</div>
    <div class="row"><button class="btn" data-clr="bg">${el.bg ? T('去掉底色') : T('无底色')}</button><button class="btn" data-clr="border">${el.border ? T('去掉描边') : T('无描边')}</button><button class="btn" data-clr="color2">${T('去掉末段色')}</button></div>
    ${range(T('圆角'), 'radius', Math.min(el.radius, 200), 0, 200, 1)}`;
  bindFields(P, el, (k) => {
    if (LINK_KEYS.includes(k)) syncLinked(ED.p, f.set.id, f.idx, el, [k]);
    if (peers.length) redrawAll(); else { drawCard(f.scr.id); updateSel(); }
  });
  P.querySelector('[data-seg]').onclick = (e) => {
    if (!e.target.dataset.v) return;
    el.align = e.target.dataset.v; syncLinked(ED.p, f.set.id, f.idx, el, ['align']);
    commit(); redrawAll(); renderProps();
  };
  P.querySelectorAll('[data-clr]').forEach((b) => (b.onclick = () => {
    el[b.dataset.clr] = ''; syncLinked(ED.p, f.set.id, f.idx, el, [b.dataset.clr]);
    commit(); redrawAll(); renderProps();
  }));
  elActions(P, f);
}

function propsPhone(P, f) {
  const el = f.el, img = el.imgId && IMGS[el.imgId];
  P.innerHTML = `<h3>${T('手机')} <small>${setLabel(f.set)} · ${T('画面 {0}', f.idx + 1)}</small></h3>
    <div class="ph-prev">${img ? `<img src="${img.src}">` : `<span>${T('未放入截图<br>当前显示占位界面')}</span>`}</div>
    <input type="file" id="phFile" accept="image/*" hidden>
    <div class="row"><button class="btn primary" id="phUp">${img ? T('替换截图') : T('上传截图')}</button><button class="btn" id="phLib">${T('从截图库选')}</button>${img ? `<button class="btn" id="phClr">${T('清除')}</button>` : ''}</div>
    ${range(T('缩放'), 'scale', el.scale, 0.15, 1.6, 0.01)}${range(T('旋转'), 'rot', el.rot, -45, 45, 1)}
    ${range(T('水平位置'), 'x', el.x, -0.3, 1.3, 0.005)}${range(T('垂直位置'), 'y', el.y, -0.8, 1.2, 0.005)}
    <div class="row">${check(T('投影'), 'shadow', el.shadow !== false)}</div>
    ${img ? '' : pick(T('占位界面'), 'variant', el.variant % 5, [[0, T('首页卡片')], [1, T('数据图表')], [2, T('图片网格')], [3, T('进度环')], [4, T('地图轨迹')]])}
    <h4>${T('设备（整个集）')}</h4>
    <div class="row">${pick(T('型号'), 'deviceId', f.set.deviceId, DEVICES.filter((d) => d.platform === f.set.platform).map((d) => [d.id, d.name]))}${color(T('边框色'), 'frame', f.set.frame)}</div>`;
  const setProxy = { deviceId: f.set.deviceId, frame: f.set.frame };
  bindFields(P, el, (k) => {
    if (k === 'variant') el.variant = +el.variant;
    drawCard(f.scr.id); updateSel();
  });
  P.querySelectorAll('[data-k="deviceId"],[data-k="frame"]').forEach((inp) => {
    inp.addEventListener('input', () => {
      setProxy[inp.dataset.k] = inp.value; delete el[inp.dataset.k];
      Object.assign(f.set, setProxy);
      if (inp.dataset.k === 'deviceId') fitSetPhones(f.set);
      redrawAll();
    });
  });
  $('phUp').onclick = () => $('phFile').click();
  $('phFile').onchange = async (e) => {
    const [id] = await addFiles(e.target.files);
    if (id) { el.imgId = id; commit(); drawCard(f.scr.id); renderProps(); }
  };
  $('phLib').onclick = () => { ED.tab = 'shots'; renderRail(); renderDrawer(); };
  if ($('phClr')) $('phClr').onclick = () => { el.imgId = null; commit(); drawCard(f.scr.id); renderProps(); };
  elActions(P, f);
}

function propsBlock(P, f) {
  const el = f.el;
  P.innerHTML = `<h3>${T('形状')} <small>${setLabel(f.set)} · ${T('画面 {0}', f.idx + 1)}</small></h3>
    <div class="row">${color(T('颜色'), 'color', el.color)}${check(T('仅描边'), 'outline', el.outline)}</div>
    ${range(T('不透明度'), 'opacity', el.opacity, 0, 1, 0.01)}${range(T('宽度'), 'w', el.w, 0.02, 1.5, 0.01)}${range(T('高度'), 'h', el.h, 0.02, 2, 0.01)}
    ${range(T('圆角'), 'radius', Math.min(el.radius, 600), 0, 600, 1)}${range(T('模糊'), 'blur', el.blur, 0, 200, 1)}${range(T('旋转'), 'rot', el.rot, -90, 90, 1)}`;
  bindFields(P, el, () => { drawCard(f.scr.id); updateSel(); });
  elActions(P, f);
}

function propsScreen(P, c) {
  P.innerHTML = `<h3>${T('画面 {0}', c.idx + 1)} <small>${setLabel(c.set)}</small></h3>
    <div class="row"><button class="btn" id="psText">${T('+ 文字')}</button><button class="btn" id="psPhone">${T('+ 手机')}</button></div>
    <div class="row"><button class="btn" id="psDup">${T('复制画面')}</button><button class="btn danger" id="psDel">${T('删除画面')}</button></div><h4>${T('背景')}</h4>`;
  bgControls(P, c.scr, c.set);
  $('psText').onclick = () => addElement(textEl({ content: T('新的文字'), y: 0.45, w: 0.8, fontSize: 90, color: (c.scr.els.find((e) => e.type === 'text') || { color: '#fff' }).color }));
  $('psPhone').onclick = () => addElement(phoneEl({ x: 0.5, y: 0.35, scale: 0.6 }));
  $('psDup').onclick = () => { c.set.screens.splice(c.idx + 1, 0, cloneScreen(c.scr)); commit(); renderCanvas(); };
  $('psDel').onclick = () => {
    if (c.set.screens.length < 2) return;
    c.set.screens.splice(c.idx, 1); ED.sel = { setId: c.set.id, scrId: null, elId: null };
    commit(); renderCanvas(); renderProps();
  };
}
