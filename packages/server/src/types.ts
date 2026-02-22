import { sizes } from './constants.js';

type Image = {
  avif: string;
  height: number;
  jpeg: string;
  webp: string;
  width: number;
};

type Images = {
  [key in (typeof sizes)[number]]: Image;
};

interface IPhoto {
  album: string;
  coord: string;
  datetime: string;
  displayDate: string;
  fNumber: string;
  file: string;
  focalLength: string;
  getSizes(page: 'album' | 'details'): string;
  getSrcSet(format: 'avif' | 'jpeg' | 'webp'): string;
  gpsLatitude: string;
  gpsLatitudeRef: string;
  gpsLongitude: string;
  gpsLongitudeRef: string;
  height: number;
  images: Images;
  isoSpeedRatings: string;
  latLng: [number, number] | undefined;
  make: string;
  megapixels: string;
  model: string;
  resolution: string;
  shutterSpeedValue: string;
  width: number;
  x: number;
  y: number;
}

interface IAlbum {
  count: number;
  country: string;
  disabled: boolean;
  header: string;
  month: string;
  name: string;
  photos: IPhoto[];
  year: string;
}

type RenderOptions =
  | {
      page: 'album';
      properties: {
        album: IAlbum;
        nextPage: number;
        page: number;
        pages: number;
        prevPage: number;
      };
    }
  | {
      page: 'details';
      properties: {
        photo: IPhoto;
        nextPage: number | undefined;
        prevPage: number | undefined;
        prevUrl: string;
      };
    }
  | {
      page: 'home';
      properties: {
        albums: IAlbum[];
      };
    };

type SqlRowAlbum = {
  album: string;
  count: number;
  country: string;
  disabled: boolean;
  month: string;
  year: string;
};

type SqlRowExif = {
  album: string;
  datetime: string;
  f_number: string;
  file: string;
  focal_length: string;
  gps_latitude: string;
  gps_latitude_ref: string;
  gps_longitude: string;
  gps_longitude_ref: string;
  height: number;
  iso_speed_ratings: string;
  make: string;
  model: string;
  shutter_speed_value: string;
  width: number;
};

export type { IAlbum, IPhoto, RenderOptions, SqlRowAlbum, SqlRowExif };
