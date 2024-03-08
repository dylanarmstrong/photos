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
