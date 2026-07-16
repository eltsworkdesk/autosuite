/**
 * AutoSuite — pure financing math (standard amortized-loan monthly payment).
 * No DOM access, so it's usable both as a plain browser script
 * (window.AutoSuiteFinance) and from Node/Vitest (module.exports).
 */
(function (root, factory) {
  const lib = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = lib;
  }
  if (root) {
    root.AutoSuiteFinance = lib;
  }
})(typeof window !== 'undefined' ? window : undefined, function () {
  /** Monthly payment for a loan with a down payment, given as percentages of `price`. */
  function calculateMonthlyPayment({ price, downPct, termMonths, aprPct }) {
    const downAmount = price * (downPct / 100);
    const principal = price - downAmount;
    const monthlyRate = aprPct / 100 / 12;

    const monthly =
      monthlyRate === 0
        ? principal / termMonths
        : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));

    return Math.max(monthly, 0);
  }

  return { calculateMonthlyPayment };
});
