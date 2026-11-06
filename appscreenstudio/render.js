// 画布渲染：背景 -> 装饰 -> 文字 -> 设备
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(ctx, w, h, c) {
  const a = (c.angle * Math.PI) / 180;
  const dx = Math.sin(a), dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = w / 2, cy = h / 2;
  const g = ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2);
  g.addColorStop(0, c.stops[0]);
  g.addColorStop(1, c.stops[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawDeco(ctx, w, h, u, c, idx) {
  const col = c.decoColor;
  const k = (idx % 3) * 0.12;
  ctx.save();
  ctx.fillStyle = col;
  ctx.strokeStyle = col;
  if (c.deco === 'blobs') {
    [[0.1 + k, 0.12, 260], [0.95 - k, 0.45, 330], [0.2, 0.92 - k, 300]].forEach(([x, y, r]) => {
      ctx.beginPath(); ctx.arc(w * x, h * y, r * u, 0, Math.PI * 2); ctx.fill();
    });
  } else if (c.deco === 'rings') {
    ctx.lineWidth = 36 * u;
    [[0.88 - k, 0.1, 280], [0.05 + k, 0.7, 340]].forEach(([x, y, r]) => {
      ctx.beginPath(); ctx.arc(w * x, h * y, r * u, 0, Math.PI * 2); ctx.stroke();
    });
  } else if (c.deco === 'dots') {
    const gap = 54 * u;
    for (let y = gap / 2 + k * 40 * u; y < h; y += gap)
      for (let x = gap / 2; x < w; x += gap) {
        ctx.beginPath(); ctx.arc(x, y, 5 * u, 0, Math.PI * 2); ctx.fill();
      }
  } else if (c.deco === 'stripes') {
    ctx.lineWidth = 46 * u;
    const gap = 150 * u;
    for (let i = -h; i < w + h; i += gap) {
      ctx.beginPath(); ctx.moveTo(i + k * 100 * u, 0); ctx.lineTo(i + h * 0.6 + k * 100 * u, h); ctx.stroke();
    }
  } else if (c.deco === 'glow') {
    const gx = w * (0.5 + (idx % 2 ? 0.25 : -0.25)), gy = h * 0.62;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.85);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

// 拉丁/越南语/韩语按词拆（保留词尾空格），中日文和泰文按字拆（泰文声调符号跟随前一个字符）
function wrapText(ctx, text, maxW) {
  const lines = [];
  text.split('\n').forEach((para) => {
    const toks = para.match(/[\p{Script=Latin}\p{Script=Hangul}\p{N}\p{M}'’.,!?:;%$@#&()\-]+\s*|[\s\S]\p{M}*/gu) || [''];
    let cur = '';
    toks.forEach((t) => {
      if (cur && ctx.measureText((cur + t).trimEnd()).width > maxW) { lines.push(cur.trimEnd()); cur = t.trimStart(); }
      else cur += t;
    });
    lines.push(cur.trimEnd());
  });
  return lines;
}
