type Album = {
  album: string;
  count: number;
  country: string;
  disabled: boolean;
  month: string;
  year: string;
};

type Exif = {
  coord: string;
  datetime: string;
  displayDate: string;
  make: string;
  model: string;
  resolution: string;
  x: number;
  y: number;
};

type AlbumRenderData = {
  exif: Exif;
  height: number;
  image: string;
  jpeg: string;
  webp: string;
  width: number;
};

type File = {
  [key: string]: Exif;
};

type ExifCache = {
  [key: string]: File;
};

type SqlRow = {
  datetime: string;
  file: string;
  gps_latitude: string;
  gps_latitude_ref: string;
  gps_longitude: string;
  gps_longitude_ref: string;
  height: number;
  make: string;
  model: string;
  width: number;
};

type RenderOptions = Partial<{
  album: Album;
  albums: Album[];
  datas: AlbumRenderData[];
  nextPage: number;
  page: number;
  pages: number;
  prevPage: number;
}>;

type GetObjects = {
  IsTruncated: boolean;
  NextContinuationToken?: string;
  photos: string[];
};

export type { Album, ExifCache, GetObjects, RenderOptions, SqlRow };
