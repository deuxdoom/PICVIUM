(() => {
  'use strict';
  const root = document.documentElement;
  const catalogs = window.PicviumLocales;
  if (!catalogs) return;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private/file browsing is supported. */ } }
  };
  const chooseLocale = value => {
    if (catalogs[value]) return value;
    if (/^zh/i.test(value || '')) return /Hant|TW|HK|MO/i.test(value) ? 'zh-Hant' : 'zh-Hans';
    const primary = (value || '').split('-')[0];
    return catalogs[primary] ? primary : null;
  };
  const requested = new URLSearchParams(location.search).get('lang');
  let language = chooseLocale(requested) || chooseLocale(store.get('picvium.site.language')) || chooseLocale(navigator.language) || 'en';
  let galleryPaused = false;
  let shotIndex = 0;
  let lastFocus = null;
  const select = document.querySelector('#language');
  const menuToggle = document.querySelector('#menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const gallery = document.querySelector('.gallery-viewport');
  const galleryPause = document.querySelector('#gallery-pause');
  const motionToggle = document.querySelector('#motion-toggle');
  const galleryPosition = document.querySelector('.gallery-position');
  const cards = [...document.querySelectorAll('.gallery-card')];
  const dialog = document.querySelector('#lightbox');
  const shots = [
    { src: 'assets/screens/viewer-photo.png?v=20261018', title: 'galleryPhoto', alt: 'altPhoto' },
    { src: 'assets/screens/viewer-exif.png?v=20261018', title: 'galleryPhoto', alt: 'altExif' },
    { src: 'assets/screens/editor-levels.png?v=20261018', title: 'editorTabLevels', alt: 'altEditorLevels' },
    { src: 'assets/screens/editor-curve.png?v=20261018', title: 'editorTabCurve', alt: 'altEditorCurve' },
    { src: 'assets/screens/editor-mosaic.png?v=20261018', title: 'editorTabMosaic', alt: 'altEditorMosaic' },
    { src: 'assets/screens/editor-resize.png?v=20261018', title: 'editorTabResize', alt: 'altEditorResize' },
    { src: 'assets/screens/viewer-thumbnails.png?v=20261018', title: 'galleryFolder', alt: 'altThumbnails' },
    { src: 'assets/screens/toolbar.png?v=20261018', title: 'galleryToolbar', alt: 'altToolbar' },
    { src: 'assets/screens/settings.png?v=20261018', title: 'gallerySettings', alt: 'altSettings' },
    { src: 'assets/screens/upscale.png?v=20261018', title: 'galleryAi', alt: 'altAi' },
    { src: 'assets/screens/batch.png', title: 'galleryBatch', alt: 'altBatch' },
    { src: 'assets/screens/viewer-actual-size.png?v=20261018', title: 'galleryActualSize', alt: 'altActualSize' }
  ];
  const text = key => catalogs[language][key];
  // Site motion is independent of the Windows animation preference, per product direction.
  root.classList.toggle('motion-off', store.get('picvium.site.motion') === 'off');
  const isStill = () => root.classList.contains('motion-off');
  function updateMotionButton() {
    motionToggle.setAttribute('aria-pressed', String(isStill()));
    motionToggle.dataset.i18nAria = isStill() ? 'resumeMotion' : 'pauseMotion';
    motionToggle.setAttribute('aria-label', text(motionToggle.dataset.i18nAria));
    motionToggle.querySelector('[data-motion-label]').textContent = text(motionToggle.dataset.i18nAria);
  }
  function updateGalleryState() {
    galleryPause.setAttribute('aria-pressed', String(galleryPaused));
    galleryPause.firstElementChild.textContent = text(galleryPaused ? 'resumeGallery' : 'pauseGallery');
    scheduleGallery();
  }
  function renderShot() {
    const shot = shots[shotIndex];
    document.querySelector('#lightbox-title').textContent = text(shot.title);
    const image = document.querySelector('#lightbox-image');
    image.src = shot.src;
    image.alt = text(shot.alt);
    document.querySelector('#lightbox-position').textContent = `${shotIndex + 1} / ${shots.length}`;
  }
  function applyLanguage(locale, manual = false) {
    language = locale;
    root.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = text(element.dataset.i18n); });
    for (const attribute of ['aria', 'alt']) {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
        element.setAttribute(attribute === 'aria' ? 'aria-label' : 'alt', text(element.getAttribute(`data-i18n-${attribute}`)));
      });
    }
    document.title = text('pageTitle');
    document.querySelector('meta[name="description"]').content = text('pageDescription');
    document.querySelector('meta[property="og:title"]').content = text('pageTitle');
    document.querySelector('meta[property="og:description"]').content = text('pageDescription');
    select.value = locale;
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === locale)));
    const nativeName = select.selectedOptions[0].textContent;
    document.querySelector('#language-announcement').textContent = manual ? `${text('languageChanged')} ${nativeName}` : '';
    store.set('picvium.site.language', locale);
    updateMotionButton();
    document.dispatchEvent(new Event('picvium:languagechange'));
    document.querySelector('#copy-status').textContent = '';
    updateGalleryState();
    if (dialog.open) renderShot();
    menuToggle.setAttribute('aria-label', text(mobileNav.hidden ? 'openMenu' : 'closeMenu'));
    updateScroll();
  }
  function changeLanguage(locale) {
    if (!catalogs[locale] || locale === language) return;
    applyLanguage(locale, true);
  }
  select.addEventListener('change', () => changeLanguage(select.value));
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => changeLanguage(button.dataset.language)));
  motionToggle.hidden = false;
  motionToggle.addEventListener('click', () => {
    root.classList.toggle('motion-off');
    store.set('picvium.site.motion', isStill() ? 'off' : 'on');
    updateMotionButton();
    resetStage();
    scheduleGallery();
  });
  menuToggle.hidden = false;
  function closeMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', text('openMenu'));
  }
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', text(open ? 'closeMenu' : 'openMenu'));
  });
  // Collapse navigation only after the mobile controls have working handlers.
  root.classList.add('js-ready');
  mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });

  // Editor screens: one actual capture per tool, as an ARIA tab set. Without scripts every capture stays visible.
  const editorTabs = [...document.querySelectorAll('[data-editor-tab]')];
  const editorPanels = editorTabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const editorGroups = [...document.querySelectorAll('[data-editor-group]')];
  function selectEditorTab(index, focus = false) {
    editorTabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      editorPanels[i].hidden = !selected;
    });
    editorGroups.forEach(group => group.classList.toggle('is-active', group.dataset.editorGroup === editorTabs[index].dataset.group));
    if (focus) editorTabs[index].focus();
  }
  // Fetch the other captures once the visitor reaches for the tabs, so switching does not wait on a cold download.
  const warmEditorPanels = () => editorPanels.forEach(panel => panel.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager'; }));
  editorTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectEditorTab(i));
    tab.addEventListener('pointerenter', warmEditorPanels, { once: true });
    tab.addEventListener('focus', warmEditorPanels, { once: true });
    tab.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (step) { event.preventDefault(); selectEditorTab((i + step + editorTabs.length) % editorTabs.length, true); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); selectEditorTab(event.key === 'Home' ? 0 : editorTabs.length - 1, true); }
    });
  });
  if (editorTabs.length) selectEditorTab(0);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.addEventListener('resize', () => { if (innerWidth > 1190) closeMenu(); });

  let galleryVisible = false;
  let galleryHover = false;
  let galleryFocus = false;
  let galleryDragging = false;
  let galleryDirection = 1;
  let galleryFrame = 0;
  let lastTime = 0;
  let galleryOffset = null;
  function shouldAutoScroll() {
    return galleryVisible && !document.hidden && !isStill() && !galleryPaused && !galleryHover && !galleryFocus && !galleryDragging && !dialog.open;
  }
  function galleryTick(time) {
    galleryFrame = 0;
    if (!shouldAutoScroll()) { lastTime = 0; galleryOffset = null; return; }
    const delta = lastTime ? Math.min(time - lastTime, 48) : 0;
    lastTime = time;
    const end = gallery.scrollWidth - gallery.clientWidth;
    if (end > 0) {
      if (galleryOffset === null) galleryOffset = gallery.scrollLeft;
      // Accumulate fractional pixels: high-refresh displays otherwise round every frame to zero.
      galleryOffset = Math.min(end, Math.max(0, galleryOffset + delta * .026 * galleryDirection));
      gallery.scrollLeft = galleryOffset;
      if (galleryOffset >= end) galleryDirection = -1;
      if (galleryOffset <= 0) galleryDirection = 1;
    }
    galleryFrame = requestAnimationFrame(galleryTick);
  }
  function scheduleGallery() {
    if (shouldAutoScroll() && !galleryFrame) galleryFrame = requestAnimationFrame(galleryTick);
    if (!shouldAutoScroll() && galleryFrame) { cancelAnimationFrame(galleryFrame); galleryFrame = 0; lastTime = 0; galleryOffset = null; }
  }
  if ('IntersectionObserver' in window) {
    const galleryObserver = new IntersectionObserver(entries => { galleryVisible = entries[0].isIntersecting; scheduleGallery(); }, { threshold: .15 });
    galleryObserver.observe(gallery);
  } else galleryVisible = true;
  gallery.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { galleryHover = true; scheduleGallery(); } });
  gallery.addEventListener('pointerleave', () => { galleryHover = false; scheduleGallery(); });
  gallery.addEventListener('focusin', () => { galleryFocus = true; scheduleGallery(); });
  gallery.addEventListener('focusout', event => { if (!gallery.contains(event.relatedTarget)) { galleryFocus = false; scheduleGallery(); } });
  gallery.addEventListener('wheel', () => { galleryPaused = true; updateGalleryState(); }, { passive: true });
  gallery.addEventListener('touchstart', () => { galleryPaused = true; updateGalleryState(); }, { passive: true });
  let pointerStart = null;
  let suppressClick = false;
  gallery.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pointerStart = { x: event.clientX, scroll: gallery.scrollLeft, id: event.pointerId };
    suppressClick = false;
  });
  gallery.addEventListener('pointermove', event => {
    if (!pointerStart) return;
    const distance = event.clientX - pointerStart.x;
    if (Math.abs(distance) > 8 && !galleryDragging) {
      galleryDragging = true;
      galleryPaused = true;
      suppressClick = true;
      gallery.setPointerCapture(pointerStart.id);
      updateGalleryState();
    }
    if (galleryDragging) { event.preventDefault(); gallery.scrollLeft = pointerStart.scroll - distance; }
  });
  function endDrag() { pointerStart = null; galleryDragging = false; scheduleGallery(); }
  gallery.addEventListener('pointerup', endDrag);
  gallery.addEventListener('pointercancel', endDrag);
  gallery.addEventListener('lostpointercapture', endDrag);
  gallery.addEventListener('dragstart', event => event.preventDefault());
  gallery.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; } }, true);
  galleryPause.hidden = false;
  galleryPause.addEventListener('click', () => { galleryPaused = !galleryPaused; updateGalleryState(); });
  const getCardIndex = () => {
    const center = gallery.scrollLeft + gallery.clientWidth / 2;
    let index = 0;
    let distance = Infinity;
    cards.forEach((card, i) => { const candidate = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center); if (candidate < distance) { index = i; distance = candidate; } });
    return index;
  };
  function updateGalleryPosition() {
    const position = `${getCardIndex() + 1} / ${cards.length}`;
    if (galleryPosition.textContent !== position) galleryPosition.textContent = position;
  }
  gallery.addEventListener('scroll', updateGalleryPosition, { passive: true });
  window.addEventListener('resize', updateGalleryPosition);
  function moveGallery(direction) {
    galleryPaused = true;
    updateGalleryState();
    const target = cards[Math.max(0, Math.min(cards.length - 1, getCardIndex() + direction))];
    gallery.scrollTo({ left: target.offsetLeft - (gallery.clientWidth - target.offsetWidth) / 2, behavior: isStill() ? 'instant' : 'smooth' });
  }
  for (const [id, direction] of [['gallery-prev', -1], ['gallery-next', 1]]) {
    const button = document.getElementById(id);
    button.hidden = false;
    button.addEventListener('click', () => moveGallery(direction));
  }
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1); }
  });
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('page-hidden', document.hidden);
    if (document.hidden) resetStage();
    scheduleGallery();
  });

  // A small, bounded perspective response leaves the original capture unchanged.
  const stage = document.querySelector('.hero-stage');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)');
  let stageFrame = 0;
  let stagePoint = { x: 0, y: 0 };
  function resetStage() {
    if (stageFrame) cancelAnimationFrame(stageFrame);
    stageFrame = 0;
    stage.style.setProperty('--pointer-x', '0');
    stage.style.setProperty('--pointer-y', '0');
  }
  stage.addEventListener('pointermove', event => {
    if (!finePointer.matches || isStill() || document.hidden || event.pointerType !== 'mouse') return;
    const bounds = stage.getBoundingClientRect();
    stagePoint = {
      x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
    };
    if (!stageFrame) stageFrame = requestAnimationFrame(() => {
      stageFrame = 0;
      stage.style.setProperty('--pointer-x', stagePoint.x.toFixed(3));
      stage.style.setProperty('--pointer-y', stagePoint.y.toFixed(3));
    });
  });
  stage.addEventListener('pointerleave', resetStage);
  if (finePointer.addEventListener) finePointer.addEventListener('change', resetStage);
  else if (finePointer.addListener) finePointer.addListener(resetStage);

  const copyButton = document.querySelector('#copy-sha');
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      copyButton.disabled = true;
      try {
        await navigator.clipboard.writeText(document.querySelector('#download-sha').textContent.trim());
        document.querySelector('#copy-status').textContent = text('hashCopied');
      } catch {
        document.querySelector('#copy-status').textContent = text('hashCopyFailed');
      } finally { copyButton.disabled = false; }
    });
  }

  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-shot]').forEach(link => link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      shotIndex = Number(link.dataset.shot);
      lastFocus = link;
      renderShot();
      dialog.showModal();
      document.body.classList.add('dialog-open');
      document.querySelector('#lightbox-close').focus();
      scheduleGallery();
    }));
    document.querySelector('#lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (lastFocus) lastFocus.focus({ preventScroll: true }); scheduleGallery(); });
    const moveShot = direction => { shotIndex = (shotIndex + direction + shots.length) % shots.length; renderShot(); };
    document.querySelector('#lightbox-prev').addEventListener('click', () => moveShot(-1));
    document.querySelector('#lightbox-next').addEventListener('click', () => moveShot(1));
    dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); moveShot(event.key === 'ArrowRight' ? 1 : -1); } });
  }
  const sections = [...document.querySelectorAll('#view, #edit, #screens, #languages, #project')];
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    root.classList.toggle('is-scrolled', scrollY > 20);
    const end = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--progress', end > 0 ? String(Math.max(0, Math.min(1, scrollY / end))) : '0');
    let active = null;
    for (const section of sections) { if (section.getBoundingClientRect().top <= 160) active = section.id; }
    document.querySelectorAll('[data-section]').forEach(link => { if (link.dataset.section === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  window.addEventListener('resize', updateScroll);
  applyLanguage(language);
  updateGalleryPosition();
  if ('IntersectionObserver' in window && !isStill()) {
    root.classList.add('has-reveals');
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('reveal-wait'); reveals.unobserve(entry.target); } }), { threshold: .08, rootMargin: '0px 0px 30px' });
    document.querySelectorAll('[data-reveal]').forEach(element => { if (element.getBoundingClientRect().top > innerHeight) { element.classList.add('reveal-wait'); reveals.observe(element); } });
  }
})();
