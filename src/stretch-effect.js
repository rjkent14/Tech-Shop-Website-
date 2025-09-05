// Add rubber band stretching effect on over-scroll for main page
window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('main-scroll-wrapper');
  const content = document.getElementById('main-content');
  if (!wrapper || !content) return;

  let startY = 0;
  let stretching = false;

  wrapper.addEventListener('touchstart', (e) => {
    if (wrapper.scrollTop === 0 || wrapper.scrollTop + wrapper.offsetHeight >= wrapper.scrollHeight) {
      startY = e.touches[0].clientY;
      stretching = true;
    }
  });

  wrapper.addEventListener('touchmove', (e) => {
    if (!stretching) return;
    const deltaY = e.touches[0].clientY - startY;
    if ((wrapper.scrollTop === 0 && deltaY > 0) || (wrapper.scrollTop + wrapper.offsetHeight >= wrapper.scrollHeight && deltaY < 0)) {
      wrapper.classList.add('stretching');
    } else {
      wrapper.classList.remove('stretching');
    }
  });

  wrapper.addEventListener('touchend', () => {
    wrapper.classList.remove('stretching');
    stretching = false;
  });
});
