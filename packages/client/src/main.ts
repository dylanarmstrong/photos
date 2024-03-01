import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import './main.css';

// Navigate with arrow keys
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

    default: {
      break;
    }
  }
};

document.addEventListener('keydown', move);

const mapElement: HTMLDivElement | null = document.querySelector('#map');
if (mapElement) {
  const { latitude, longitude } = mapElement.dataset;
  if (longitude && latitude) {
    const mapCoord = (coord: string, index: number) => {
      switch (index) {
        case 1: {
          return Number.parseInt(coord) / 60;
        }
        case 2: {
          return Number.parseInt(coord.slice(0, 2)) / 3600;
        }
        default: {
          return Number.parseInt(coord);
        }
      }
    };

    const nLongitude = longitude
      .split(' ')
      .map((coord, index) => mapCoord(coord, index))
      .reduce((accumulator, current) => accumulator + current, 0);

    const nLatitude = latitude
      .split(' ')
      .map((coord, index) => mapCoord(coord, index))
      .reduce((accumulator, current) => accumulator + current, 0);

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const map = L.map(mapElement).setView([nLatitude, nLongitude], 14);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        subdomains: 'abcd',
      },
    ).addTo(map);
    L.marker([nLatitude, nLongitude]).addTo(map);
  }
}
