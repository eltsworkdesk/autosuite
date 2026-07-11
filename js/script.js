/**
 * AutoSuite — shared site behavior
 * Loaded on every page. Handles the mobile nav toggle,
 * the shared "Book a Test Drive" modal, and small utilities.
 */

function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  const burger = document.querySelector('.burger');
  if (!nav) return;
  const isOpen = nav.classList.toggle('active');
  if (burger) burger.setAttribute('aria-expanded', String(isOpen));
}

let lastFocusedBeforeModal = null;

function openTestDriveModal(carName) {
  const modal = document.getElementById('testDriveModal');
  if (!modal) return;
  lastFocusedBeforeModal = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const carField = document.getElementById('td-car');
  if (carField && carName) carField.value = carName;

  // Move focus into the dialog — the first empty-ish field, or the close button
  const focusTarget = (carField && !carField.value) ? carField : document.getElementById('td-email');
  (focusTarget || modal.querySelector('.close'))?.focus();
}

function closeTestDriveModal() {
  const modal = document.getElementById('testDriveModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
    lastFocusedBeforeModal.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Footer year, if present on the page
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Close modal when clicking the backdrop
  const modal = document.getElementById('testDriveModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeTestDriveModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('open')) {
        closeTestDriveModal();
      }
    });
  }

  // Test drive form: client-side validation + demo success state (no backend)
  const form = document.getElementById('testDriveForm');
  if (form) {
    const status = document.getElementById('td-status');
    const statusText = status?.querySelector('.status-text');
    const fields = Array.from(form.querySelectorAll('.field'));

    function validateField(fieldEl) {
      const input = fieldEl.querySelector('input');
      if (!input) return true;
      const valid = input.checkValidity();
      fieldEl.classList.toggle('invalid', !valid);
      return valid;
    }

    // Clear the error as soon as the field becomes valid again
    fields.forEach((fieldEl) => {
      const input = fieldEl.querySelector('input');
      input?.addEventListener('input', () => {
        if (fieldEl.classList.contains('invalid')) validateField(fieldEl);
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      let firstInvalid = null;
      fields.forEach((fieldEl) => {
        const ok = validateField(fieldEl);
        if (!ok && !firstInvalid) firstInvalid = fieldEl.querySelector('input');
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carName: form.querySelector('#td-car').value,
            name: form.querySelector('#td-name').value,
            email: form.querySelector('#td-email').value,
            phone: form.querySelector('#td-phone').value,
          }),
        });
        if (!res.ok) throw new Error('Request failed');

        if (statusText) statusText.textContent = `Thanks! We'll reach out to confirm your test drive.`;
        status?.classList.add('visible');

        setTimeout(() => {
          form.reset();
          fields.forEach((f) => f.classList.remove('invalid'));
          submitBtn.disabled = false;
          closeTestDriveModal();
          status?.classList.remove('visible');
        }, 1800);
      } catch (err) {
        if (statusText) statusText.textContent = `Something went wrong. Please try again or call us directly.`;
        status?.classList.add('visible');
        submitBtn.disabled = false;
      }
    });
  }

  // Smooth-scroll for any in-page anchor links (nav chips, footer links, etc.)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelector('.nav-links')?.classList.remove('active');
      document.querySelector('.burger')?.setAttribute('aria-expanded', 'false');
    });
  });
});
