// 导出：每个集可选多个商店尺寸，按 平台/集/尺寸 分文件夹打包 ZIP
function openExport() {
  const m = $('exportModal');
  m.querySelector('.ex-body').innerHTML = ED.p.sets.map((set) => `<fieldset data-set="${set.id}">
    <legend><span class="pf ${set.platform}">${PLATFORM_NAME[set.platform]}</span> ${setLabel(set)} · ${T('{0} 张', set.screens.length)}</legend>
    ${STORE_SIZES[set.platform].map((z) => `<label class="chk"><input type="checkbox" value="${z.id}"${z.id === set.sizeId ? ' checked' : ''}> ${z.name} <small>${z.w}×${z.h}</small></label>`).join('')}
  </fieldset>`).join('');
  $('exProgress').textContent = '';
  m.hidden = false;
}

async function runExport() {
  const fmtSel = $('exFormat').value, mime = fmtSel === 'jpg' ? 'image/jpeg' : 'image/png';
  const jobs = [];
  document.querySelectorAll('#exportModal fieldset').forEach((fs) => {
    const set = ED.p.sets.find((s) => s.id === fs.dataset.set);
    fs.querySelectorAll('input:checked').forEach((i) => jobs.push({ set, size: sizeById(i.value) }));
  });
  const total = jobs.reduce((a, j) => a + j.set.screens.length, 0);
  if (!total) { $('exProgress').textContent = T('请至少勾选一个尺寸。'); return; }
  $('exGo').disabled = true;
  const files = [], cv = document.createElement('canvas');
  let n = 0;
  try {
    for (const { set, size } of jobs) {
      const folder = `${set.platform === 'ios' ? 'AppStore' : 'GooglePlay'}/${set.platform === 'ios' ? 'iOS' : 'Android'}-${setNum(set)}/${size.id}_${size.w}x${size.h}`;
      cv.width = size.w; cv.height = size.h;
      for (let i = 0; i < set.screens.length; i++) {
        $('exProgress').textContent = T('正在渲染 {0}/{1}…', ++n, total);
        renderScreen(cv.getContext('2d'), size.w, size.h, set.screens[i], set, i);
        const blob = await new Promise((r) => cv.toBlob(r, mime, 0.95));
        files.push({ name: `${folder}/${String(i + 1).padStart(2, '0')}.${fmtSel}`, data: new Uint8Array(await blob.arrayBuffer()) });
        await new Promise((r) => setTimeout(r));
      }
    }
    $('exProgress').textContent = T('正在打包 ZIP…');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(makeZip(files));
    a.download = `${(ED.p.name || 'screenshots').replace(/[\\/:*?"<>|]/g, '_')}-screenshots.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    $('exProgress').textContent = T('完成：{0} 张图片已下载。', files.length);
  } catch (e) {
    console.error(e);
    $('exProgress').textContent = T('导出失败：') + e.message;
  } finally {
    $('exGo').disabled = false;
  }
}
