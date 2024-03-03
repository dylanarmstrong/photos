type Image = {
  height: number;
  jpeg: string;
  webp: string;
  width: number;
};

type Images = {
  base: Image;
  lg: Image;
  md: Image;
  sm: Image;
};

interface IPhoto {
  album: string;
  coord: string;
  datetime: string;
  displayDate: string;
  fNumber: string;
  file: string;
  focalLength: string;
  gpsLatitude: string;
  gpsLatitudeRef: string;
  gpsLongitude: string;
  gpsLongitudeRef: string;
  height: number;
  images: Images;
  isoSpeedRatings: string;
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
  album: string;
  count: number;
  country: string;
  disabled: boolean;
  header: string;
  month: string;
  photos: IPhoto[];
  year: string;
}

type SqlRowAlbum = {
  album: string;
  count: number;
  country: string;
  disabled: boolean;
  month: string;
  year: string;
};

type SqlRowExif = {
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

type GetObjects = {
  IsTruncated: boolean;
  NextContinuationToken?: string;
  photos: string[];
};

export type { GetObjects, IAlbum, IPhoto, SqlRowAlbum, SqlRowExif };
