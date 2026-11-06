// 编辑器入口：载入工程、顶栏、快捷键
function bindTopbar() {
  $('btnUndo').onclick = undo;
  $('btnRedo').onclick = redo;
  $('zoomOut').onclick = () => setZoom(ED.zoom / 1.15);
  $('zoomIn').onclick = () => setZoom(ED.zoom * 1.15);
  $('zoomVal').onclick = () => setZoom(1);
  $('btnLink').onclick = () => { ED.p.linkTexts = !ED.p.linkTexts; $('btnLink').classList.toggle('on', ED.p.linkTexts); commit(); renderProps(); };
  $('projName').oninput = (e) => (ED.p.name = e.target.value);
  $('projName').onchange = commit;
  $('btnExport').onclick = openExport;
  $('exGo').onclick = runExport;
  $('exClose').onclick = () => ($('exportModal').hidden = true);
  $('btnNew').onclick = () => {
    if (!confirm(T('新建空白工程？当前工程会被覆盖（截图库保留）。'))) return;
    const lib = ED.p.library;
    ED.p = defaultProject(ED.p.tpl);
    ED.p.library = lib;
    ED.sel = { setId: null, scrId: null, elId: null };
    commit(); renderAll();
  };
}

function bindKeys() {
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (mod && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); return; }
    if (typing) return;
    if (e.key === 'Escape') { $('exportModal').hidden = true; select(null, null, null); return; }
    const f = selEl();
    if (!f) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); elAction('del'); }
    else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); elAction('dup'); }
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const s = e.shiftKey ? 0.01 : 0.002;
      if (e.key === 'ArrowLeft') f.el.x -= s;
      if (e.key === 'ArrowRight') f.el.x += s;
      if (e.key === 'ArrowUp') f.el.y -= s;
      if (e.key === 'ArrowDown') f.el.y += s;
      drawCard(f.scr.id); updateSel();
      clearTimeout(bindKeys.t); bindKeys.t = setTimeout(() => { commit(); renderProps(); }, 300);
    }
  });
}

(async function init() {
  // 个别环境（隐私模式等）IndexedDB 会一直挂起，超时后按无存储模式继续
  const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
  try { await Promise.race([idbOpen(), timeout(2000)]); } catch (e) { DB.db = null; console.warn('IndexedDB 不可用，修改不会保存', e); }
  let p = null;
  try { p = await kvGet('project'); } catch (e) { console.warn(e); }
  if (!p || p.v !== 1) p = defaultProject();
  // 旧版工程里被截断的手机（如 Android 9:16 画面）只修正一次，之后尊重用户的手动摆放
  if (!p.fitted) { p.sets.forEach(fitSetPhones); p.fitted = true; }
  const q = new URLSearchParams(location.search).get('tpl');
  if (q && TEMPLATES.some((t) => t.id === q)) {
    applyTemplateToProject(p, q);
    history.replaceState(null, '', location.pathname);
  }
  ED.p = p;
  await loadLibraryImages(p.library);
  bindTopbar(); bindKeys(); bindCanvasRoot(); renderRail();
  histReset();
  renderAll();
  scheduleSave();
})();
