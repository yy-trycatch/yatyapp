// 模板库：预览图与编辑器使用同一套渲染（editor/draw.js + editor/model.js）
const $ = (id) => document.getElementById(id);
let activeTag = T('全部');

function preview(t, i, cw) {
  const size = sizeById('ios-69'), dev = deviceOf('iphone-17-pro-max');
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = Math.round((cw * size.h) / size.w);
  const scr = buildScreen(t, tplSlides(t)[i], i, size, dev);
  renderScreen(cv.getContext('2d'), cv.width, cv.height, scr, { deviceId: dev.id, frame: t.frame }, i);
  return cv;
}

function buildGallery() {
  const tags = [T('全部'), ...new Set(TEMPLATES.flatMap((t) => t.tags))];
  $('chips').innerHTML = '';
  tags.forEach((tg) => {
    const b = document.createElement('button');
    b.className = 'chip' + (tg === activeTag ? ' on' : '');
    b.textContent = tg;
    b.onclick = () => { activeTag = tg; buildGallery(); };
    $('chips').appendChild(b);
  });
  $('grid').innerHTML = '';
  TEMPLATES.filter((t) => activeTag === T('全部') || t.tags.includes(activeTag)).forEach((t) => {
    const card = document.createElement('div');
    card.className = 'card';
    const strip = document.createElement('div');
    strip.className = 'strip';
    for (let i = 0; i < 3; i++) strip.appendChild(preview(t, i, 270));
    card.appendChild(strip);
    card.insertAdjacentHTML('beforeend', `<div class="meta"><div><b>${t.name}</b><br><span>${t.tags.join(' · ')}</span></div><span class="use">${T('使用此模板 →')}</span></div>`);
    card.onclick = () => (location.href = 'editor.html?tpl=' + encodeURIComponent(t.id));
    $('grid').appendChild(card);
  });
}

buildGallery();
