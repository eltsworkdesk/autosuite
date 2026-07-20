/**
 * AutoSuite — saved vehicles ("Favorites").
 * No account required, matching the rest of the consumer experience —
 * favorites persist in localStorage on this device only.
 */
window.AutoSuiteFavorites = (function () {
  const KEY = 'autosuite_favorites';

  function getFavorites() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function isFavorite(id) {
    return getFavorites().includes(id);
  }

  function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx === -1) {
      favs.push(id);
    } else {
      favs.splice(idx, 1);
    }
    localStorage.setItem(KEY, JSON.stringify(favs));
    document.dispatchEvent(new CustomEvent('autosuite:favorites-changed', { detail: { id, favorited: idx === -1 } }));
    return idx === -1;
  }

  function count() {
    return getFavorites().length;
  }

  // Delegated click handler so this works for cards rendered before or
  // after this script runs, and for cards re-rendered after filtering.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-favorite-toggle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const id = btn.dataset.favoriteToggle;
    toggleFavorite(id);
  });

  function refreshAllToggles() {
    document.querySelectorAll('[data-favorite-toggle]').forEach((btn) => {
      const id = btn.dataset.favoriteToggle;
      const favorited = isFavorite(id);
      btn.setAttribute('aria-pressed', String(favorited));
      btn.textContent = favorited ? '♥' : '♡';
      btn.classList.toggle('is-favorited', favorited);
    });
  }

  document.addEventListener('autosuite:favorites-changed', refreshAllToggles);

  return { getFavorites, isFavorite, toggleFavorite, count, refreshAllToggles };
})();
