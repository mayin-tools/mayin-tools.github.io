const analyticsConsentKey = 'mayin-analytics-consent-v1';
const consentBanner = document.querySelector('[data-consent-banner]');
const consentManageButtons = [...document.querySelectorAll('[data-consent-manage]')];
let analyticsLoaded = false;

function storageGet(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

function setAnalyticsDisabled(disabled) {
  if (!consentBanner) return;
  const gaId = consentBanner.dataset.gaId;
  if (gaId) window[`ga-disable-${gaId}`] = Boolean(disabled);
}

function clearAnalyticsCookies() {
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0].trim();
    if (!name.startsWith('_ga')) return;
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  });
}

function initAnalytics() {
  if (!consentBanner) return;
  const gaId = consentBanner.dataset.gaId;
  if (!gaId) return;
  setAnalyticsDisabled(false);
  if (analyticsLoaded) return;

  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);
}

function saveAnalyticsChoice(value) {
  storageSet(analyticsConsentKey, value);
  if (value === 'granted') {
    setAnalyticsDisabled(false);
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'granted' });
    initAnalytics();
    setTimeout(trackVisiblePromos, 0);
  } else {
    setAnalyticsDisabled(true);
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
  }
  if (consentBanner) consentBanner.hidden = true;
}

function openAnalyticsSettings() {
  if (!consentBanner) return;
  const current = storageGet(analyticsConsentKey);
  const message = consentBanner.querySelector('p');
  if (message) {
    message.textContent = current === 'granted'
      ? '访问统计当前已启用。你可以继续启用，或选择“暂不启用”停止后续统计；选择会保存在本机浏览器。'
      : '同意后才会加载 Google Analytics，用于了解网站访问情况和常用功能的使用情况。不同意不影响工具搜索和浏览。';
  }
  consentBanner.hidden = false;
  requestAnimationFrame(() => consentBanner.querySelector('[data-consent-accept]')?.focus());
}

if (consentBanner) {
  const choice = storageGet(analyticsConsentKey);
  if (choice === 'granted') {
    setAnalyticsDisabled(false);
    initAnalytics();
  } else if (choice === 'denied') {
    setAnalyticsDisabled(true);
  } else {
    consentBanner.hidden = false;
  }
  consentBanner.querySelector('[data-consent-accept]')?.addEventListener('click', () => saveAnalyticsChoice('granted'));
  consentBanner.querySelector('[data-consent-reject]')?.addEventListener('click', () => saveAnalyticsChoice('denied'));
}
consentManageButtons.forEach((button) => button.addEventListener('click', openAnalyticsSettings));

const searchInput = document.querySelector('[data-search-input]');
const searchPanel = document.querySelector('[data-search-results]');
const searchList = document.querySelector('[data-search-list]');
const searchStatus = document.querySelector('[data-search-status]');
const searchClear = document.querySelector('[data-search-clear]');
let searchIndex = null;
let searchTimer = null;
let activeSearchIndex = -1;

async function ensureSearchIndex() {
  if (searchIndex) return searchIndex;
  const response = await fetch('/assets/search-index.json', { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
  searchIndex = await response.json();
  return searchIndex;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function normalizeSearch(value) {
  return String(value)
    .toLocaleLowerCase('zh-CN')
    .replace(/[，。、“”‘’：；（）()\[\]{}·/_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreSearchItem(item, query) {
  const haystack = normalizeSearch(item.searchText || `${item.name} ${item.category} ${item.summary}`);
  const name = normalizeSearch(item.name);
  const tokens = query.split(' ').filter(Boolean);
  if (!tokens.length || !tokens.every((token) => haystack.includes(token))) return -1;

  let score = 0;
  if (name === query) score += 100;
  else if (name.startsWith(query)) score += 60;
  else if (name.includes(query)) score += 40;
  if (haystack.includes(query)) score += 24;
  score += tokens.reduce((sum, token) => sum + (name.includes(token) ? 8 : 2), 0);
  return score;
}

function updateSearchActiveItem(index) {
  const links = [...searchList.querySelectorAll('a')];
  if (!links.length || !searchInput) return;
  activeSearchIndex = (index + links.length) % links.length;
  links.forEach((link, i) => {
    const id = link.id || `search-option-${i}`;
    link.id = id;
    link.setAttribute('aria-selected', String(i === activeSearchIndex));
  });
  searchInput.setAttribute('aria-activedescendant', links[activeSearchIndex].id);
  links[activeSearchIndex].scrollIntoView({ block: 'nearest' });
}

async function runSearch(value) {
  const query = normalizeSearch(value);
  if (searchClear) searchClear.hidden = !query;
  if (!query) {
    if (searchPanel) searchPanel.hidden = true;
    if (searchList) searchList.innerHTML = '';
    activeSearchIndex = -1;
    searchInput?.removeAttribute('aria-activedescendant');
    searchInput?.setAttribute('aria-expanded', 'false');
    return;
  }

  try {
    const data = await ensureSearchIndex();
    const matches = data
      .map((item) => ({ item, score: scoreSearchItem(item, query) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'zh-CN'))
      .slice(0, 12)
      .map(({ item }) => item);

    searchStatus.textContent = matches.length ? `找到 ${matches.length} 个相关入口` : '没有找到相关工具，可以换个关键词或浏览分类。';
    searchList.innerHTML = matches.map((item) => `<li><a href="${item.url}" role="option" aria-selected="false"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)} · ${escapeHtml(item.summary)}</small></a></li>`).join('');
    searchPanel.hidden = false;
    searchInput?.setAttribute('aria-expanded', 'true');
    activeSearchIndex = -1;
    searchInput?.removeAttribute('aria-activedescendant');
  } catch {
    searchStatus.textContent = '搜索暂时不可用，请直接浏览下面的工具分类。';
    searchList.innerHTML = '';
    searchPanel.hidden = false;
    searchInput?.setAttribute('aria-expanded', 'true');
  }
}

if (searchInput) {
  searchInput.setAttribute('role', 'combobox');
  searchInput.setAttribute('aria-autocomplete', 'list');
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.setAttribute('aria-controls', 'site-search-results');
  if (searchPanel) searchPanel.id = 'site-search-results';
  if (searchList) searchList.setAttribute('role', 'listbox');

  searchInput.addEventListener('focus', () => { ensureSearchIndex().catch(() => {}); }, { once: true });
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(searchInput.value), 120);
  });
  searchInput.addEventListener('keydown', (event) => {
    if (searchPanel?.hidden) return;
    const links = [...searchList.querySelectorAll('a')];
    if (!links.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      updateSearchActiveItem(activeSearchIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      updateSearchActiveItem(activeSearchIndex - 1);
    } else if (event.key === 'Enter' && activeSearchIndex >= 0) {
      event.preventDefault();
      links[activeSearchIndex].click();
    } else if (event.key === 'Escape') {
      searchPanel.hidden = true;
      activeSearchIndex = -1;
      searchInput.removeAttribute('aria-activedescendant');
      searchInput.setAttribute('aria-expanded', 'false');
    }
  });
  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    runSearch('');
    searchInput.focus();
  });
  document.querySelectorAll('[data-search-suggest]').forEach((button) => {
    button.addEventListener('click', () => {
      searchInput.value = button.dataset.searchSuggest || button.textContent.trim();
      runSearch(searchInput.value);
      searchInput.focus();
    });
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-shell') && !event.target.closest('.search-shortcuts') && searchPanel) {
      searchPanel.hidden = true;
      activeSearchIndex = -1;
      searchInput.removeAttribute('aria-activedescendant');
      searchInput.setAttribute('aria-expanded', 'false');
    }
  });
}

const menuButton = document.querySelector('[data-menu-button]');
const mainNav = document.querySelector('[data-main-nav]');
function closeMainNav() {
  if (!mainNav || mainNav.dataset.open !== 'true') return;
  mainNav.dataset.open = 'false';
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const open = mainNav.dataset.open !== 'true';
  mainNav.dataset.open = String(open);
  menuButton.setAttribute('aria-expanded', String(open));
});
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMainNav));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mainNav?.dataset.open === 'true') {
    closeMainNav();
    menuButton?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (mainNav?.dataset.open !== 'true') return;
  if (event.target.closest('[data-main-nav]') || event.target.closest('[data-menu-button]')) return;
  closeMainNav();
});

const favoriteKey = 'mayin-favorites-v1';
const readFavorites = () => {
  try {
    const value = JSON.parse(storageGet(favoriteKey, '[]'));
    return Array.isArray(value) ? value : [];
  } catch { return []; }
};
const saveFavorites = (items) => storageSet(favoriteKey, JSON.stringify(items));

function sendEvent(name, params) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

function syncFavoriteButtons() {
  const favorites = new Set(readFavorites());
  document.querySelectorAll('[data-favorite-id]').forEach((button) => {
    const active = favorites.has(button.dataset.favoriteId);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '★ 已收藏' : '☆ 收藏';
  });
}

document.querySelectorAll('[data-favorite-id]').forEach((button) => {
  button.addEventListener('click', () => {
    const favorites = new Set(readFavorites());
    const id = button.dataset.favoriteId;
    const action = favorites.has(id) ? 'remove' : 'add';
    if (action === 'remove') favorites.delete(id); else favorites.add(id);
    saveFavorites([...favorites]);
    syncFavoriteButtons();
    sendEvent('favorite_toggle', { tool_id: id, action });
  });
});

const drawer = document.querySelector('[data-favorite-drawer]');
const drawerList = document.querySelector('[data-favorite-list]');
const drawerOpen = document.querySelector('[data-favorite-open]');
const drawerClose = document.querySelectorAll('[data-favorite-close]');
let drawerReturnFocus = null;

async function openFavorites() {
  drawerReturnFocus = document.activeElement;
  const favorites = new Set(readFavorites());
  try {
    const data = await ensureSearchIndex();
    const items = data.filter((item) => favorites.has(item.id));
    drawerList.innerHTML = items.length ? items.map((item) => `<li><a href="${item.url}"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)}</small></a></li>`).join('') : '<li>还没有收藏工具。</li>';
  } catch {
    drawerList.innerHTML = '<li>收藏列表暂时无法读取。</li>';
  }
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  drawer.querySelector('.drawer-panel').focus();
}

function closeFavorites() {
  drawer.hidden = true;
  document.body.style.overflow = '';
  if (drawerReturnFocus instanceof HTMLElement) drawerReturnFocus.focus();
  else drawerOpen?.focus();
}

drawerOpen?.addEventListener('click', openFavorites);
drawerClose.forEach((button) => button.addEventListener('click', closeFavorites));
document.addEventListener('keydown', (event) => {
  if (!drawer || drawer.hidden) return;
  if (event.key === 'Escape') {
    closeFavorites();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

document.querySelectorAll('[data-tool-open]').forEach((link) => {
  link.addEventListener('click', () => sendEvent('tool_open', { tool_id: link.dataset.toolId, category_id: link.dataset.categoryId }));
});
const promoLinks = [...document.querySelectorAll('[data-promo-click]')];
promoLinks.forEach((link) => {
  link.addEventListener('click', () => sendEvent('promo_click', { placement: link.dataset.placement, creative_version: 'mayin-huyue-v3' }));
});

function trackVisiblePromos() {
  if (typeof window.gtag !== 'function') return;
  const candidates = promoLinks.filter((link) => link.dataset.promoViewSent !== 'true');
  if (!candidates.length) return;
  if (!('IntersectionObserver' in window)) {
    candidates.forEach((link) => {
      link.dataset.promoViewSent = 'true';
      sendEvent('promo_view', { placement: link.dataset.placement, creative_version: 'mayin-huyue-v3' });
    });
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      const link = entry.target;
      if (link.dataset.promoViewSent === 'true') return;
      link.dataset.promoViewSent = 'true';
      sendEvent('promo_view', { placement: link.dataset.placement, creative_version: 'mayin-huyue-v3' });
      observer.unobserve(link);
    });
  }, { threshold: [0.5] });
  candidates.forEach((link) => observer.observe(link));
}
trackVisiblePromos();

syncFavoriteButtons();


const guideFilterButtons = [...document.querySelectorAll('[data-guide-filter]')];
const guideCards = [...document.querySelectorAll('[data-guide-topic]')];
const guideFilterStatus = document.querySelector('[data-guide-filter-status]');
if (guideFilterButtons.length && guideCards.length) {
  guideFilterButtons.forEach((button) => button.addEventListener('click', () => {
    const topic = button.dataset.guideFilter || 'all';
    let visible = 0;
    guideFilterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    guideCards.forEach((card) => {
      const show = topic === 'all' || card.dataset.guideTopic === topic;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (guideFilterStatus) guideFilterStatus.textContent = `显示 ${visible} 篇指南`;
  }));
}
