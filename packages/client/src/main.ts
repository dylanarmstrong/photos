import './main.css';

// Navigate with arrow keys
const back: HTMLLinkElement | null = document.querySelector('#back');
const home: HTMLLinkElement | null = document.querySelector('#home');
const next: HTMLLinkElement | null = document.querySelector('#next');
const previous: HTMLLinkElement | null = document.querySelector('#prev');

const move = ({ code }: KeyboardEvent) => {
  switch (true) {
    // Right Arrow
    case code === 'ArrowRight' && !!next: {
      next.click();
      break;
    }

    // Left Arrow
    case code === 'ArrowLeft' && !!previous: {
      previous.click();
      break;
    }

    // Home
    case code === 'KeyH' && !!home: {
      home.click();
      break;
    }

    // Back to previous page from detail page
    case code === 'KeyB' && !!back: {
      back.click();
      break;
    }

    default: {
      break;
    }
  }
};

document.addEventListener('keydown', move);

const main: HTMLElement | null = document.querySelector('main');
if (main) {
  const minimumDeltaX = 20;
  const maximumDeltaY = 15;
  let initialScreenX = 0;
  let initialScreenY = 0;

  const touchstart = (event: TouchEvent) => {
    [{ screenX: initialScreenX, screenY: initialScreenY }] =
      event.changedTouches;
  };

  const touchend = (event: TouchEvent) => {
    const [{ screenX, screenY }] = event.changedTouches;
    const deltaX = screenX - initialScreenX;
    const deltaY = screenY - initialScreenY;
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > minimumDeltaX &&
      Math.abs(deltaY) < maximumDeltaY
    ) {
      if (deltaX > 0) {
        if (next) {
          next.click();
        }
      } else if (previous) {
        previous.click();
      }
    }
  };

  main.addEventListener('touchstart', touchstart);
  main.addEventListener('touchend', touchend);
}
