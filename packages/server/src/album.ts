import { months } from './constants.js';

import type { IAlbum, IPhoto, SqlRowAlbum } from './types.js';

class Album implements IAlbum {
  private readonly _count: number;
  private readonly _month: string;
  readonly _disabled: boolean;
  readonly country: string;
  readonly name: string;
  readonly photos: IPhoto[] = [];
  readonly year: string;

  constructor(row: SqlRowAlbum) {
    this._month = row.month;
    this._count = row.count;
    this.country = row.country;
    this._disabled = row.disabled;
    this.name = row.album;
    this.year = row.year;
  }

  addPhoto(photo: IPhoto) {
    this.photos.push(photo);
  }

  get count() {
    const { length } = this.photos;
    if (length === 0) {
      return this._count;
    }
    return length;
  }

  get disabled() {
    return this._disabled === false || this.count === 0;
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
