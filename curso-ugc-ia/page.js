(() => {
  'use strict';
  const config = window.UGC_COURSE || {};
  // Fixed white canvas and dark panels are the owner's chosen art direction.
  const dialog = document.getElementById('video-dialog');
  const player = document.getElementById('active-video');
  const error = document.getElementById('video-error');
  const videos = new Map(['ugc-1', 'ugc-2', 'ugc-3', 'ugc-5', 'ugc-6', 'ugc-7'].map(id => [id, '/curso-ugc-ia/assets/videos/' + id + '.mp4']));
  const gallery = document.getElementById('course-gallery');
  const galleryFilters = document.querySelector('.gallery-filters');
  const galleryEmpty = document.querySelector('.gallery-empty');
  const galleryNavigation = document.querySelector('.gallery-navigation');
  const galleryControls = document.querySelector('.gallery-controls');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  // Categorias sem vídeo não viram aba; com uma só categoria, o seletor fica oculto.
  const galleryCategories = (config.galleryCategories || []).filter(category => category.videos.length);
  if (galleryCategories.length) {
    gallery.replaceChildren();
    galleryFilters.hidden = galleryCategories.length < 2;
    galleryCategories.forEach((category, categoryIndex) => {
      const filter = document.createElement('button');
      filter.type = 'button';
      filter.textContent = category.label;
      filter.dataset.category = category.id;
      filter.setAttribute('aria-pressed', String(categoryIndex === 0));
      filter.setAttribute('aria-controls', 'course-gallery');
      galleryFilters.append(filter);
      category.videos.forEach(video => {
        videos.set(video.id, video.src);
        const figure = document.createElement('figure');
        figure.dataset.category = category.id;
        figure.hidden = categoryIndex !== 0;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'video-card';
        button.dataset.video = video.id;
        button.dataset.title = video.title;
        button.setAttribute('aria-label', 'Assistir: ' + video.title);
        const poster = document.createElement('img');
        poster.src = video.poster;
        poster.alt = video.alt || video.title;
        poster.loading = 'lazy';
        const play = document.createElement('span');
        play.className = 'play';
        play.setAttribute('aria-hidden', 'true');
        play.textContent = '▶';
        const caption = document.createElement('figcaption');
        caption.textContent = video.caption || video.title;
        button.append(poster, play);
        figure.append(button, caption);
        gallery.append(figure);
      });
    });
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const eyebrowRotator = document.querySelector('.eyebrow-rotator');
  let eyebrowVisible = true;
  function syncEyebrow() {
    eyebrowRotator.classList.toggle('is-rotating', !reducedMotion.matches);
    eyebrowRotator.classList.toggle('is-paused', !eyebrowVisible || document.hidden || dialog.open);
  }
  if ('IntersectionObserver' in window) {
    const eyebrowObserver = new IntersectionObserver(entries => {
      eyebrowVisible = entries[0].isIntersecting;
      syncEyebrow();
    });
    eyebrowObserver.observe(eyebrowRotator);
  }
  reducedMotion.addEventListener('change', syncEyebrow);
  document.addEventListener('visibilitychange', syncEyebrow);
  dialog.addEventListener('close', syncEyebrow);
  syncEyebrow();
  let previewsPaused = reducedMotion.matches;
  const previews = [...document.querySelectorAll('.video-gallery .video-card[data-video]')].map(button => {
    const preview = document.createElement('video');
    preview.className = 'video-preview';
    preview.muted = true;
    preview.defaultMuted = true;
    preview.loop = true;
    preview.playsInline = true;
    preview.preload = 'none';
    preview.poster = button.querySelector('img').src;
    preview.setAttribute('aria-hidden', 'true');
    preview.tabIndex = -1;
    button.append(preview);
    preview.addEventListener('playing', () => button.classList.add('preview-ready'));
    preview.addEventListener('error', () => button.classList.remove('preview-ready'));
    return { button, preview, visible: false };
  });
  function canPreview(item) {
    return item.visible && !item.button.closest('figure').hidden && !previewsPaused && !document.hidden && !dialog.open;
  }
  function syncPreview(item) {
    if (!canPreview(item)) {
      item.preview.pause();
      return;
    }
    if (!item.preview.hasAttribute('src')) {
      item.preview.src = videos.get(item.button.dataset.video);
    }
    if (item.preview.paused) item.preview.play().then(() => {
      // A pending play may finish after scrolling away or opening the full player.
      if (!canPreview(item)) item.preview.pause();
    }).catch(() => {
      // Keep the poster and click-to-play when the browser blocks autoplay.
    });
  }
  function syncPreviews() { previews.forEach(syncPreview); }
  reducedMotion.addEventListener('change', event => {
    previewsPaused = event.matches;
    syncPreviews();
  });
  if ('IntersectionObserver' in window) {
    const previewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const item = previews.find(item => item.button === entry.target);
        item.visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncPreview(item);
      });
    }, { threshold: [0, 0.15] });
    previews.forEach(item => previewObserver.observe(item.button));
  } else {
    previews.forEach(item => { item.visible = true; });
    syncPreviews();
  }
  document.addEventListener('visibilitychange', syncPreviews);
  window.addEventListener('pagehide', () => previews.forEach(item => item.preview.pause()));
  window.addEventListener('pageshow', syncPreviews);
  function updateGalleryNavigation() {
    const max = gallery.scrollWidth - gallery.clientWidth;
    galleryNavigation.hidden = gallery.hidden || max <= 2;
    galleryPrev.disabled = gallery.scrollLeft <= 2;
    galleryNext.disabled = gallery.scrollLeft >= max - 2;
  }
  function selectGalleryCategory(category) {
    galleryFilters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category.id)));
    [...gallery.children].forEach(figure => { figure.hidden = figure.dataset.category !== category.id; });
    gallery.hidden = category.videos.length === 0;
    galleryEmpty.hidden = !gallery.hidden;
    galleryControls.hidden = gallery.hidden;
    document.getElementById('gallery-empty-title').textContent = category.label;
    gallery.setAttribute('aria-label', 'Galeria de vídeos: ' + category.label);
    gallery.scrollTo({ left: 0, behavior: 'instant' });
    syncPreviews();
    updateGalleryNavigation();
  }
  galleryFilters.addEventListener('click', event => {
    const category = galleryCategories.find(category => category.id === event.target.dataset.category);
    if (category) selectGalleryCategory(category);
  });
  function moveGallery(direction) {
    const styles = getComputedStyle(gallery);
    const distance = gallery.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    gallery.scrollBy({ left: direction * distance, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  galleryPrev.addEventListener('click', () => moveGallery(-1));
  galleryNext.addEventListener('click', () => moveGallery(1));
  gallery.addEventListener('scroll', updateGalleryNavigation, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateGalleryNavigation).observe(gallery);
  else window.addEventListener('resize', updateGalleryNavigation);
  updateGalleryNavigation();
  let opener;
  let playbackId = 0;
  function openVideo(url, title, button) {
    opener = button;
    const currentPlayback = ++playbackId;
    error.hidden = true;
    document.getElementById('video-title').textContent = title;
    player.src = url;
    player.muted = false;
    player.volume = 1;
    dialog.showModal();
    syncEyebrow();
    syncPreviews();
    document.body.classList.add('modal-open');
    player.play().catch(() => {
      // A delayed rejection from a closed video must not affect the next video.
      if (currentPlayback === playbackId && dialog.open && player.error) error.hidden = false;
    });
  }
  document.querySelectorAll('[data-video]').forEach(button => {
    button.addEventListener('click', () => {
      if (!videos.has(button.dataset.video)) return;
      openVideo(videos.get(button.dataset.video), button.dataset.title, button);
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    playbackId++;
    player.pause();
    player.removeAttribute('src');
    player.load();
    document.body.classList.remove('modal-open');
    if (opener) opener.focus({ preventScroll: true });
    syncPreviews();
  });
  player.addEventListener('error', () => { if (dialog.open) error.hidden = false; });

  const learningVideo = document.getElementById('learning-video');
  const learningImage = document.getElementById('learning-image');
  const learningOpen = document.getElementById('learning-open');
  const learningButtons = [...document.querySelectorAll('[data-learning]')];
  const learningPreview = document.getElementById('learning-preview');
  const learningGrid = document.querySelector('.learning-grid');
  const learningMobile = window.matchMedia('(max-width: 767px)');
  let learningSelected = learningButtons[0];
  let learningExpanded = true;
  function positionLearning() {
    learningButtons.forEach(button => {
      const active = button === learningSelected && (!learningMobile.matches || learningExpanded);
      button.parentElement.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      if (learningMobile.matches) button.setAttribute('aria-expanded', String(active));
      else button.removeAttribute('aria-expanded');
    });
    learningPreview.hidden = learningMobile.matches && !learningExpanded;
    const parent = learningMobile.matches ? learningSelected.parentElement : learningGrid;
    if (learningPreview.parentElement !== parent) {
      if (learningMobile.matches) parent.append(learningPreview);
      else parent.prepend(learningPreview);
    }
  }
  let learningVisible = false;
  let learningAsset;
  function syncLearning() {
    if (!learningAsset || learningAsset.type !== 'video' || !learningVisible || learningPreview.hidden || document.hidden || dialog.open || reducedMotion.matches) {
      learningVideo.pause();
      return;
    }
    if (learningVideo.getAttribute('src') !== learningAsset.src) learningVideo.src = learningAsset.src;
    learningVideo.play().catch(() => {});
  }
  function selectLearning(button) {
    const asset = config.learningMedia?.[button.dataset.learning];
    if (!asset) return;
    learningVideo.pause();
    learningVideo.removeAttribute('src');
    learningVideo.load();
    learningAsset = asset;
    learningSelected = button;
    learningExpanded = true;
    positionLearning();
    learningButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('learning-title').textContent = button.querySelector('strong').textContent;
    document.getElementById('learning-description').textContent = button.querySelector('span').textContent;
    const isImage = asset.type === 'image';
    learningVideo.hidden = isImage;
    learningImage.hidden = !isImage;
    learningOpen.hidden = isImage;
    if (isImage) { learningImage.src = asset.src; learningImage.alt = asset.alt || button.querySelector('strong').textContent; }
    else learningVideo.poster = asset.poster || '';
    (isImage ? learningImage : learningVideo).style.objectPosition = asset.position || '';
    syncLearning();
  }
  learningButtons.forEach(button => button.addEventListener('click', () => {
    if (learningMobile.matches && button === learningSelected && learningExpanded) {
      learningExpanded = false;
      positionLearning();
      syncLearning();
      return;
    }
    selectLearning(button);
    if (learningMobile.matches) button.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  learningMobile.addEventListener('change', () => { positionLearning(); syncLearning(); });
  learningOpen.addEventListener('click', () => {
    if (learningAsset?.type !== 'video') return;
    learningVideo.pause();
    openVideo(learningAsset.src, document.getElementById('learning-title').textContent, learningOpen);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { learningVisible = entries[0].isIntersecting; syncLearning(); }).observe(learningVideo.parentElement);
  } else learningVisible = true;
  document.addEventListener('visibilitychange', syncLearning);
  reducedMotion.addEventListener('change', syncLearning);
  dialog.addEventListener('close', syncLearning);
  dialog.addEventListener('toggle', syncLearning);
  window.addEventListener('pagehide', () => learningVideo.pause());
  window.addEventListener('pageshow', syncLearning);
  selectLearning(learningButtons[0]);

  // Cycle illustrative notifications only while this section is visible.
  const notificationStack = document.querySelector('.income-notifications');
  const notifications = [...notificationStack.children];
  let notificationOrder = [...notifications];
  let notificationsVisible = false;
  let notificationTimer;
  function sizeNotifications() {
    const height = Math.max(...notifications.map(item => item.offsetHeight));
    notificationStack.style.setProperty('--notice-height', height + 'px');
  }
  function placeNotifications() {
    notificationOrder.forEach((item, index) => {
      item.dataset.slot = String(index);
      item.style.setProperty('--notice-slot', index);
      item.querySelector('.income-meta span:last-child').textContent = ['agora', 'há 1 min', 'há 5 min'][index];
    });
  }
  function nextNotification() {
    notifications.forEach(item => item.classList.remove('is-arriving'));
    const arriving = notificationOrder.pop();
    notificationOrder.unshift(arriving);
    placeNotifications();
    arriving.classList.add('is-arriving');
  }
  function syncNotifications() {
    clearInterval(notificationTimer);
    notificationStack.classList.toggle('is-stacked', !reducedMotion.matches);
    if (reducedMotion.matches) {
      notifications.forEach(item => item.classList.remove('is-arriving'));
      return;
    }
    sizeNotifications();
    if (notificationsVisible && !document.hidden && !dialog.open) notificationTimer = setInterval(nextNotification, 5200);
  }
  reducedMotion.addEventListener('change', syncNotifications);
  document.addEventListener('visibilitychange', syncNotifications);
  dialog.addEventListener('toggle', syncNotifications);
  window.addEventListener('pagehide', () => clearInterval(notificationTimer));
  window.addEventListener('pageshow', syncNotifications);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    notificationsVisible = entries[0].isIntersecting;
    syncNotifications();
  }, { threshold: 0.2 }).observe(notificationStack);
  else notificationsVisible = true;
  if ('ResizeObserver' in window) {
    const notificationResize = new ResizeObserver(sizeNotifications);
    notifications.forEach(item => notificationResize.observe(item));
  } else window.addEventListener('resize', sizeNotifications);
  placeNotifications();
  syncNotifications();

  // Content stays visible without JavaScript, in reduced motion and on mobile.
  if ('IntersectionObserver' in window && window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('js-reveal');
      observer.observe(element);
    });
  }

  // Offer values are supplied by the owner, not inferred from software pricing.
  if (typeof config.name === 'string' && config.name.trim()) {
    document.querySelectorAll('[data-course-name]').forEach(element => { element.textContent = config.name; });
    document.title = config.name + ' | Aprenda a criar vídeos com IA';
  }
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
  if (positive(config.cashPrice)) {
    const price = document.getElementById('price-block');
    price.replaceChildren();
    const amount = document.createElement('p');
    amount.className = 'price-value';
    const installment = positive(config.installmentPrice) && Number.isInteger(config.installments) && config.installments > 1;
    if (installment) {
      const prefix = document.createElement('small');
      prefix.textContent = config.installments + 'x de ';
      amount.append(prefix, document.createTextNode(money.format(config.installmentPrice)));
    } else amount.textContent = money.format(config.cashPrice);
    const terms = document.createElement('p');
    terms.textContent = installment ? 'ou ' + money.format(config.cashPrice) + ' à vista.' : 'Pagamento à vista.';
    price.append(amount, terms);
  }
  if (typeof config.accessPeriod === 'string' && config.accessPeriod.trim()) {
    const access = document.getElementById('access-period');
    access.textContent = config.accessPeriod;
    access.hidden = false;
  }
  if (Array.isArray(config.extraBenefits)) config.extraBenefits.forEach(benefit => {
    if (!benefit || typeof benefit.title !== 'string' || !benefit.title.trim()) return;
    const item = document.createElement('li');
    item.textContent = benefit.title;
    const list = document.getElementById('offer-extras');
    list.append(item);
    list.hidden = false;
    const article = document.createElement('article');
    const icon = document.createElement('span');
    icon.textContent = '↗';
    icon.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = benefit.title;
    const description = document.createElement('p');
    description.textContent = typeof benefit.description === 'string' ? benefit.description : '';
    copy.append(title, description);
    article.append(icon, copy);
    document.getElementById('extra-benefits').append(article);
  });
  function httpsUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try { const url = new URL(value); return url.protocol === 'https:' ? url : null; } catch (_) { return null; }
  }
  const checkout = httpsUrl(config.checkoutUrl);
  const ready = checkout && positive(config.cashPrice) && config.name;
  if (ready) {
    const button = document.getElementById('checkout-button');
    button.disabled = false;
    button.replaceChildren(document.createTextNode('Quero aprender a criar com IA ↗'));
    document.getElementById('checkout-note').textContent = 'Você será direcionado ao checkout seguro do curso.';
    const source = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(key => {
      if (source.has(key) && !checkout.searchParams.has(key)) checkout.searchParams.set(key, source.get(key));
    });
    button.addEventListener('click', () => { window.location.assign(checkout.href); });
  }
  const demo = httpsUrl(config.demoVideoUrl);
  const demoSlot = document.getElementById('demo-slot');
  if (demo) {
    demoSlot.hidden = false;
    const button = document.createElement('button');
    button.className = 'button button-small';
    button.type = 'button';
    button.textContent = 'Assistir ao processo ▶';
    button.addEventListener('click', () => openVideo(demo.href, 'Do produto ao criativo', button));
    demoSlot.append(button);
  }
})();
