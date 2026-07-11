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

function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function imageUrl(fileName) {
  return ASSET_BASE + fileName;
}

async function fetchCars() {
  const res = await fetch(CARS_JSON_PATH);
  if (!res.ok) throw new Error('Could not load inventory data');
  return res.json();
}

function carDetailUrl(car) {
  const base = window.location.pathname.includes('/pages/') ? 'car-page.html' : 'pages/car-page.html';
  return `${base}?id=${encodeURIComponent(car.id)}`;
}

function carCardHTML(car) {
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
        <a href="${carDetailUrl(car)}" class="btn small">View Details</a>
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
async function initListingPage() {
  const grid = document.getElementById('carsGrid');
  if (!grid) return;

  const searchInput = document.getElementById('searchBar');
  const brandSelect = document.getElementById('brandFilter');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  const resultCount = document.getElementById('resultCount');

  let cars = [];
  try {
    cars = await fetchCars();
  } catch (err) {
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
  priceRange.min = 0;
  priceRange.max = Math.ceil(maxPrice / 1000000) * 1000000;
  priceRange.step = 1000000;
  priceRange.value = priceRange.max;
  priceValue.textContent = formatNaira(priceRange.max);

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const brand = brandSelect.value;
    const maxAllowed = Number(priceRange.value);

    const results = cars.filter((car) => {
      const matchesQuery = !query || car.name.toLowerCase().includes(query) || car.brand.toLowerCase().includes(query);
      const matchesBrand = !brand || car.brand === brand;
      const matchesPrice = car.price <= maxAllowed;
      return matchesQuery && matchesBrand && matchesPrice;
    });

    grid.innerHTML = results.length
      ? results.map(carCardHTML).join('')
      : `<div class="empty-state"><span class="eyebrow">No matches</span>Try widening your price range or clearing the search.</div>`;

    if (resultCount) {
      resultCount.textContent = `${results.length} car${results.length === 1 ? '' : 's'}`;
    }
  }

  searchInput.addEventListener('input', applyFilters);
  brandSelect.addEventListener('change', applyFilters);
  priceRange.addEventListener('input', () => {
    priceValue.textContent = formatNaira(priceRange.value);
    applyFilters();
  });

  applyFilters();
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
        .map((img, i) => `<img src="${imageUrl(img)}" data-full="${imageUrl(img)}" alt="${car.name} photo ${i + 1}">`)
        .join('');
      thumbsWrap.querySelectorAll('img').forEach((thumb) => {
        thumb.addEventListener('click', () => {
          mainPhoto.src = thumb.dataset.full;
        });
      });
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

document.addEventListener('DOMContentLoaded', () => {
  renderFeatured('#featuredGrid');
  initListingPage();
  initDetailPage();
});
