interface IPhoto {
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

type Image = {
  height: number;
  jpeg: string;
  webp: string;
  width: number;
};

type AlbumRenderData = {
  base: string;
  exif: IPhoto;
  image: string;
  images: {
    lg: Image;
    md: Image;
    sm: Image;
  };
};

type File = {
  [key: string]: IPhoto;
};

type ExifCache = {
  [key: string]: File;
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

type RenderOptions = Partial<{
  album: IAlbum;
  albums: IAlbum[];
  data: AlbumRenderData;
  datas: AlbumRenderData[];
  nextPage: number;
  page: number;
  pages: number;
  prevPage: number;
  prevUrl: string;
}>;

type GetObjects = {
  IsTruncated: boolean;
  NextContinuationToken?: string;
  photos: string[];
};

export type {
  AlbumRenderData,
  ExifCache,
  GetObjects,
  IAlbum,
  IPhoto,
  RenderOptions,
  SqlRowAlbum,
  SqlRowExif,
};
