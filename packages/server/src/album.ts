import { viewAlbum } from './aws.js';
import { months } from './constants.js';

import type { IAlbum, IPhoto, SqlRowAlbum } from './types.js';

const sortImages = (photoA: IPhoto, photoB: IPhoto) => {
  const dateA = new Date(photoA.datetime);
  const dateB = new Date(photoB.datetime);
  if (dateA > dateB) {
    return 1;
  }
  if (dateA < dateB) {
    return -1;
  }
  return 0;
};

class Album implements IAlbum {
  private _photos: IPhoto[] = [];
  private hasRefreshedPhotos: boolean = false;
  private readonly _count: number;
  private readonly _month: string;
  private sorted: boolean = false;
  readonly country: string;
  readonly _disabled: boolean;
  readonly name: string;
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
    this._photos.push(photo);
  }

  getPhoto(file: string) {
    return this.photos.find((photo) => photo.file === file);
  }

  async refreshExternalPhotos() {
    if (!this.hasRefreshedPhotos) {
      const externalPhotos = await viewAlbum(this.name);
      const photos: IPhoto[] = [];
      for (
        let index = 0, { length } = externalPhotos;
        index < length;
        index += 1
      ) {
        const externalPhoto = externalPhotos[index];
        const split = externalPhoto.split('/');
        if (split.length === 2) {
          const file = split[1];
          const photo = this.getPhoto(file);
          if (photo) {
            photos.push(photo);
          }
        }
      }
      this.hasRefreshedPhotos = true;
      this.sorted = false;
      this._photos = photos;
    }
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

  get photos() {
    if (!this.sorted) {
      this._photos.sort(sortImages);
      this.sorted = true;
    }
    return this._photos;
  }
}

export { Album };
