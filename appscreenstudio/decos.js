// 套装模板的额外装饰（背景层 drawDeco2 / 前景层 drawFront / 手写批注 drawNote）
function seeded(seed) {
  let a = seed * 9301 + 49297;
  return () => ((a = (a * 9301 + 49297) % 233280) / 233280);
}

function leaf(ctx, x, y, len, ang, col) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(len * 0.25, -len * 0.32, len * 0.75, -len * 0.3, len, 0);
  ctx.bezierCurveTo(len * 0.75, len * 0.3, len * 0.25, len * 0.32, 0, 0);
  ctx.fill();
  ctx.restore();
}

function drawDeco2(ctx, w, h, u, c, idx) {
  const col = c.decoColor, r = seeded(idx + 3);
  ctx.save();
  if (c.deco === 'stars') {
    for (let i = 0; i < 140; i++) {
      ctx.globalAlpha = 0.25 + r() * 0.7;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(r() * w, r() * h * 0.8, (1 + r() * 3) * u, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(w * 0.5, h * 0.95, 0, w * 0.5, h * 0.95, w * 0.9);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(60,20,120,.7)';
    ctx.beginPath(); ctx.moveTo(0, h);
    [[0, .88], [.18, .8], [.33, .87], [.55, .77], [.78, .86], [1, .8], [1, 1]].forEach(([x, y]) => ctx.lineTo(w * x, h * y));
    ctx.closePath(); ctx.fill();
  } else if (c.deco === 'speed') {
    ctx.fillStyle = col;
    for (let i = 0; i < 9; i++) {
      const x = r() * w * 1.3 - w * 0.2, y = r() * h, len = (300 + r() * 500) * u, th = (10 + r() * 36) * u;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len * 0.5); ctx.lineTo(x + len, y - len * 0.5 + th); ctx.lineTo(x, y + th); ctx.fill();
    }
  } else if (c.deco === 'hills') {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, h * 0.85);
    ctx.bezierCurveTo(w * 0.3, h * 0.72, w * 0.6, h * 0.95, w, h * 0.78);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(0, h * 0.7);
    ctx.bezierCurveTo(w * 0.35, h * 0.6, w * 0.7, h * 0.8, w, h * 0.62);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  } else if (c.deco === 'leaves') {
    [[w * 1.02, h * 0.08, 520, 2.5], [w * 1.0, h * 0.2, 420, 2.9], [-w * 0.02, h * 0.62, 480, -0.4], [w * 1.0, h * 0.74, 520, 3.5], [-w * 0.02, h * 0.9, 420, -0.9]]
      .forEach(([x, y, l, a], i) => leaf(ctx, x, y, l * u, a + k0(idx, i), i % 2 ? col : 'rgba(40,120,50,.28)'));
  } else if (c.deco === 'grid') {
    ctx.fillStyle = col;
    const gap = 60 * u;
    for (let y = gap; y < h; y += gap) for (let x = gap; x < w; x += gap) { ctx.beginPath(); ctx.arc(x, y, 3.5 * u, 0, 7); ctx.fill(); }
  } else if (c.deco === 'robot') {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(w * 0.9, h * 0.1, 260 * u, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.05, h * 0.55, 200 * u, 0, 7); ctx.fill();
  }
  ctx.restore();
}
const k0 = (idx, i) => ((idx * 7 + i * 3) % 5) * 0.06;

function drawFront(ctx, w, h, u, c) {
  if (c.front !== 'robot') return;
  const x = w * 0.2, y = h * 0.92, s = u * 1.5;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#dfe9ff'; // 身体
  rrect(ctx, -46, 0, 92, 110, 34); ctx.fill();
  ctx.fillStyle = '#7fb4ff';
  rrect(ctx, -58, 12, 22, 70, 11); ctx.fill(); rrect(ctx, 36, 12, 22, 70, 11); ctx.fill();
  ctx.fillStyle = '#eef3ff'; // 头
  rrect(ctx, -66, -92, 132, 100, 44); ctx.fill();
  ctx.fillStyle = '#17163a';
  rrect(ctx, -50, -76, 100, 66, 30); ctx.fill();
  ctx.fillStyle = '#4de2ff';
  ctx.beginPath(); ctx.arc(-20, -44, 9, 0, 7); ctx.arc(20, -44, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#6b4cff';
  ctx.fillRect(-3, -112, 6, 22); ctx.beginPath(); ctx.arc(0, -116, 8, 0, 7); ctx.fill();
  ctx.restore();
}

function drawNote(ctx, w, u, x, y, c, text) {
  if (!text) return;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.1);
  ctx.font = `700 ${58 * u}px ${FONTS.hand}`;
  ctx.fillStyle = c.accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  const tw = ctx.measureText(text).width;
  ctx.strokeStyle = c.accent; ctx.lineWidth = 4 * u; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-tw / 2, 40 * u); ctx.quadraticCurveTo(0, 54 * u, tw / 2, 36 * u); ctx.stroke();
  ctx.restore();
}
