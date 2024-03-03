import { months } from './constants.js';

import type { IAlbum, SqlRowAlbum } from './@types/index.js';

class Album implements IAlbum {
  readonly album: string;
  readonly count: number;
  readonly country: string;
  readonly disabled: boolean;
  readonly _month: string;
  readonly year: string;

  constructor(row: SqlRowAlbum) {
    this.album = row.album;
    this.count = row.count;
    this.country = row.country;
    this.disabled = row.disabled;
    this._month = row.month;
    this.year = row.year;
  }

  get header() {
    const { country, month, year } = this;
    return `${country} ${year} - ${month}`;
  }

  get month() {
    const month = Number.parseInt(this._month);
    if (Number.isNaN(month)) {
      // Month is weird
      return this._month;
    }
    return months[month - 1] || '-';
  }
}

export { Album };
