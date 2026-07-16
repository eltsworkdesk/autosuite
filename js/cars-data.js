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
const { formatNaira, sortCars, filterCars } = window.AutoSuiteInventory;

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
  return `
    <article class="car-card">
      <div class="car-card-media">
        <span class="data-chip"><span class="dot"></span>${car.year}</span>
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

async function initListingPage() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  const searchInput = document.getElementById('searchBar');
  const searchClear = document.getElementById('searchClear');
  const brandSelect = document.getElementById('brandFilter');
  const sortSelect = document.getElementById('sortBy');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
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

  // Populate brand filter from real data instead of a hardcoded list
  const brands = [...new Set(cars.map((c) => c.brand))].sort();
  brandSelect.innerHTML =
    '<option value="">All Brands</option>' +
    brands.map((b) => `<option value="${b}">${b}</option>`).join('');

  // Set the price slider range to match actual inventory
  const maxPrice = Math.max(...cars.map((c) => c.price));
  const sliderMax = Math.ceil(maxPrice / 1000000) * 1000000;
  priceRange.min = 0;
  priceRange.max = sliderMax;
  priceRange.step = 1000000;
  priceRange.value = sliderMax;
  priceValue.textContent = formatNaira(sliderMax);

  function hasActiveFilters() {
    return Boolean(searchInput.value.trim()) || Boolean(brandSelect.value) || Number(priceRange.value) < sliderMax;
  }

  function applyFilters() {
    const query = searchInput.value.trim();
    const brand = brandSelect.value;
    const maxAllowed = Number(priceRange.value);

    searchClear.hidden = query.length === 0;

    const results = sortCars(filterCars(cars, { query, brand, maxPrice: maxAllowed }), sortSelect.value);

    grid.setAttribute('aria-busy', 'false');
    grid.innerHTML = results.length
      ? results.map((car) => carCardHTML(car, { compare: true })).join('')
      : emptyStateHTML(hasActiveFilters());
    window.dispatchEvent(new CustomEvent('autosuite:cards-rendered'));

    const emptyReset = document.getElementById('emptyStateReset');
    if (emptyReset) emptyReset.addEventListener('click', resetFilters);

    if (resultCount) {
      resultCount.textContent = `${results.length} car${results.length === 1 ? '' : 's'}`;
    }
  }

  function resetFilters() {
    searchInput.value = '';
    brandSelect.value = '';
    sortSelect.value = 'default';
    priceRange.value = sliderMax;
    priceValue.textContent = formatNaira(sliderMax);
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
  brandSelect.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
  priceRange.addEventListener('input', () => {
    priceValue.textContent = formatNaira(priceRange.value);
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

  const thumbButtons = thumbsWrap.querySelectorAll('button');
  thumbButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (img) mainPhoto.src = img.dataset.full;
      thumbButtons.forEach((b) => b.removeAttribute('aria-current'));
      btn.setAttribute('aria-current', 'true');
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

    nameEl.textContent = car.name;

    const brandTag = document.getElementById('brandTag');
    if (brandTag) brandTag.textContent = car.brand;

    const priceEl = document.getElementById('carPrice');
    if (priceEl) priceEl.innerHTML = `Listed at <strong>${formatNaira(car.price)}</strong>`;

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
    const photoGrid = document.getElementById('photoGrid');
    if (photoGrid && car.gallery?.length) {
      let exteriorCount = 0;
      let interiorCount = 0;
      photoGrid.innerHTML = car.gallery
        .map((img) => {
          const isInterior = /interior/i.test(img);
          const label = isInterior ? `Interior, photo ${++interiorCount}` : `Exterior, photo ${++exteriorCount}`;
          return `<img src="${imageUrl(img)}" alt="${car.name} — ${label}" loading="lazy">`;
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
