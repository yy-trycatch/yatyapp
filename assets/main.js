(function () {
  var LANG_KEY = "yatyapp_lang";

  function browserLang() {
    var l = (navigator.language || "").toLowerCase();
    if (l.indexOf("zh") !== 0) return "en";
    return /tw|hk|mo|hant/.test(l) ? "zh-TW" : "zh-CN";
  }

  function getSaved() {
    try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
  }

  var langLinks = document.querySelectorAll(".lang a[data-lang]");
  langLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem(LANG_KEY, a.getAttribute("data-lang")); } catch (e) {}
      a.href = a.getAttribute("href").split("#")[0] + location.hash;
    });
  });

  // First visit to a default (简体) page: follow the browser language once
  if (!getSaved() && document.documentElement.lang === "zh-CN") {
    var want = browserLang();
    if (want !== "zh-CN") {
      var target = document.querySelector('.lang a[data-lang="' + want + '"]');
      if (target) {
        location.replace(target.getAttribute("href") + location.hash);
        return;
      }
    }
  }

  var menu = document.querySelector(".menu");
  var toggle = document.querySelector(".nav-toggle");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("show");
    });
  }

  // Click-to-open dropdowns (needed on touch devices, where :hover is unreliable)
  document.querySelectorAll(".menu > li > button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = btn.parentElement;
      var wasOpen = li.classList.contains("open");
      document.querySelectorAll(".menu > li.open").forEach(function (el) {
        el.classList.remove("open");
      });
      if (!wasOpen) li.classList.add("open");
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".menu > li.open").forEach(function (el) {
      el.classList.remove("open");
    });
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
