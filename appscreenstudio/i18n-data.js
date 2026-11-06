// 把模板、设备、尺寸、示例文案等数据翻译为当前语言（需在 templates.js / sets.js / editor/model.js 之后加载）
(function () {
  TEMPLATES.forEach((t) => { t.name = T(t.name); t.tags = t.tags.map((g) => T(g)); });
  SAMPLE_SLIDES.forEach((s) => { s.title = T(s.title); s.sub = T(s.sub); });
  DEVICES.forEach((d) => { d.name = T(d.name); });
  Object.keys(STORE_SIZES).forEach((k) => STORE_SIZES[k].forEach((s) => { s.name = T(s.name); }));
})();
