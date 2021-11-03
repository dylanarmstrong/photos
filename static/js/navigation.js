'use strict';
(function(d) {
  // Navigate with arrow keys
  const home = d.getElementById('home');
  const next = d.getElementById('next');
  const prev = d.getElementById('prev');

  const move = ({ keyCode }) => {
    switch (true) {
      // Right Arrow
      case keyCode === 39 && !!next:
        next.click();
        break;

      // Left Arrow
      case keyCode === 37 && !!prev:
        prev.click();
        break;

      // Home
      case keyCode === 72 && !!home:
        home.click();
        break;

      default:
        break;
    }
  };
  d.addEventListener('keydown', move);
})(document);
