/**
 * AutoSuite — inventory data module
 * Fetches data/cars.json once and renders:
 *  - the "Car Highlights" grid on the homepage
 *  - the searchable/filterable grid on the listing page
 *  - the dynamic bits of the car detail page (name, price, photos)
 *
 * Each page sets two globals before this script runs:
 *   window.CARS_JSON_PATH  – relative path to data/cars.json
 *   window.ASSET_BASE      – relative path to the assets/web/ folder
 */

const CARS_JSON_PATH = window.CARS_JSON_PATH || 'data/cars.json';
const ASSET_BASE = window.ASSET_BASE || 'assets/web/';
const { formatNaira, sortCars, filterCars, parseMileageKm } = window.AutoSuiteInventory;

function imageUrl(fileName) {
  return ASSET_BASE + fileName;
}

async function fetchCars() {
  // Preferred path: data/cars-data.js sets window.AUTOSUITE_CARS before this
  // script runs. This works when the site is opened directly as a local file
  // (file://), where fetch() is blocked by the browser for local JSON.
  if (window.AUTOSUITE_CARS) return window.AUTOSUITE_CARS;

  // Fallback: if the site is served over http(s) and cars-data.js wasn't
  // included for some reason, fetch the JSON directly.
  const res = await fetch(CARS_JSON_PATH);
  if (!res.ok) throw new Error('Could not load inventory data');
  return res.json();
}

function carDetailUrl(car) {
  const base = window.location.pathname.includes('/pages/') ? 'car-page.html' : 'pages/car-page.html';
  return `${base}?id=${encodeURIComponent(car.id)}`;
}

function carCardHTML(car, options) {
  const showCompare = options && options.compare;
  const favorited = window.AutoSuiteFavorites ? window.AutoSuiteFavorites.isFavorite(car.id) : false;
  return `
    <article class="car-card">
      <div class="car-card-media">
        <span class="data-chip"><span class="dot"></span>${car.year}</span>
        <button type="button" class="favorite-toggle${favorited ? ' is-favorited' : ''}" data-favorite-toggle="${car.id}" aria-pressed="${favorited}" aria-label="Save ${car.name} to favorites">${favorited ? '♥' : '♡'}</button>
        <img src="${imageUrl(car.image)}" alt="${car.name}" loading="lazy">
      </div>
      <div class="car-card-body">
        <h3>${car.name}</h3>
        <p class="price">${formatNaira(car.price)}</p>
        <ul class="specs">
          <li>${car.engine} · ${car.horsepower} hp</li>
          <li>${car.mileage}</li>
          <li>${car.drivetrain}</li>
        </ul>
        <div class="car-card-actions">
          <a href="${carDetailUrl(car)}" class="btn small">View Details</a>
          ${showCompare ? `
          <label class="compare-check">
            <input type="checkbox" class="compare-toggle" data-id="${car.id}">
            Compare
          </label>` : ''}
        </div>
      </div>
    </article>
  `;
}

/* ---------- Homepage: featured cars ---------- */
async function renderFeatured(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const cars = await fetchCars();
    const featured = cars.filter((c) => c.featured).slice(0, 3);
    el.innerHTML = featured.map(carCardHTML).join('');
  } catch (err) {
    el.innerHTML = `<p class="empty-state">Inventory is temporarily unavailable. Please try again shortly.</p>`;
    console.error(err);
  }
}

/* ---------- Listing page: search + filters ---------- */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function emptyStateHTML(hasActiveFilters) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M21 21l-4.3-4.3"></path>
        </svg>
      </div>
      <span class="eyebrow">No matches</span>
      <h3>No cars fit those filters</h3>
      <p>${hasActiveFilters ? 'Try widening your price range, clearing the search, or resetting filters.' : 'Please check back shortly.'}</p>
      ${hasActiveFilters ? '<button type="button" class="btn ghost small" id="emptyStateReset">Reset Filters</button>' : ''}
    </div>
  `;
}

/* Renders a group of filter checkboxes (with per-value counts) into `host`,
   built from the real inventory so the rail never lists a facet value that
   isn't in stock. `field` is the car property to read (brand / bodyStyle). */
function renderCheckboxFacet(host, cars, field, nameAttr) {
  const counts = {};
  cars.forEach((c) => {
    const v = c[field];
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  host.innerHTML = Object.keys(counts)
    .sort()
    .map(
      (value) => `
        <label class="rail-check">
          <input type="checkbox" name="${nameAttr}" value="${value}">
          <span class="rail-check-label">${value}</span>
          <span class="rail-check-count">${counts[value]}</span>
        </label>`
    )
    .join('');
}

function checkedValues(host) {
  return Array.from(host.querySelectorAll('input:checked')).map((el) => el.value);
}

async function initListingPage() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  const searchInput = document.getElementById('searchBar');
  const searchClear = document.getElementById('searchClear');
  const bodyStyleHost = document.getElementById('bodyStyleFilters');
  const makeHost = document.getElementById('makeFilters');
  const sortSelect = document.getElementById('sortBy');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  const mileageRange = document.getElementById('mileageRange');
  const mileageValue = document.getElementById('mileageValue');
  const resultCount = document.getElementById('resultCount');
  const resetBtn = document.getElementById('resetFilters');

  let cars = [];
  try {
    cars = await fetchCars();
  } catch (err) {
    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = `<p class="empty-state">Inventory is temporarily unavailable. Please try again shortly.</p>`;
    console.error(err);
    return;
  }

  // Build the body-style and make checkbox groups from real data.
  renderCheckboxFacet(bodyStyleHost, cars, 'bodyStyle', 'bodyStyle');
  renderCheckboxFacet(makeHost, cars, 'brand', 'make');

  // Price slider scales to actual inventory; max value = no cap.
  const maxPrice = Math.max(...cars.map((c) => c.price));
  const priceMax = Math.ceil(maxPrice / 1000000) * 1000000;
  priceRange.min = 0;
  priceRange.max = priceMax;
  priceRange.step = 1000000;
  priceRange.value = priceMax;
  priceValue.textContent = formatNaira(priceMax);

  // Mileage slider likewise; at max it reads "Any" and applies no cap.
  const maxMileage = Math.max(...cars.map((c) => parseMileageKm(c.mileage)).filter((n) => Number.isFinite(n)));
  const mileageMax = Math.ceil(maxMileage / 5000) * 5000;
  mileageRange.min = 0;
  mileageRange.max = mileageMax;
  mileageRange.step = 5000;
  mileageRange.value = mileageMax;
  mileageValue.textContent = 'Any';

  function hasActiveFilters() {
    return (
      Boolean(searchInput.value.trim()) ||
      checkedValues(bodyStyleHost).length > 0 ||
      checkedValues(makeHost).length > 0 ||
      Number(priceRange.value) < priceMax ||
      Number(mileageRange.value) < mileageMax
    );
  }

  function applyFilters() {
    const query = searchInput.value.trim();
    const bodyStyles = checkedValues(bodyStyleHost);
    const brands = checkedValues(makeHost);
    const maxPriceAllowed = Number(priceRange.value);
    const mileageVal = Number(mileageRange.value);
    const maxMileageAllowed = mileageVal >= mileageMax ? Infinity : mileageVal;

    searchClear.hidden = query.length === 0;

    const results = sortCars(
      filterCars(cars, { query, brands, bodyStyles, maxPrice: maxPriceAllowed, maxMileage: maxMileageAllowed }),
      sortSelect.value
    );

    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = results.length
      ? results.map((car) => carCardHTML(car, { compare: true })).join('')
      : emptyStateHTML(hasActiveFilters());
    window.dispatchEvent(new CustomEvent('autosuite:cards-rendered'));

    const emptyReset = document.getElementById('emptyStateReset');
    if (emptyReset) emptyReset.addEventListener('click', resetFilters);

    if (resultCount) {
      resultCount.textContent = `${results.length} vehicle${results.length === 1 ? '' : 's'}`;
    }
  }

  function resetFilters() {
    searchInput.value = '';
    bodyStyleHost.querySelectorAll('input:checked').forEach((el) => (el.checked = false));
    makeHost.querySelectorAll('input:checked').forEach((el) => (el.checked = false));
    sortSelect.value = 'default';
    priceRange.value = priceMax;
    priceValue.textContent = formatNaira(priceMax);
    mileageRange.value = mileageMax;
    mileageValue.textContent = 'Any';
    applyFilters();
    searchInput.focus();
  }

  const debouncedApply = debounce(applyFilters, 200);

  searchInput.addEventListener('input', debouncedApply);
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    applyFilters();
    searchInput.focus();
  });
  bodyStyleHost.addEventListener('change', applyFilters);
  makeHost.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
  priceRange.addEventListener('input', () => {
    priceValue.textContent = formatNaira(priceRange.value);
    debouncedApply();
  });
  mileageRange.addEventListener('input', () => {
    const v = Number(mileageRange.value);
    mileageValue.textContent = v >= mileageMax ? 'Any' : `${v.toLocaleString('en-NG')} km`;
    debouncedApply();
  });
  resetBtn.addEventListener('click', resetFilters);

  applyFilters();
}

/* Wires click behavior onto whatever gallery thumbnail buttons currently
   exist in #thumbs — used for both the static fallback markup (no ?id= in
   the URL) and the JS-generated gallery after hydration. */
function wireGalleryThumbs() {
  const mainPhoto = document.getElementById('mainPhoto');
  const thumbsWrap = document.getElementById('thumbs');
  if (!mainPhoto || !thumbsWrap) return;

  const expandBtn = document.getElementById('expandMainPhoto');
  const thumbButtons = thumbsWrap.querySelectorAll('button');
  thumbButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (img) mainPhoto.src = img.dataset.full;
      thumbButtons.forEach((b) => b.removeAttribute('aria-current'));
      btn.setAttribute('aria-current', 'true');
      // Keep the hero "expand to full screen" button pointed at whichever
      // photo is currently shown — thumbs and the photo grid share the same
      // gallery order, so the thumb's index lines up with both.
      if (expandBtn) expandBtn.dataset.lightboxIndex = String(i);
    });
  });
}

/* Picks up to 3 other vehicles to show as "Similar Vehicles": same brand
   first, then whatever's closest in price, excluding the current car. */
function renderSimilarVehicles(car, allCars) {
  const grid = document.getElementById('similarGrid');
  if (!grid) return;

  const others = allCars.filter((c) => c.id !== car.id);
  const similar = [...others]
    .sort((a, b) => {
      const aSameBrand = a.brand === car.brand ? 0 : 1;
      const bSameBrand = b.brand === car.brand ? 0 : 1;
      if (aSameBrand !== bSameBrand) return aSameBrand - bSameBrand;
      return Math.abs(a.price - car.price) - Math.abs(b.price - car.price);
    })
    .slice(0, 3);

  if (!similar.length) return;

  grid.innerHTML = similar
    .map(
      (c) => `
        <a class="similar-card" href="${carDetailUrl(c)}">
          <img src="${imageUrl(c.image)}" alt="${c.name}">
          <h3>${c.name}</h3>
          <p class="similar-price">${formatNaira(c.price)}</p>
          <p>${c.brand} · ${c.drivetrain}</p>
        </a>
      `
    )
    .join('');
}

/* ---------- Detail page: hydrate from ?id= ---------- */
async function initDetailPage() {
  const nameEl = document.getElementById('carName');
  if (!nameEl) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return; // keep the static fallback content in the HTML

  try {
    const cars = await fetchCars();
    const car = cars.find((c) => c.id === id);
    if (!car) return;

    renderSimilarVehicles(car, cars);

    window.AUTOSUITE_CURRENT_CAR = car;
    window.dispatchEvent(new CustomEvent('autosuite:car-ready', { detail: car }));

    const favBtn = document.getElementById('detailFavoriteToggle');
    if (favBtn && window.AutoSuiteFavorites) {
      const syncFavBtn = () => {
        const favorited = window.AutoSuiteFavorites.isFavorite(car.id);
        favBtn.setAttribute('aria-pressed', String(favorited));
        favBtn.textContent = favorited ? '♥ Saved' : '♡ Save';
      };
      syncFavBtn();
      favBtn.addEventListener('click', () => {
        window.AutoSuiteFavorites.toggleFavorite(car.id);
        syncFavBtn();
      });
    }

    nameEl.textContent = car.name;

    const brandTag = document.getElementById('brandTag');
    if (brandTag) brandTag.textContent = car.brand;

    const subline = document.getElementById('carSubline');
    if (subline) subline.textContent = [car.mileage, car.drivetrain].filter(Boolean).join(' · ');

    const priceEl = document.getElementById('carPrice');
    if (priceEl) priceEl.innerHTML = `Listed at <strong>${formatNaira(car.price)}</strong>`;

    // Hero "Est. ₦X/mo" — reuses the tested financing lib with sensible
    // defaults (10% down, 60 months, 18% APR); the financing section below
    // lets the buyer adjust from there.
    const estEl = document.getElementById('heroEstMonthly');
    if (estEl && window.AutoSuiteFinance) {
      const monthly = window.AutoSuiteFinance.calculateMonthlyPayment({ price: car.price, downPct: 10, termMonths: 60, aprPct: 18 });
      estEl.textContent = formatNaira(Math.round(monthly));
    }

    const mainPhoto = document.getElementById('mainPhoto');
    if (mainPhoto && car.gallery?.length) mainPhoto.src = imageUrl(car.gallery[0]);

    const thumbsWrap = document.getElementById('thumbs');
    if (thumbsWrap && car.gallery?.length > 1) {
      thumbsWrap.innerHTML = car.gallery
        .map(
          (img, i) => `
            <button type="button" ${i === 0 ? 'aria-current="true"' : ''}>
              <img src="${imageUrl(img)}" data-full="${imageUrl(img)}" alt="${car.name} photo ${i + 1}">
            </button>
          `
        )
        .join('');
    }
    wireGalleryThumbs();

    // Full photo grid — every image in the gallery, not just the hero + thumbs strip.
    // Each photo is a real button (not a bare <img>) so it's keyboard-reachable and
    // can open the fullscreen lightbox (see js/lightbox.js).
    const photoGrid = document.getElementById('photoGrid');
    if (photoGrid && car.gallery?.length) {
      let exteriorCount = 0;
      let interiorCount = 0;
      photoGrid.innerHTML = car.gallery
        .map((img, i) => {
          const isInterior = /interior/i.test(img);
          const label = isInterior ? `Interior, photo ${++interiorCount}` : `Exterior, photo ${++exteriorCount}`;
          const alt = `${car.name} — ${label}`;
          return `<button type="button" class="photo-grid-item" data-lightbox-index="${i}"><img src="${imageUrl(img)}" alt="${alt}" loading="lazy"></button>`;
        })
        .join('');
    }

    const specEngine = document.getElementById('specEngine');
    if (specEngine) specEngine.textContent = car.engine;
    const specHp = document.getElementById('specHp');
    if (specHp) specHp.textContent = `${car.horsepower} hp`;
    const specDrivetrain = document.getElementById('specDrivetrain');
    if (specDrivetrain) specDrivetrain.textContent = car.drivetrain;
    const specMileage = document.getElementById('specMileage');
    if (specMileage) specMileage.textContent = car.mileage;

    // Buyer's Guide — per-vehicle overview and "what's new" copy.
    const overviewEl = document.getElementById('buyersGuideOverview');
    if (overviewEl && car.overview) overviewEl.textContent = car.overview;
    const whatsNewEl = document.getElementById('buyersGuideWhatsNew');
    if (whatsNewEl && car.whatsNew) whatsNewEl.textContent = car.whatsNew;

    // Vehicle Specifications — built entirely from this car's real data, so it's
    // always accurate (no fabricated per-trim specs for vehicles we don't stock).
    const specsBody = document.getElementById('specsTableBody');
    if (specsBody) {
      const rows = [
        ['Body Style', car.bodyStyle],
        ['Engine', car.engine],
        ['Horsepower', `${car.horsepower} hp`],
        ['Drivetrain', car.drivetrain],
        ['Mileage', car.mileage],
        ['Model Year', car.year],
        ['Price', formatNaira(car.price)],
      ];
      specsBody.innerHTML = rows
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
        .join('');
    }

    const recallCarName = document.getElementById('recallCarName');
    if (recallCarName) recallCarName.textContent = car.name;
    const inventoryCarName = document.getElementById('inventoryCarName');
    if (inventoryCarName) inventoryCarName.textContent = car.name;

    // Breadcrumb: Inventory / {BodyStyle}s / {name}
    const breadcrumbBody = document.getElementById('breadcrumbBody');
    if (breadcrumbBody && car.bodyStyle) breadcrumbBody.textContent = `${car.bodyStyle}s`;
    const breadcrumbName = document.getElementById('breadcrumbName');
    if (breadcrumbName) breadcrumbName.textContent = car.name;

    document.title = `${car.name} — AutoSuite`;
  } catch (err) {
    console.error(err);
  }
}

/* Highlights the feature-nav chip matching whichever content section's
   midpoint is closest to the vertical center of the viewport. A "closest
   section" comparison (rather than a fixed threshold line) handles short,
   tightly-packed sections near the end of the page correctly — a fixed
   threshold can become unreachable for those sections once scrolling hits
   its max and the reading line can no longer advance far enough to reach
   them, even though the user can clearly see they're in view. */
function initFeatureNavScrollSpy() {
  const nav = document.getElementById('featuresNav');
  if (!nav) return;
  const chips = Array.from(nav.querySelectorAll('.nav-chip'));
  const sections = chips
    .map((chip) => document.querySelector(chip.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    chips.forEach((chip) => {
      chip.toggleAttribute('aria-current', chip.getAttribute('href') === `#${id}`);
    });
  };

  function updateActive() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    if (atBottom) {
      setActive(sections[sections.length - 1].id);
      return;
    }

    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let closest = sections[0];
    let closestDistance = Infinity;
    for (const section of sections) {
      const mid = section.offsetTop + section.offsetHeight / 2;
      const distance = Math.abs(mid - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = section;
      }
    }
    setActive(closest.id);
  }

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    },
    { passive: true }
  );

  updateActive();
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatured('#featuredGrid');
  initListingPage();
  initDetailPage();
  wireGalleryThumbs();
  initFeatureNavScrollSpy();
});
