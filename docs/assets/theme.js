/* Theme controls initialize independently of gallery, motion and dialog features. */
(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.querySelector('#theme-toggle');
  if (!button) return;
  const label = key => window.PicviumLocales?.[root.lang]?.[key] || window.PicviumLocales?.en?.[key] || (key === 'themeToLight' ? 'Switch to light theme' : 'Switch to dark theme');
  function updateLabel() {
    const dark = root.dataset.theme === 'dark';
    const key = dark ? 'themeToLight' : 'themeToDark';
    button.dataset.i18nAria = key;
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', label(key));
    button.title = label(key);
  }
  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-wordmark]').forEach(img => {
      img.src = `assets/brand/wordmark-${theme}.png`;
    });
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = theme === 'dark' ? '#0b0f14' : '#f5f7fa';
    updateLabel();
    if (persist) {
      try { localStorage.setItem('picvium.site.theme', theme); } catch { /* The current page still switches when storage is unavailable. */ }
    }
  }
  button.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  document.addEventListener('picvium:languagechange', updateLabel);
  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  button.hidden = false;
})();
