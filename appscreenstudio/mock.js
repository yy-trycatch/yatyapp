// 主题化的 App 界面占位图：pal = {bg, card, ink, mute, accent}，variant 0-4
function mBar(ctx, x, y, w, h, col) { ctx.fillStyle = col; rrect(ctx, x, y, w, h, h / 2); ctx.fill(); }
function mCard(ctx, x, y, w, h, r, col, shadow) {
  ctx.save();
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,.14)'; ctx.shadowBlur = w * 0.05; ctx.shadowOffsetY = w * 0.015; }
  ctx.fillStyle = col; rrect(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}
function mRow(ctx, x, y, w, h, p, i) {
  mCard(ctx, x, y, w, h, h * 0.25, p.card, true);
  ctx.fillStyle = p.accent; ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(x + h * 0.5, y + h / 2, h * 0.26, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  mBar(ctx, x + h * 0.95, y + h * 0.3, w * (0.38 + (i % 3) * 0.08), h * 0.13, p.ink);
  mBar(ctx, x + h * 0.95, y + h * 0.58, w * 0.3, h * 0.1, p.mute);
}

function drawMock(ctx, sx, sy, sw, sh, p, v) {
  ctx.fillStyle = p.bg; ctx.fillRect(sx, sy, sw, sh);
  const pad = sw * 0.06, iw = sw - 2 * pad;
  let y = sy + sw * 0.13;
  mBar(ctx, sx + pad, y, sw * 0.34, sw * 0.05, p.ink);
  ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(sx + sw - pad - sw * 0.04, y + sw * 0.025, sw * 0.04, 0, 7); ctx.fill();
  y += sw * 0.14;
  v = v % 5;
  if (v === 0) {
    mCard(ctx, sx + pad, y, iw, sw * 0.5, sw * 0.05, p.accent, true);
    mBar(ctx, sx + pad * 2, y + sw * 0.1, iw * 0.5, sw * 0.05, 'rgba(255,255,255,.95)');
    mBar(ctx, sx + pad * 2, y + sw * 0.2, iw * 0.35, sw * 0.035, 'rgba(255,255,255,.55)');
    mBar(ctx, sx + pad * 2, y + sw * 0.36, iw * 0.28, sw * 0.07, 'rgba(255,255,255,.9)');
    y += sw * 0.56;
    for (let i = 0; i < 6 && y < sy + sh; i++, y += sw * 0.21) mRow(ctx, sx + pad, y, iw, sw * 0.18, p, i);
  } else if (v === 1) {
    mBar(ctx, sx + pad, y, sw * 0.4, sw * 0.09, p.ink);
    mBar(ctx, sx + pad, y + sw * 0.12, sw * 0.26, sw * 0.035, p.mute);
    y += sw * 0.22;
    mCard(ctx, sx + pad, y, iw, sw * 0.62, sw * 0.05, p.card, true);
    const bw = iw / 9;
    for (let i = 0; i < 7; i++) {
      const bh = sw * (0.12 + ((i * 37) % 7) * 0.05);
      ctx.fillStyle = i === 4 ? p.accent : p.mute; ctx.globalAlpha = i === 4 ? 1 : 0.4;
      rrect(ctx, sx + pad * 2 + i * bw * 1.15, y + sw * 0.56 - bh, bw * 0.8, bh, bw * 0.2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    y += sw * 0.7;
    for (let i = 0; i < 4 && y < sy + sh; i++, y += sw * 0.2) mRow(ctx, sx + pad, y, iw, sw * 0.17, p, i + 1);
  } else if (v === 2) {
    mCard(ctx, sx + pad, y, iw, sw * 0.11, sw * 0.055, p.card, true);
    y += sw * 0.17;
    const tw = (iw - sw * 0.04) / 2;
    for (let r = 0; r < 4 && y < sy + sh; r++, y += sw * 0.5)
      for (let c = 0; c < 2; c++) {
        const x = sx + pad + c * (tw + sw * 0.04);
        const g = ctx.createLinearGradient(x, y, x + tw, y + sw * 0.34);
        g.addColorStop(0, p.accent); g.addColorStop(1, p.mute);
        ctx.globalAlpha = 0.85; ctx.fillStyle = g; rrect(ctx, x, y, tw, sw * 0.34, sw * 0.04); ctx.fill(); ctx.globalAlpha = 1;
        mBar(ctx, x, y + sw * 0.37, tw * 0.7, sw * 0.04, p.ink);
        mBar(ctx, x, y + sw * 0.44, tw * 0.45, sw * 0.03, p.mute);
      }
  } else if (v === 3) {
    const cx = sx + sw / 2, cy = y + sw * 0.32, rr = sw * 0.26;
    ctx.lineWidth = sw * 0.06; ctx.lineCap = 'round';
    ctx.strokeStyle = p.card; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.stroke();
    ctx.strokeStyle = p.accent; ctx.beginPath(); ctx.arc(cx, cy, rr, -Math.PI / 2, Math.PI * 0.9); ctx.stroke();
    mBar(ctx, cx - sw * 0.1, cy - sw * 0.04, sw * 0.2, sw * 0.07, p.ink);
    y += sw * 0.72;
    for (let i = 0; i < 5 && y < sy + sh; i++, y += sw * 0.2) mRow(ctx, sx + pad, y, iw, sw * 0.17, p, i + 2);
  } else {
    ctx.strokeStyle = p.mute; ctx.globalAlpha = 0.35; ctx.lineWidth = sw * 0.01;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(sx + sw * 0.5, y + sw * 0.5, sw * (0.1 + i * 0.07), sw * (0.07 + i * 0.06), i * 0.3, 0, 7); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p.accent; ctx.lineWidth = sw * 0.03;
    ctx.beginPath(); ctx.moveTo(sx + sw * 0.15, y + sw * 0.9); ctx.bezierCurveTo(sx + sw * 0.4, y + sw * 0.3, sx + sw * 0.5, y + sw * 1.0, sx + sw * 0.85, y + sw * 0.35); ctx.stroke();
    mCard(ctx, sx + pad, sy + sh * 0.7, iw, sw * 0.4, sw * 0.05, p.card, true);
    mBar(ctx, sx + pad * 2, sy + sh * 0.7 + sw * 0.08, iw * 0.45, sw * 0.07, p.ink);
    mBar(ctx, sx + pad * 2, sy + sh * 0.7 + sw * 0.22, iw * 0.7, sw * 0.08, p.accent);
  }
  mCard(ctx, sx, sy + sh - sw * 0.2, sw, sw * 0.2, 0, p.card, false);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? p.accent : p.mute;
    ctx.beginPath(); ctx.arc(sx + sw * (0.14 + i * 0.24), sy + sh - sw * 0.1, sw * 0.03, 0, 7); ctx.fill();
  }
}
