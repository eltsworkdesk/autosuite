/**
 * AutoSuite — pure inventory logic (formatting, filtering, sorting).
 * No DOM access, so it's usable both as a plain browser script
 * (window.AutoSuiteInventory) and from Node/Vitest (module.exports).
 */
(function (root, factory) {
  const lib = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = lib;
  }
  if (root) {
    root.AutoSuiteInventory = lib;
  }
})(typeof window !== 'undefined' ? window : undefined, function () {
  function formatNaira(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
  }

  function sortCars(cars, sortBy) {
    const sorted = [...cars];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'year-desc':
        return sorted.sort((a, b) => b.year - a.year);
      default:
        return sorted.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
    }
  }

  function filterCars(cars, { query = '', brand = '', maxPrice = Infinity } = {}) {
    const q = query.trim().toLowerCase();
    return cars.filter((car) => {
      const matchesQuery = !q || car.name.toLowerCase().includes(q) || car.brand.toLowerCase().includes(q);
      const matchesBrand = !brand || car.brand === brand;
      const matchesPrice = car.price <= maxPrice;
      return matchesQuery && matchesBrand && matchesPrice;
    });
  }

  return { formatNaira, sortCars, filterCars };
});
