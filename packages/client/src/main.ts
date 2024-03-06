import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

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

const mapElement: HTMLDivElement | null = document.querySelector('#map');
if (mapElement) {
  const nLatitude = Number.parseFloat(mapElement.dataset['latitude'] || 'NaN');
  const nLongitude = Number.parseFloat(
    mapElement.dataset['longitude'] || 'NaN',
  );
  if (!Number.isNaN(nLatitude) && !Number.isNaN(nLongitude)) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const map = L.map(mapElement).setView([nLatitude, nLongitude], 10);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        subdomains: 'abcd',
      },
    ).addTo(map);
    L.Icon.Default.imagePath = '/photos/static/';
    L.marker([nLatitude, nLongitude]).addTo(map);
  }
}
