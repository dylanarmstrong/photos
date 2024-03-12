import { IMAGE_DOMAIN } from './constants.js';

import type { IPhoto, SqlRowExif } from './@types/index.js';

const sizes = Object.freeze([320, 640, 960, 1280, 2560]);

const divide = (string_: string) => {
  const split = string_
    .split('/')
    .map((value) => Number.parseInt(value))
    .filter((value) => !Number.isNaN(value));
  if (split.length === 2 && split[1] !== 0) {
    return split[0] / split[1];
  }
  return Number.NaN;
};

class Photo implements IPhoto {
  album: string;
  datetime: string;
  file: string;
  gpsLatitude: string;
  gpsLatitudeRef: string;
  gpsLongitude: string;
  gpsLongitudeRef: string;
  height: number;
  model: string;
  private _fNumber: string;
  private _focalLength: string;
  private _isoSpeedRatings: string;
  private _make: string;
  private _shutterSpeedValue: string;
  width: number;

  constructor(row: SqlRowExif) {
    this._fNumber = row.f_number;
    this._focalLength = row.focal_length;
    this._isoSpeedRatings = row.iso_speed_ratings;
    this._make = row.make;
    this._shutterSpeedValue = row.shutter_speed_value;
    this.album = row.album;
    this.datetime = row.datetime;
    this.file = row.file;
    this.gpsLatitude = row.gps_latitude;
    this.gpsLatitudeRef = row.gps_latitude_ref;
    this.gpsLongitude = row.gps_longitude;
    this.gpsLongitudeRef = row.gps_longitude_ref;
    this.height = row.height;
    this.model = row.model;
    this.width = row.width;
  }

  getSizes(page: 'album' | 'details') {
    if (page === 'album') {
      return [
        '(min-width: 1540px) calc(12.47vw - 12px)',
        '(min-width: 1040px) calc(20vw - 15px)',
        '(min-width: 780px) calc(33.33vw - 18px)',
        '(min-width: 640px) calc(50vw - 22px)',
        'calc(100vw - 34px)',
      ].join(', ');
    }

    return [
      '(min-width: 1920px) 1280px',
      '(min-width: 780px) calc(95.36vw - 532px)',
      'calc(100vw - 168px)',
    ].join(',');
  }

  getSrcSet(format: 'avif' | 'jpeg' | 'webp') {
    const { images, x } = this;
    return sizes
      .map(
        (size) =>
          `${images[size as keyof typeof images][format]} ${
            x < size ? `${x}w` : `${size}w`
          }`,
      )
      .join(', ');
  }

  get coord() {
    const { gpsLatitude, gpsLatitudeRef, gpsLongitude, gpsLongitudeRef } = this;
    if (gpsLatitude && gpsLatitudeRef && gpsLongitude && gpsLongitudeRef) {
      return `${gpsLatitude.replace(
        /(\d+)\/1 (\d+)\/1 (\d+)\/10+$/,
        (_, group1, group2, group3) =>
          `${group1}˚${group2}'${(Number.parseInt(group3) / 100).toFixed(0)}"`,
      )} ${gpsLatitudeRef}, ${gpsLongitude.replace(
        /(\d+)\/1 (\d+)\/1 (\d+)\/100$/,
        (_, group1, group2, group3) =>
          `${group1}˚${group2}'${(Number.parseInt(group3) / 100).toFixed(0)}"`,
      )} ${gpsLongitudeRef}`;
    }
    return '-';
  }

  get latLng(): [number, number] | undefined {
    const { gpsLatitude, gpsLatitudeRef, gpsLongitude, gpsLongitudeRef } = this;
    if (gpsLongitude && gpsLatitude && gpsLatitudeRef && gpsLongitudeRef) {
      const mapCoord = (coord: string, index: number) => {
        switch (index) {
          case 1: {
            return Number.parseInt(coord) / 60;
          }
          case 2: {
            return Number.parseInt(coord) / 360_000;
          }
          default: {
            return Number.parseInt(coord);
          }
        }
      };

      let nLongitude = gpsLongitude
        .split(' ')
        .map((coord, index) => mapCoord(coord, index))
        .reduce((accumulator, current) => accumulator + current, 0);

      let nLatitude = gpsLatitude
        .split(' ')
        .map((coord, index) => mapCoord(coord, index))
        .reduce((accumulator, current) => accumulator + current, 0);

      if (gpsLongitudeRef === 'W') {
        nLongitude *= -1;
      }

      if (gpsLatitudeRef === 'S') {
        nLatitude *= -1;
      }

      return [nLatitude, nLongitude];
    }

    return undefined;
  }

  get displayDate() {
    return this.datetime
      .replace(/:..$/, '')
      .replaceAll('-', '/')
      .replace(' ', ' @ ');
  }

  get fNumber() {
    const { _fNumber } = this;
    const div = divide(_fNumber);
    if (Number.isNaN(div)) {
      return ' ';
    }
    return `ƒ${div.toFixed(1)}`;
  }

  get isoSpeedRatings() {
    const { _isoSpeedRatings } = this;
    if (_isoSpeedRatings) {
      return `ISO${_isoSpeedRatings}`;
    }
    return ' ';
  }

  get resolution() {
    return `${this.width}x${this.height}`;
  }

  get shutterSpeedValue() {
    const { _shutterSpeedValue } = this;
    const div = divide(_shutterSpeedValue);
    if (Number.isNaN(div)) {
      return ' ';
    }
    return `1/${Math.pow(2, div).toFixed(0)}s`;
  }

  get focalLength() {
    const { _focalLength } = this;
    const div = divide(_focalLength);
    if (Number.isNaN(div)) {
      return ' ';
    }
    return `${div}mm`;
  }

  get images() {
    const baseFile = encodeURIComponent(this.file.replace(/\.[^./]+$/, ''));
    const base = `${IMAGE_DOMAIN}/${this.album}`;
    const { x, y } = this;

    const getSize = (size: number) => {
      const widthRatio = size / x;
      let height = y;
      let width = x;
      if (widthRatio < 1) {
        height = Math.floor(y * widthRatio);
        width = Math.floor(x * widthRatio);
      }
      return {
        avif: `${base}/${baseFile}_w${size}.avif`,
        height,
        jpeg: `${base}/${baseFile}_w${size}.jpeg`,
        webp: `${base}/${baseFile}_w${size}.webp`,
        width,
      };
    };

    return {
      1280: getSize(1280),
      2560: getSize(2560),
      320: getSize(320),
      640: getSize(640),
      960: getSize(960),
    };
  }

  get make() {
    const { _make, model } = this;
    if (model && model.startsWith(_make)) {
      return '';
    }

    if (!_make && !model) {
      return '-';
    }

    if (_make) {
      return `${_make} `;
    }

    return '';
  }

  get megapixels() {
    return `${((this.width * this.height) / 1_000_000).toFixed(2)}MP`;
  }

  get x() {
    return this.width;
  }

  get y() {
    return this.height;
  }
}

export { Photo };
