(() => {
  'use strict';
  const root = document.documentElement;
  const catalogs = window.PicviumLocales;
  if (!catalogs) return;
  root.classList.add('js-ready');
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
  const galleryPosition = document.querySelector('.gallery-position');
  const cards = [...document.querySelectorAll('.gallery-card')];
  const dialog = document.querySelector('#lightbox');
  const shots = [
    { src: 'assets/screens/viewer-photo.png', title: 'galleryPhoto', alt: 'altPhoto' },
    { src: 'assets/photos/yellow-rose.jpg', title: 'galleryArt', alt: 'altRose' },
    { src: 'assets/screens/toolbar.png', title: 'galleryToolbar', alt: 'altToolbar' },
    { src: 'assets/screens/settings.png', title: 'gallerySettings', alt: 'altSettings' },
    { src: 'assets/photos/white-curtains.jpg', title: 'galleryCurtains', alt: 'altCurtains' },
    { src: 'assets/screens/upscale.png', title: 'galleryAi', alt: 'altAi' },
    { src: 'assets/screens/batch.png', title: 'galleryBatch', alt: 'altBatch' }
  ];
  const text = key => catalogs[language][key];
  // Site motion is independent of the Windows animation preference, per product direction.
  const isStill = () => false;
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
    updateGalleryState();
    if (dialog.open) renderShot();
    menuToggle.setAttribute('aria-label', text(mobileNav.hidden ? 'openMenu' : 'closeMenu'));
    updateScroll();
  }
  function changeLanguage(locale) {
    if (!catalogs[locale] || locale === language) return;
    const update = () => applyLanguage(locale, true);
    if (document.startViewTransition && !isStill()) document.startViewTransition(update);
    else update();
  }
  select.addEventListener('change', () => changeLanguage(select.value));
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => changeLanguage(button.dataset.language)));
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
  mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });

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
  gallery.addEventListener('scroll', () => {
    const position = `${getCardIndex() + 1} / ${cards.length}`;
    if (galleryPosition.textContent !== position) galleryPosition.textContent = position;
  }, { passive: true });
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
  document.addEventListener('visibilitychange', scheduleGallery);

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
  const sections = [...document.querySelectorAll('#view, #edit, #screens, #languages')];
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const end = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--progress', end > 0 ? String(Math.max(0, Math.min(1, scrollY / end))) : '0');
    let active = null;
    for (const section of sections) { if (section.getBoundingClientRect().top <= 160) active = section.id; }
    if (document.querySelector('#project').getBoundingClientRect().top < 160) active = null;
    document.querySelectorAll('[data-section]').forEach(link => { if (link.dataset.section === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  window.addEventListener('resize', updateScroll);
  applyLanguage(language);
  galleryPosition.textContent = `1 / ${cards.length}`;
  if ('IntersectionObserver' in window && !isStill()) {
    root.classList.add('has-reveals');
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('reveal-wait'); reveals.unobserve(entry.target); } }), { threshold: .08, rootMargin: '0px 0px 30px' });
    document.querySelectorAll('[data-reveal]').forEach(element => { if (element.getBoundingClientRect().top > innerHeight) { element.classList.add('reveal-wait'); reveals.observe(element); } });
  }
})();
