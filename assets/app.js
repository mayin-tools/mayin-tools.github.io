
const analyticsConsentKey = 'mayin-analytics-consent-v1';
const consentBanner = document.querySelector('[data-consent-banner]');
let analyticsLoaded = false;

function loadAnalytics() {
  if (analyticsLoaded || !consentBanner) return;
  analyticsLoaded = true;
  const gaId = consentBanner.dataset.gaId;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', gaId, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);
}

function saveAnalyticsChoice(value) {
  localStorage.setItem(analyticsConsentKey, value);
  if (consentBanner) consentBanner.hidden = true;
  if (value === 'granted') loadAnalytics();
}

if (consentBanner) {
  const choice = localStorage.getItem(analyticsConsentKey);
  if (choice === 'granted') loadAnalytics();
  else if (choice !== 'denied') consentBanner.hidden = false;
  consentBanner.querySelector('[data-consent-accept]')?.addEventListener('click', () => saveAnalyticsChoice('granted'));
  consentBanner.querySelector('[data-consent-reject]')?.addEventListener('click', () => saveAnalyticsChoice('denied'));
}

const searchInput = document.querySelector('[data-search-input]');
const searchPanel = document.querySelector('[data-search-results]');
const searchList = document.querySelector('[data-search-list]');
const searchStatus = document.querySelector('[data-search-status]');
const searchClear = document.querySelector('[data-search-clear]');
let searchIndex = null;
let searchTimer = null;

async function ensureSearchIndex() {
  if (searchIndex) return searchIndex;
  const response = await fetch('/assets/search-index.json');
  searchIndex = await response.json();
  return searchIndex;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

async function runSearch(value) {
  const query = value.trim().toLocaleLowerCase('zh-CN');
  searchClear.hidden = !query;
  if (!query) {
    searchPanel.hidden = true;
    searchList.innerHTML = '';
    return;
  }
  const data = await ensureSearchIndex();
  const matches = data.filter((item) => item.searchText.includes(query)).slice(0, 12);
  searchStatus.textContent = matches.length ? `找到 ${matches.length} 个相关入口` : '没有找到相关工具，可以换个关键词或浏览分类。';
  searchList.innerHTML = matches.map((item) => `<li><a href="${item.url}"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)} · ${escapeHtml(item.summary)}</small></a></li>`).join('');
  searchPanel.hidden = false;
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(searchInput.value), 150);
  });
  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    runSearch('');
    searchInput.focus();
  });
}

const menuButton = document.querySelector('[data-menu-button]');
const mainNav = document.querySelector('[data-main-nav]');
menuButton?.addEventListener('click', () => {
  const open = mainNav.dataset.open !== 'true';
  mainNav.dataset.open = String(open);
  menuButton.setAttribute('aria-expanded', String(open));
});

const favoriteKey = 'mayin-favorites-v1';
const readFavorites = () => {
  try { return JSON.parse(localStorage.getItem(favoriteKey) || '[]'); } catch { return []; }
};
const saveFavorites = (items) => localStorage.setItem(favoriteKey, JSON.stringify(items));

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

async function openFavorites() {
  const favorites = new Set(readFavorites());
  const data = await ensureSearchIndex();
  const items = data.filter((item) => favorites.has(item.id));
  drawerList.innerHTML = items.length ? items.map((item) => `<li><a href="${item.url}"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)}</small></a></li>`).join('') : '<li>还没有收藏工具。</li>';
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  drawer.querySelector('.drawer-panel').focus();
}

function closeFavorites() {
  drawer.hidden = true;
  document.body.style.overflow = '';
  drawerOpen?.focus();
}

drawerOpen?.addEventListener('click', openFavorites);
drawerClose.forEach((button) => button.addEventListener('click', closeFavorites));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer && !drawer.hidden) closeFavorites(); });

document.querySelectorAll('[data-tool-open]').forEach((link) => {
  link.addEventListener('click', () => sendEvent('tool_open', { tool_id: link.dataset.toolId, category_id: link.dataset.categoryId }));
});
document.querySelectorAll('[data-promo-click]').forEach((link) => {
  link.addEventListener('click', () => sendEvent('promo_click', { placement: link.dataset.placement, creative_version: 'mayin-huyue-v1' }));
});

syncFavoriteButtons();
