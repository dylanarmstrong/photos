import { IMAGE_DOMAIN } from './constants.js';

import type { IPhoto, SqlRowExif } from './@types/index.js';

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
    return `ƒ${divide(_fNumber).toFixed(1)}`;
  }

  get isoSpeedRatings() {
    const { _isoSpeedRatings } = this;
    return `ISO${_isoSpeedRatings}`;
  }

  get resolution() {
    return `${this.width}x${this.height}`;
  }

  get shutterSpeedValue() {
    const { _shutterSpeedValue } = this;
    return `1/${Math.pow(2, divide(_shutterSpeedValue)).toFixed(0)}s`;
  }

  get focalLength() {
    const { _focalLength } = this;
    return `${divide(_focalLength)}mm`;
  }

  get images() {
    const baseFile = encodeURI(this.file.replace(/\.[^./]+$/, ''));
    const base = `${IMAGE_DOMAIN}/${this.album}`;
    const { x, y } = this;
    const ratio = y / x;

    const smWidth = Math.max(256, Math.floor(192 / ratio));
    const smHeightRatio = smWidth / x;
    const smHeight = Math.floor(y * smHeightRatio);

    const mdWidth = Math.max(512, Math.floor(384 / ratio));
    const mdHeightRatio = mdWidth / x;
    const mdHeight = Math.floor(y * mdHeightRatio);

    const lgWidth = Math.max(1024, Math.floor(768 / ratio));
    const lgHeightRatio = lgWidth / x;
    const lgHeight = Math.floor(y * lgHeightRatio);

    return {
      base: {
        height: lgHeight,
        jpeg: `${base}/${baseFile}_2048.jpeg`,
        webp: `${base}/${baseFile}_2048.webp`,
        width: lgWidth,
      },
      lg: {
        height: lgHeight,
        jpeg: `${base}/${baseFile}_2048.jpeg`,
        webp: `${base}/${baseFile}_2048.webp`,
        width: lgWidth,
      },
      md: {
        height: mdHeight,
        jpeg: `${base}/${baseFile}_1024.jpeg`,
        webp: `${base}/${baseFile}_1024.webp`,
        width: mdWidth,
      },
      sm: {
        height: smHeight,
        jpeg: `${base}/${baseFile}_512.jpeg`,
        webp: `${base}/${baseFile}_512.webp`,
        width: smWidth,
      },
    };
  }

  get make() {
    const { _make, model } = this;
    if (model.startsWith(_make)) {
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
