// 多语言：以中文原文作为 key，T('中文原文') 返回当前语言文案，{0} {1} 为占位符。
// 语言保存在 localStorage（与主站共用 yatyapp_lang），切换后刷新页面。
var I18N_KEY = 'yatyapp_lang';
var I18N_LANGS = [['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'], ['vi', 'Tiếng Việt'], ['th', 'ไทย']];
var I18N_DICT = {};
var I18N_LANG = (function () {
  var saved = null;
  try { saved = localStorage.getItem(I18N_KEY); } catch (e) {}
  if (saved && I18N_LANGS.some(function (l) { return l[0] === saved; })) return saved;
  var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < list.length; i++) {
    var l = list[i].toLowerCase();
    if (l.indexOf('zh') === 0) return /tw|hk|mo|hant/.test(l) ? 'zh-TW' : 'zh-CN';
    var short = l.slice(0, 2);
    if (['ja', 'ko', 'vi', 'th', 'en'].indexOf(short) >= 0) return short;
  }
  return 'en';
})();
// 画布字体：各语言优先使用对应字形的系统字体
var I18N_FONT = { 'zh-TW': '"PingFang TC","Microsoft JhengHei",', ja: '"Hiragino Sans","Yu Gothic","Meiryo",',
  ko: '"Apple SD Gothic Neo","Malgun Gothic",', th: '"Thonburi","Leelawadee UI",' }[I18N_LANG] || '';

document.documentElement.lang = I18N_LANG;
if (I18N_LANG !== 'zh-CN') document.write('<script src="i18n/' + I18N_LANG + '.js"><\/script>');

function T(key) {
  var s = Object.prototype.hasOwnProperty.call(I18N_DICT, key) ? I18N_DICT[key] : key;
  for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
  return s;
}

// data-i18n：文本；data-i18n-html：含标签的 HTML；data-i18n-title：title 属性
function applyI18n(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = T(el.textContent.trim()); });
  root.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = T(el.innerHTML.trim()); });
  root.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = T(el.title); });
  document.title = T(document.title);
}

function i18nSwitcher() {
  var slot = document.getElementById('langSlot');
  if (!slot) return;
  var s = document.createElement('select');
  s.className = 'lang-sel';
  s.setAttribute('aria-label', 'Language');
  I18N_LANGS.forEach(function (l) {
    var o = document.createElement('option');
    o.value = l[0]; o.textContent = l[1]; o.selected = l[0] === I18N_LANG;
    s.appendChild(o);
  });
  s.onchange = function () {
    try { localStorage.setItem(I18N_KEY, s.value); } catch (e) {}
    if (typeof flushSave === 'function') flushSave().then(function () { location.reload(); }, function () { location.reload(); });
    else location.reload();
  };
  slot.appendChild(s);
}

document.addEventListener('DOMContentLoaded', function () { applyI18n(); i18nSwitcher(); });
