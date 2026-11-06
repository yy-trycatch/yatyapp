// 数据模型：设备、商店尺寸、工程结构、模板 -> 画面
const DEVICES = [
  { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', platform: 'ios', w: 1290, h: 2796, bezel: 28, radius: 220, notch: 'island' },
  { id: 'iphone-17-pro', name: 'iPhone 17 Pro', platform: 'ios', w: 1179, h: 2556, bezel: 28, radius: 190, notch: 'island' },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', platform: 'ios', w: 1290, h: 2796, bezel: 32, radius: 200, notch: 'island' },
  { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', platform: 'ios', w: 1284, h: 2778, bezel: 32, radius: 190, notch: 'notch' },
  { id: 'ios-borderless', name: 'iPhone 无边框', platform: 'ios', w: 1290, h: 2796, bezel: 0, radius: 110, notch: 'island' },
  { id: 'ipad-pro-13', name: 'iPad Pro 13', platform: 'ios', w: 2064, h: 2752, bezel: 50, radius: 150, notch: 'none', tablet: true },
  { id: 'pixel-8-pro', name: 'Pixel 8 Pro', platform: 'android', w: 1344, h: 2992, bezel: 28, radius: 90, notch: 'hole' },
  { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', platform: 'android', w: 1440, h: 3120, bezel: 28, radius: 60, notch: 'hole' },
  { id: 'galaxy-s26-ultra', name: 'Galaxy S26 Ultra', platform: 'android', w: 1440, h: 3120, bezel: 28, radius: 110, notch: 'hole' },
  { id: 'android-borderless', name: 'Android 无边框', platform: 'android', w: 1080, h: 2400, bezel: 0, radius: 90, notch: 'hole' },
  { id: 'galaxy-tab-s10', name: 'Galaxy Tab S10', platform: 'android', w: 1752, h: 2800, bezel: 60, radius: 100, notch: 'none', tablet: true },
];

// 来自 App Store Connect / Google Play Console 接受的尺寸
const STORE_SIZES = {
  ios: [
    { id: 'ios-69', name: 'iPhone 6.9″', w: 1320, h: 2868 },
    { id: 'ios-67', name: 'iPhone 6.7″', w: 1290, h: 2796 },
    { id: 'ios-65', name: 'iPhone 6.5″', w: 1242, h: 2688 },
    { id: 'ios-55', name: 'iPhone 5.5″', w: 1242, h: 2208 },
    { id: 'ipad-13', name: 'iPad 13″', w: 2064, h: 2752 },
    { id: 'ipad-129', name: 'iPad 12.9″', w: 2048, h: 2732 },
  ],
  android: [
    { id: 'gp-phone', name: '手机 9:16', w: 1080, h: 1920 },
    { id: 'gp-phone-tall', name: '手机 1:2', w: 1080, h: 2160 },
    { id: 'gp-7', name: '7″ 平板', w: 1200, h: 1920 },
    { id: 'gp-10', name: '10″ 平板', w: 1600, h: 2560 },
    { id: 'gp-feature', name: '置顶大图', w: 1024, h: 500 },
  ],
};
const PLATFORM_NAME = { ios: 'App Store', android: 'Google Play' };
const DEFAULT_SET = { ios: ['ios-69', 'iphone-17-pro-max'], android: ['gp-phone', 'pixel-8-pro'] };

const uid = () => Math.random().toString(36).slice(2, 10);
const deviceOf = (id) => DEVICES.find((d) => d.id === id) || DEVICES[0];
const sizeById = (id) => STORE_SIZES.ios.concat(STORE_SIZES.android).find((s) => s.id === id) || STORE_SIZES.ios[0];
const tplById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
const tplSlides = (t) => t.slides || SAMPLE_SLIDES.map((s) => Object.assign({ titleSize: 84, subSize: 40 }, s));

const textEl = (o) => Object.assign({ id: uid(), type: 'text', linkKey: null, content: '', x: 0.5, y: 0.1, w: 0.852,
  fontSize: 84, font: 'sans', weight: 800, color: '#ffffff', color2: '', align: 'center', lh: 1.18, spacing: 0,
  upper: false, rot: 0, bg: '', border: '', radius: 999, shadow: false }, o);
const phoneEl = (o) => Object.assign({ id: uid(), type: 'phone', imgId: null, x: 0.5, y: 0.4, scale: 0.76, rot: 0,
  shadow: true, variant: 0, pal: null }, o);
const blockEl = (o) => Object.assign({ id: uid(), type: 'block', x: 0.5, y: 0.5, w: 0.5, h: 0.2, color: '#ffffff',
  opacity: 1, radius: 40, blur: 0, outline: false, rot: 0 }, o);

const _mctx = document.createElement('canvas').getContext('2d');

// 按模板的布局规则生成一个画面（W 固定按 1080 计算，再换算为比例）
function buildScreen(t, s, i, size, dev) {
  const W = 1080, H = (W * size.h) / size.w, land = size.w > size.h;
  const st = s.stops || t.stops;
  const bg = { type: 'gradient', c1: st[0], c2: st[1], angle: t.angle, pattern: s.deco || t.deco,
    patternColor: s.dc || t.decoColor, front: t.front || '' };
  const k = land ? 0.5 : 1, boxW = land ? 0.44 : 0.852, cx = land ? 0.29 : 0.5;
  const base = { font: t.font, weight: t.weight || 800, color: s.tc || t.title, upper: !!t.upper,
    lh: t.upper ? 1.05 : 1.18, align: land ? 'left' : t.align, w: boxW, x: cx };
  const txt = [];
  if (s.kicker) txt.push(textEl({ ...base, linkKey: `${i}-kicker`, content: s.kicker, fontSize: 34 * k, color: t.accent, upper: true, spacing: 4, lh: 1.3 }));
  if (s.title) txt.push(textEl({ ...base, linkKey: `${i}-title`, content: s.title, fontSize: (s.titleSize || 84) * k, color2: t.accent2 || '' }));
  if (s.sub) txt.push(textEl({ ...base, linkKey: `${i}-sub`, content: s.sub, fontSize: (s.subSize || 40) * k, weight: 500, color: s.sc || t.sub, upper: false, lh: 1.4 }));
  const hs = txt.map((e) => layoutText(_mctx, e, W).h);
  const gap = 26 * k, total = hs.reduce((a, b) => a + b, 0) + gap * Math.max(0, txt.length - 1);
  const a = dev.h / dev.w, fw = size.h / size.w < 1.6 ? 0.84 : 0.76;
  const layout = s.layout || t.layout;
  let top, dw, dh, py, rot = 0, px = 0.5;
  if (land) {
    top = (H - total) / 2; dw = H * 0.5; py = H * 0.1; px = 0.74; rot = -6;
  } else if (layout === 'bottom') {
    top = H - 110 - total; dw = fw * W; dh = dw * a; py = top - 80 - dh;
  } else {
    top = 110; dw = fw * W; py = top + total + 80;
    if (layout === 'full') { dh = H - py - 90; dw = Math.min(dh / a, fw * W); }
    else if (layout === 'tilt') { dw *= 0.94; py += 50; rot = i % 2 ? 7 : -7; }
  }
  let y = top;
  txt.forEach((e, j) => { e.y = y / H; y += hs[j] + gap; });
  const pal = t.pal || { bg: '#f4f5f9', card: '#ffffff', ink: '#2a2a33', mute: '#d7dae4', accent: t.accent };
  const phone = phoneEl({ x: px, y: py / H, scale: dw / W, rot, variant: s.variant ?? i, pal });
  fitPhone(phone, size, dev);
  py = phone.y * H;
  const els = [phone, ...txt];
  if (s.note && !land) els.push(textEl({ linkKey: `${i}-note`, content: s.note, font: 'hand', weight: 700, fontSize: 58,
    color: t.accent, rot: -6, x: 0.74, w: 0.5, y: Math.max(py - 90, 60) / H, lh: 1.2 }));
  return { id: uid(), bg, els };
}

// 手机（含旋转后的外接框）超出画面上下边界时等比缩小：
// 未越界的一端保持不动，两端都越界则在画面内居中。返回是否做了调整
function fitPhone(el, size, dev, pad = 60) {
  const W = 1080, H = (W * size.h) / size.w, a = dev.h / dev.w, r = Math.abs(el.rot || 0) * Math.PI / 180;
  const dw = el.scale * W, dh = dw * a, hb = (dh * Math.cos(r) + dw * Math.sin(r)) / 2;
  const cy = el.y * H + dh / 2, topE = cy - hb, botE = cy + hb;
  if (topE >= pad - 0.5 && botE <= H - pad + 0.5) return false;
  let f, ncy;
  if (topE >= pad) { f = (H - pad - topE) / (2 * hb); ncy = topE + hb * f; }
  else if (botE <= H - pad) { f = (botE - pad) / (2 * hb); ncy = botE - hb * f; }
  else { f = (H - 2 * pad) / (2 * hb); ncy = H / 2; }
  if (f <= 0.05) f = 0.05;
  el.scale *= f;
  el.y = (ncy - (dh * f) / 2) / H;
  return true;
}

function fitSetPhones(set) {
  const size = sizeById(set.sizeId), dev = deviceOf(set.deviceId);
  let n = 0;
  set.screens.forEach((sc) => sc.els.forEach((el) => { if (el.type === 'phone' && fitPhone(el, size, dev)) n++; }));
  return n;
}

function makeSet(platform, tplId, sizeId, deviceId, old) {
  const t = tplById(tplId), size = sizeById(sizeId), dev = deviceOf(deviceId);
  const screens = tplSlides(t).map((s, i) => buildScreen(t, s, i, size, dev));
  if (old) screens.forEach((sc, i) => {
    const op = old.screens[i] && old.screens[i].els.find((e) => e.type === 'phone' && e.imgId);
    if (op) sc.els[0].imgId = op.imgId;
  });
  return { id: old ? old.id : uid(), platform, sizeId, deviceId, frame: t.frame, screens };
}

function newSet(p, platform) {
  const [sz, dv] = DEFAULT_SET[platform];
  return makeSet(platform, p.tpl, sz, dv);
}

function defaultProject(tplId) {
  const p = { v: 1, name: T('我的应用'), tpl: tplId || 'wanderbook', linkTexts: true, fitted: true, library: [], sets: [] };
  p.sets = [newSet(p, 'ios'), newSet(p, 'android')];
  return p;
}

function applyTemplateToProject(p, tplId) {
  p.tpl = tplId;
  p.sets = p.sets.map((s) => makeSet(s.platform, tplId, s.sizeId, s.deviceId, s));
}

// 复制画面：元素换新 id，文字断开跨平台链接
function cloneScreen(scr) {
  const c = JSON.parse(JSON.stringify(scr));
  c.id = uid();
  c.els.forEach((e) => { e.id = uid(); if (e.type === 'text') e.linkKey = null; });
  return c;
}

const LINK_KEYS = ['content', 'fontSize', 'font', 'weight', 'color', 'color2', 'align', 'lh', 'spacing', 'upper', 'rot', 'bg', 'border', 'radius', 'shadow'];
function linkedPeers(p, setId, idx, el) {
  if (!p.linkTexts || !el.linkKey) return [];
  const out = [];
  p.sets.forEach((s) => {
    if (s.id === setId || !s.screens[idx]) return;
    s.screens[idx].els.forEach((o) => { if (o.linkKey === el.linkKey) out.push(o); });
  });
  return out;
}
function syncLinked(p, setId, idx, el, keys) {
  linkedPeers(p, setId, idx, el).forEach((o) => keys.forEach((k) => (o[k] = el[k])));
}
