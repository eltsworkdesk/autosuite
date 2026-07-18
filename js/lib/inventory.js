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

  /** cars.json stores mileage as a formatted string ("6,200 km"); pull the
   *  numeric part for the mileage filter/sort. Returns Infinity if unparseable
   *  so an odd value never silently excludes a car from a "max mileage" filter. */
  function parseMileageKm(str) {
    const digits = String(str == null ? '' : str).replace(/[^\d]/g, '');
    return digits ? Number(digits) : Infinity;
  }

  /**
   * Filter inventory. `brands` and `bodyStyles` are multi-select — an empty
   * array means "all" (no constraint on that facet). `maxPrice`/`maxMileage`
   * are inclusive caps.
   */
  function filterCars(cars, { query = '', brands = [], bodyStyles = [], maxPrice = Infinity, maxMileage = Infinity } = {}) {
    const q = query.trim().toLowerCase();
    return cars.filter((car) => {
      const matchesQuery = !q || car.name.toLowerCase().includes(q) || car.brand.toLowerCase().includes(q);
      const matchesBrand = brands.length === 0 || brands.includes(car.brand);
      const matchesBody = bodyStyles.length === 0 || bodyStyles.includes(car.bodyStyle);
      const matchesPrice = car.price <= maxPrice;
      const matchesMileage = parseMileageKm(car.mileage) <= maxMileage;
      return matchesQuery && matchesBrand && matchesBody && matchesPrice && matchesMileage;
    });
  }

  return { formatNaira, sortCars, filterCars, parseMileageKm };
});
