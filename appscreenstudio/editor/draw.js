// 编辑器渲染：画面 = 背景 + 元素(phone/text/block)。坐标为卡片宽/高的比例，字号以 1080 宽为基准
const DECO2 = ['stars', 'speed', 'hills', 'leaves', 'grid', 'robot'];
const IMGS = {}; // 图片 id -> HTMLImageElement

function rotateAbout(ctx, cx, cy, deg) {
  if (!deg) return;
  ctx.translate(cx, cy); ctx.rotate((deg * Math.PI) / 180); ctx.translate(-cx, -cy);
}

function layoutText(ctx, el, W) {
  const u = W / 1080, fs = el.fontSize * u, maxW = el.w * W;
  ctx.font = `${el.weight || 700} ${fs}px ${FONTS[el.font] || FONTS.sans}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${(el.spacing || 0) * u}px`;
  const paras = (el.upper ? el.content.toUpperCase() : el.content).split('\n');
  const lines = [];
  paras.forEach((p, pi) => wrapText(ctx, p, maxW).forEach((t) => lines.push({ t, last: paras.length > 1 && pi === paras.length - 1 })));
  let tw = 0;
  lines.forEach((l) => (tw = Math.max(tw, ctx.measureText(l.t).width)));
  const lh = fs * (el.lh || 1.2);
  return { u, fs, lh, lines, maxW, tw, h: lines.length * lh };
}

function drawTextEl(ctx, el, W, H) {
  const L = layoutText(ctx, el, W);
  const boxed = !!(el.bg || el.border);
  const p = boxed ? L.fs * 0.45 : 0;
  const bw = boxed ? Math.min(L.tw, L.maxW) + 2 * p : L.maxW, bh = L.h + 2 * p;
  const cx = el.x * W, top = el.y * H, left = cx - bw / 2;
  ctx.save();
  rotateAbout(ctx, cx, top + bh / 2, el.rot);
  if (boxed) {
    ctx.save();
    if (el.shadow) { ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24 * L.u; ctx.shadowOffsetY = 8 * L.u; }
    rrect(ctx, left, top, bw, bh, (el.radius ?? 999) * L.u);
    if (el.bg) { ctx.fillStyle = el.bg; ctx.fill(); }
    if (el.border) { ctx.shadowColor = 'transparent'; ctx.lineWidth = 4 * L.u; ctx.strokeStyle = el.border; ctx.stroke(); }
    ctx.restore();
  } else if (el.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 14 * L.u; ctx.shadowOffsetY = 4 * L.u;
  }
  ctx.textBaseline = 'top';
  ctx.textAlign = el.align;
  const ax = el.align === 'left' ? left + p : el.align === 'right' ? left + bw - p : cx;
  L.lines.forEach((l, i) => {
    ctx.fillStyle = l.last && el.color2 ? el.color2 : el.color;
    ctx.fillText(l.t, ax, top + p + i * L.lh + (L.lh - L.fs) / 2);
  });
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.restore();
  return { x: left, y: top, w: bw, h: bh, rot: el.rot || 0 };
}

function drawNotch(ctx, dev, k, sx, sy, sw) {
  ctx.fillStyle = '#000';
  if (dev.notch === 'island') {
    const w = 300 * k, h = 88 * k;
    rrect(ctx, sx + (sw - w) / 2, sy + 34 * k, w, h, h / 2); ctx.fill();
  } else if (dev.notch === 'hole') {
    ctx.beginPath(); ctx.arc(sx + sw / 2, sy + 60 * k, 24 * k, 0, 7); ctx.fill();
  } else if (dev.notch === 'notch') {
    const w = 450 * k, h = 96 * k;
    rrect(ctx, sx + (sw - w) / 2, sy - h, w, h * 2, 40 * k); ctx.fill();
  }
}

function drawPhoneEl(ctx, el, W, H, set) {
  const dev = deviceOf(set.deviceId), u = W / 1080;
  const dw = el.scale * W, k = dw / dev.w, dh = dev.h * k;
  const x = el.x * W - dw / 2, y = el.y * H;
  const R = dev.radius * k, b = dev.bezel * k;
  ctx.save();
  rotateAbout(ctx, x + dw / 2, y + dh / 2, el.rot);
  ctx.save();
  if (el.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 70 * u; ctx.shadowOffsetY = 30 * u; }
  ctx.fillStyle = set.frame;
  rrect(ctx, x, y, dw, dh, R); ctx.fill();
  ctx.restore();
  if (b > 0) {
    if (!dev.tablet) {
      ctx.fillStyle = set.frame;
      rrect(ctx, x + dw - 2 * k, y + dh * 0.18, 14 * k, dh * 0.06, 6 * k); ctx.fill();
      rrect(ctx, x + dw - 2 * k, y + dh * 0.27, 14 * k, dh * 0.11, 6 * k); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 6 * k;
    rrect(ctx, x + 3 * k, y + 3 * k, dw - 6 * k, dh - 6 * k, R); ctx.stroke();
  }
  const sx = x + b, sy = y + b, sw = dw - 2 * b, sh = dh - 2 * b;
  ctx.save();
  rrect(ctx, sx, sy, sw, sh, Math.max(R - b, 4 * k)); ctx.clip();
  const img = el.imgId && IMGS[el.imgId];
  if (img) {
    const sc = Math.max(sw / img.width, sh / img.height);
    ctx.drawImage(img, sx + (sw - img.width * sc) / 2, sy, img.width * sc, img.height * sc);
  } else {
    drawMock(ctx, sx, sy, sw, sh, el.pal || { bg: '#f4f5f9', card: '#fff', ink: '#2a2a33', mute: '#d7dae4', accent: '#5b4bff' }, el.variant || 0);
    drawNotch(ctx, dev, k, sx, sy, sw);
  }
  ctx.restore();
  ctx.restore();
  return { x, y, w: dw, h: dh, rot: el.rot || 0 };
}

function drawBlockEl(ctx, el, W, H) {
  const u = W / 1080, bw = el.w * W, bh = el.h * W, x = el.x * W - bw / 2, y = el.y * H;
  ctx.save();
  rotateAbout(ctx, x + bw / 2, y + bh / 2, el.rot);
  ctx.globalAlpha = el.opacity ?? 1;
  if (el.blur) ctx.filter = `blur(${el.blur * u}px)`;
  rrect(ctx, x, y, bw, bh, el.radius * u);
  if (el.outline) { ctx.lineWidth = 5 * u; ctx.strokeStyle = el.color; ctx.stroke(); }
  else { ctx.fillStyle = el.color; ctx.fill(); }
  ctx.restore();
  return { x, y, w: bw, h: bh, rot: el.rot || 0 };
}

// 返回每个元素的包围盒（画布像素），用于命中测试和选中框
function renderScreen(ctx, W, H, scr, set, idx) {
  ctx.clearRect(0, 0, W, H);
  const bg = scr.bg, u = W / 1080;
  drawBackground(ctx, W, H, { angle: bg.angle, stops: [bg.c1, bg.type === 'solid' ? bg.c1 : bg.c2] });
  const dc = { deco: bg.pattern, decoColor: bg.patternColor };
  if (DECO2.includes(bg.pattern)) drawDeco2(ctx, W, H, u, dc, idx);
  else drawDeco(ctx, W, H, u, dc, idx);
  const boxes = {};
  scr.els.forEach((el) => {
    boxes[el.id] = el.type === 'phone' ? drawPhoneEl(ctx, el, W, H, set)
      : el.type === 'block' ? drawBlockEl(ctx, el, W, H) : drawTextEl(ctx, el, W, H);
  });
  if (bg.front) drawFront(ctx, W, H, u, { front: bg.front });
  return boxes;
}

function hitTest(boxes, els, px, py) {
  for (let i = els.length - 1; i >= 0; i--) {
    const b = boxes[els[i].id];
    if (!b) continue;
    const a = (-(b.rot || 0) * Math.PI) / 180, dx = px - (b.x + b.w / 2), dy = py - (b.y + b.h / 2);
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(rx) <= b.w / 2 && Math.abs(ry) <= b.h / 2) return els[i].id;
  }
  return null;
}
