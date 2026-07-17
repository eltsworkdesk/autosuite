/**
 * AutoSuite — fullscreen photo viewer for the vehicle detail page.
 * Any element with [data-lightbox-index] opens the viewer at that index
 * (the hero "expand" button and every photo in #photoGrid). The image list
 * itself is read straight from #photoGrid's <img> tags, since that section
 * always holds the car's complete gallery in the same order the index
 * attributes were assigned in (see js/cars-data.js).
 */
(function () {
  let currentIndex = 0;
  let lastFocused = null;

  function getImages() {
    const grid = document.getElementById('photoGrid');
    return grid ? Array.from(grid.querySelectorAll('img')) : [];
  }

  function render(lightbox) {
    const images = getImages();
    if (!images.length) return;
    currentIndex = (currentIndex + images.length) % images.length;

    const source = images[currentIndex];
    const img = lightbox.querySelector('.lightbox-img');
    img.src = source.src;
    img.alt = source.alt;

    const counter = lightbox.querySelector('.lightbox-counter');
    counter.textContent = `${currentIndex + 1} / ${images.length}`;

    const multiple = images.length > 1;
    lightbox.querySelector('.lightbox-prev').hidden = !multiple;
    lightbox.querySelector('.lightbox-next').hidden = !multiple;
  }

  function open(lightbox, index) {
    currentIndex = index;
    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    render(lightbox);
    lightbox.querySelector('.lightbox-close').focus();
  }

  function close(lightbox) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-lightbox-index]');
      if (!trigger) return;
      open(lightbox, Number(trigger.dataset.lightboxIndex) || 0);
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', () => close(lightbox));
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
      currentIndex -= 1;
      render(lightbox);
    });
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
      currentIndex += 1;
      render(lightbox);
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close(lightbox);
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') close(lightbox);
      if (event.key === 'ArrowLeft') {
        currentIndex -= 1;
        render(lightbox);
      }
      if (event.key === 'ArrowRight') {
        currentIndex += 1;
        render(lightbox);
      }
    });
  });
})();
