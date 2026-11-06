// 本地持久化（IndexedDB：工程 JSON + 截图 Blob）与撤销/重做
const DB = { db: null };
function idbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('appscreenstudio', 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('imgs'); };
    r.onsuccess = () => res((DB.db = r.result));
    r.onerror = () => rej(r.error);
  });
}
function idb(store, mode, fn) {
  if (!DB.db) return Promise.resolve(null);
  return new Promise((res, rej) => {
    const tx = DB.db.transaction(store, mode);
    const rq = fn(tx.objectStore(store));
    tx.oncomplete = () => res(rq && rq.result);
    tx.onerror = () => rej(tx.error);
  });
}
const kvGet = (k) => idb('kv', 'readonly', (s) => s.get(k));
const kvPut = (k, v) => idb('kv', 'readwrite', (s) => s.put(v, k));
const imgPut = (id, b) => idb('imgs', 'readwrite', (s) => s.put(b, id));
const imgGet = (id) => idb('imgs', 'readonly', (s) => s.get(id));
const imgDel = (id) => idb('imgs', 'readwrite', (s) => s.delete(id));

function loadImage(id, blob) {
  return new Promise((r) => {
    const im = new Image();
    im.onload = () => { IMGS[id] = im; r(im); };
    im.onerror = () => r(null);
    im.src = URL.createObjectURL(blob);
  });
}
async function addImageFile(file) {
  const id = 'img_' + uid();
  await imgPut(id, file);
  const im = await loadImage(id, file);
  return im ? id : null;
}
async function loadLibraryImages(ids) {
  for (const id of ids) {
    if (IMGS[id]) continue;
    const b = await imgGet(id);
    if (b) await loadImage(id, b);
  }
}

const HIST = { stack: [], i: -1 };
function histReset() { HIST.stack = [JSON.stringify(ED.p)]; HIST.i = 0; updateUndoBtns(); }
function commit() {
  const j = JSON.stringify(ED.p);
  if (j === HIST.stack[HIST.i]) return;
  HIST.stack = HIST.stack.slice(0, HIST.i + 1);
  HIST.stack.push(j);
  if (HIST.stack.length > 80) HIST.stack.shift();
  HIST.i = HIST.stack.length - 1;
  scheduleSave();
  updateUndoBtns();
}
function undo() { if (HIST.i > 0) { HIST.i--; restoreHist(); } }
function redo() { if (HIST.i < HIST.stack.length - 1) { HIST.i++; restoreHist(); } }
function restoreHist() {
  ED.p = JSON.parse(HIST.stack[HIST.i]);
  if (!findScreen(ED.sel.scrId)) ED.sel = { setId: null, scrId: null, elId: null };
  else if (ED.sel.elId && !findEl(ED.sel.elId)) ED.sel.elId = null;
  scheduleSave();
  updateUndoBtns();
  renderAll();
}
function updateUndoBtns() {
  $('btnUndo').disabled = HIST.i <= 0;
  $('btnRedo').disabled = HIST.i >= HIST.stack.length - 1;
}

let saveT;
async function flushSave() {
  clearTimeout(saveT);
  try { await kvPut('project', ED.p); $('saveState').textContent = DB.db ? T('所有更改已保存') : T('未启用本地存储'); }
  catch (e) { $('saveState').textContent = T('保存失败'); console.error(e); }
}
function scheduleSave() {
  $('saveState').textContent = T('保存中…');
  clearTimeout(saveT);
  saveT = setTimeout(flushSave, 400);
}
