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

function openTestDriveModal(carName) {
  const modal = document.getElementById('testDriveModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const carField = document.getElementById('td-car');
  if (carField && carName) carField.value = carName;
}

function closeTestDriveModal() {
  const modal = document.getElementById('testDriveModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
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

  // Test drive form submission (demo — no backend wired up yet)
  const form = document.getElementById('testDriveForm');
  if (form) {
    const status = document.getElementById('td-status');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (status) {
        status.textContent = `Thanks! We'll reach out to confirm your test drive.`;
        status.classList.add('visible');
      }
      form.reset();
      setTimeout(() => {
        closeTestDriveModal();
        if (status) status.classList.remove('visible');
      }, 1600);
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
