/**
 * AutoSuite — vehicle comparison
 * Two responsibilities, both guarded so this file is safe to include
 * everywhere: (1) on the listing page, track which cars are checked for
 * comparison (localStorage, max 3) and show a floating "Compare" bar;
 * (2) on the compare page itself, render the side-by-side spec table.
 */

(function () {
  const STORAGE_KEY = 'autosuite_compare';
  const MAX_COMPARE = 3;

  function getCompareIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (err) {
      return [];
    }
  }

  function setCompareIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  /* ---------- Listing page: checkbox selection + floating bar ---------- */
  function initListingCompare() {
    const grid = document.getElementById('carsGrid');
    if (!grid) return;

    let bar = document.getElementById('compareBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'compareBar';
      bar.className = 'compare-bar';
      bar.innerHTML = `
        <span id="compareBarCount"></span>
        <div class="compare-bar-actions">
          <button type="button" class="btn outline small" id="compareBarClear">Clear</button>
          <a class="btn small" id="compareBarGo" href="compare.html">Compare</a>
        </div>
      `;
      document.body.appendChild(bar);
      document.getElementById('compareBarClear').addEventListener('click', () => {
        setCompareIds([]);
        syncCheckboxes();
        updateBar();
      });
    }

    function updateBar() {
      const ids = getCompareIds();
      const count = document.getElementById('compareBarCount');
      const go = document.getElementById('compareBarGo');
      if (ids.length >= 2) {
        bar.classList.add('visible');
        count.textContent = `${ids.length} vehicle${ids.length === 1 ? '' : 's'} selected`;
        go.href = `compare.html?ids=${ids.join(',')}`;
      } else {
        bar.classList.remove('visible');
      }
    }

    function syncCheckboxes() {
      const ids = getCompareIds();
      grid.querySelectorAll('.compare-toggle').forEach((box) => {
        box.checked = ids.includes(box.dataset.id);
      });
    }

    grid.addEventListener('change', (event) => {
      const box = event.target.closest('.compare-toggle');
      if (!box) return;

      let ids = getCompareIds();
      if (box.checked) {
        if (ids.length >= MAX_COMPARE) {
          box.checked = false;
          alert(`You can compare up to ${MAX_COMPARE} vehicles at a time.`);
          return;
        }
        ids.push(box.dataset.id);
      } else {
        ids = ids.filter((id) => id !== box.dataset.id);
      }
      setCompareIds(ids);
      updateBar();
    });

    window.addEventListener('autosuite:cards-rendered', () => {
      syncCheckboxes();
      updateBar();
    });

    syncCheckboxes();
    updateBar();
  }

  /* ---------- Compare page: side-by-side table ---------- */
  async function initComparePage() {
    const container = document.getElementById('compareTable');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const ids = (params.get('ids') || '').split(',').filter(Boolean);

    if (ids.length < 2) {
      container.innerHTML = `<p class="empty-state">Select 2–3 vehicles on the <a href="cars.html">inventory page</a> to compare them here.</p>`;
      return;
    }

    try {
      const cars = await fetchCars();
      const selected = ids.map((id) => cars.find((c) => c.id === id)).filter(Boolean);

      if (selected.length < 2) {
        container.innerHTML = `<p class="empty-state">Couldn't find those vehicles. <a href="cars.html">Pick vehicles to compare</a>.</p>`;
        return;
      }

      const rows = [
        ['Price', (c) => formatNaira(c.price)],
        ['Year', (c) => c.year],
        ['Engine', (c) => c.engine],
        ['Horsepower', (c) => `${c.horsepower} hp`],
        ['Drivetrain', (c) => c.drivetrain],
        ['Mileage', (c) => c.mileage],
      ];

      container.innerHTML = `
        <table class="compare-table">
          <thead>
            <tr>
              <th scope="col"></th>
              ${selected.map((c) => `<th scope="col"><img src="${imageUrl(c.image)}" alt="${c.name}"><div>${c.name}</div></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                ([label, fn]) => `
              <tr>
                <th scope="row">${label}</th>
                ${selected.map((c) => `<td>${fn(c)}</td>`).join('')}
              </tr>`
              )
              .join('')}
            <tr>
              <th scope="row"></th>
              ${selected.map((c) => `<td><a class="btn small" href="${carDetailUrl(c)}">View Details</a></td>`).join('')}
            </tr>
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p class="empty-state">Inventory is temporarily unavailable. Please try again shortly.</p>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initListingCompare();
    initComparePage();
  });
})();
