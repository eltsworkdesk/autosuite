/**
 * AutoSuite — financing calculator + trade-in estimator
 * Loaded on the vehicle detail page. Reads the current car's price from
 * window.AUTOSUITE_CURRENT_CAR (set by cars-data.js, with a static fallback
 * set inline in car-page.html for the no-?id= case).
 */

(function () {
  const downInput = document.getElementById('fcDown');
  const termInput = document.getElementById('fcTerm');
  const aprInput = document.getElementById('fcApr');
  if (!downInput || !termInput || !aprInput) return; // not on this page

  const downOut = document.getElementById('fcDownOut');
  const termOut = document.getElementById('fcTermOut');
  const aprOut = document.getElementById('fcAprOut');
  const monthlyOut = document.getElementById('fcMonthly');

  let price = (window.AUTOSUITE_CURRENT_CAR && window.AUTOSUITE_CURRENT_CAR.price) || 0;

  window.addEventListener('autosuite:car-ready', (event) => {
    price = event.detail.price;
    calculate();
  });

  function formatNaira(amount) {
    return '₦' + Math.round(amount).toLocaleString('en-NG');
  }

  function calculate() {
    const downPct = Number(downInput.value);
    const termMonths = Number(termInput.value);
    const aprPct = Number(aprInput.value);

    downOut.textContent = `${downPct}%`;
    termOut.textContent = `${termMonths} months`;
    aprOut.textContent = `${aprPct}%`;

    const monthly = window.AutoSuiteFinance.calculateMonthlyPayment({ price, downPct, termMonths, aprPct });
    monthlyOut.textContent = formatNaira(monthly);
  }

  [downInput, termInput, aprInput].forEach((input) => {
    input.addEventListener('input', calculate);
  });

  calculate();

  /* ---------- Trade-in estimator (lead capture) ---------- */
  const tradeForm = document.getElementById('tradeInForm');
  if (!tradeForm) return;

  const tiStatus = document.getElementById('ti-status');
  const tiStatusText = tiStatus?.querySelector('.status-text');
  const tiFields = Array.from(tradeForm.querySelectorAll('.field'));

  function validateField(fieldEl) {
    const input = fieldEl.querySelector('input, select');
    if (!input) return true;
    const valid = input.checkValidity();
    fieldEl.classList.toggle('invalid', !valid);
    return valid;
  }

  tiFields.forEach((fieldEl) => {
    const input = fieldEl.querySelector('input, select');
    input?.addEventListener('input', () => {
      if (fieldEl.classList.contains('invalid')) validateField(fieldEl);
    });
  });

  tradeForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let firstInvalid = null;
    tiFields.forEach((fieldEl) => {
      const ok = validateField(fieldEl);
      if (!ok && !firstInvalid) firstInvalid = fieldEl.querySelector('input, select');
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submitBtn = tradeForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const vehicle = tradeForm.querySelector('#ti-vehicle').value;
    const mileage = tradeForm.querySelector('#ti-mileage').value;
    const condition = tradeForm.querySelector('#ti-condition').value;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carName: `Trade-in: ${vehicle} (${mileage}, ${condition})`,
          name: tradeForm.querySelector('#ti-name').value,
          email: tradeForm.querySelector('#ti-email').value,
          phone: tradeForm.querySelector('#ti-phone').value,
          source: 'trade-in-estimator',
        }),
      });
      if (!res.ok) throw new Error('Request failed');

      if (tiStatusText) tiStatusText.textContent = `Thanks! A dealer will follow up with a trade-in estimate within one business day.`;
      tiStatus?.classList.add('visible');
      tradeForm.reset();
      tiFields.forEach((f) => f.classList.remove('invalid'));
    } catch (err) {
      if (tiStatusText) tiStatusText.textContent = `Something went wrong. Please try again or call us directly.`;
      tiStatus?.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
