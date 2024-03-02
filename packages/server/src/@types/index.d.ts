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
  latitude: string;
  latitudeRef: string;
  longitude: string;
  longitudeRef: string;
  make: string;
  model: string;
  resolution: string;
  x: number;
  y: number;
};

type Image = {
  height: number;
  jpeg: string;
  webp: string;
  width: number;
};

type AlbumRenderData = {
  base: string;
  exif: Exif;
  image: string;
  images: {
    lg: Image;
    md: Image;
    sm: Image;
  };
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

export type { Album, ExifCache, GetObjects, RenderOptions, SqlRow };
