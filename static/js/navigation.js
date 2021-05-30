'use strict';
(function() {
  // Navigate with arrow keys
  const next = document.getElementById('next');
  const prev = document.getElementById('prev');

  const move = ({ keyCode }) => {
    if (keyCode === 39 && next) {
      next.click();
    } else if (keyCode === 37 && prev) {
      prev.click();
    }
  };

  document.addEventListener('keydown', move);
})();
