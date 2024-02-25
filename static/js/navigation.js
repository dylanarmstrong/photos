/* global document */
((d) => {
  // Navigate with arrow keys
  const home = d.querySelector('#home');
  const next = d.querySelector('#next');
  const previous = d.querySelector('#prev');

  const move = ({ keyCode }) => {
    switch (true) {
      // Right Arrow
      case keyCode === 39 && !!next: {
        next.click();
        break;
      }

      // Left Arrow
      case keyCode === 37 && !!previous: {
        previous.click();
        break;
      }

      // Home
      case keyCode === 72 && !!home: {
        home.click();
        break;
      }

      default: {
        break;
      }
    }
  };
  d.addEventListener('keydown', move);
})(document);
