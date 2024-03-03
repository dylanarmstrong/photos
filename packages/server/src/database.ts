import Database from 'better-sqlite3';

import type { Album, ExifCache, SqlRow } from './@types/index.js';
import { months } from './constants.js';

const exifFields = new Map<string, string>();
exifFields.set('datetime', 'string');
exifFields.set('f_number', 'string');
exifFields.set('file', 'string');
exifFields.set('focal_length', 'string');
exifFields.set('gps_latitude', 'string');
exifFields.set('gps_latitude_ref', 'string');
exifFields.set('gps_longitude', 'string');
exifFields.set('gps_longitude_ref', 'string');
exifFields.set('height', 'number');
exifFields.set('iso_speed_ratings', 'string');
exifFields.set('make', 'string');
exifFields.set('model', 'string');
exifFields.set('shutter_speed_value', 'string');
exifFields.set('width', 'number');

const isExifRow = (value: unknown): value is SqlRow => {
  let result = true;
  for (const [key, type] of exifFields.entries()) {
    if (result) {
      const good =
        Object.hasOwnProperty.call(value, key) &&
        typeof (value as { [key: string]: unknown })[key] === type;
      if (!good) {
        result = false;
      }
    }
  }
  return result;
};

const isAlbums = (values: unknown[]): values is Album[] =>
  Array.isArray(values) &&
  values.every(
    (value) =>
      Object.hasOwnProperty.call(value, 'album') &&
      Object.hasOwnProperty.call(value, 'count') &&
      Object.hasOwnProperty.call(value, 'country') &&
      Object.hasOwnProperty.call(value, 'disabled') &&
      Object.hasOwnProperty.call(value, 'month') &&
      Object.hasOwnProperty.call(value, 'year') &&
      typeof (value as Album).album === 'string' &&
      typeof (value as Album).count === 'number' &&
      typeof (value as Album).country === 'string' &&
      typeof (value as Album).disabled === 'number' &&
      typeof (value as Album).month === 'string' &&
      typeof (value as Album).year === 'string',
  );

const database = new Database('./images.db');
database.pragma('journal_mode = WAL');

const stmtGetAlbums = database.prepare(`
  WITH grouped AS (
    SELECT
      a.id AS id,
      COUNT(*) AS count
    FROM exif e
    JOIN images i ON i.id = e.image_id
    JOIN albums a ON a.id = i.album_id
    WHERE i.deleted = 0
    GROUP BY a.id
  )
  SELECT
    album,
    IFNULL(a.country, '-') AS country,
    IFNULL(a.disabled, 1) AS disabled,
    IFNULL(strftime('%m', a.datetime), '-') AS month,
    IFNULL(strftime('%Y', a.datetime), '-') AS year,
    IIF(a.disabled, 0, IFNULL(g.count, 0)) AS count
  FROM albums a
  FULL OUTER JOIN grouped g ON g.id = a.id
  ORDER BY a.datetime DESC
`);

const stmtGetExif = database.prepare(`
  SELECT
    i.file,
    i.height AS height,
    i.width AS width,
    IFNULL(e.gps_latitude, '') AS gps_latitude,
    IFNULL(e.gps_latitude_ref, '') AS gps_latitude_ref,
    IFNULL(e.gps_longitude, '') AS gps_longitude,
    IFNULL(e.gps_longitude_ref, '') AS gps_longitude_ref,
    IFNULL(e.datetime, '1970-01-01 00:00:01') AS datetime,
    IFNULL(e.make, '') AS make,
    IFNULL(e.model, '') AS model,
    IFNULL(e.f_number, '') AS f_number,
    IFNULL(e.iso_speed_ratings, '') AS iso_speed_ratings,
    IFNULL(e.focal_length, '') AS focal_length,
    IFNULL(e.shutter_speed_value, '') as shutter_speed_value
  FROM exif e
  JOIN images i ON i.id = e.image_id
  JOIN albums a ON a.id = i.album_id
  WHERE
    a.album = ? AND
    i.deleted = 0
`);

const getAlbums = (): Album[] => {
  const rows = stmtGetAlbums.all();
  if (isAlbums(rows)) {
    const mapMonth = (row: Album) => {
      const month = Number.parseInt(row.month);
      if (Number.isNaN(month)) {
        // Month is weird
        return row;
      }
      return {
        ...row,
        month: months[month - 1],
      };
    };
    return rows.map((row) => mapMonth(row));
  }
  return [];
};

const getExifCache = (albums: Album[]): ExifCache => {
  const exifCache: ExifCache = {};

  for (const { album } of albums) {
    exifCache[album] = {};
    const eachRow = (row: unknown) => {
      if (!isExifRow(row)) {
        return;
      }
      let { f_number, focal_length, make, shutter_speed_value } = row;

      const {
        datetime,
        file,
        gps_latitude,
        gps_latitude_ref,
        gps_longitude,
        gps_longitude_ref,
        height,
        model,
        width,
        iso_speed_ratings,
      } = row;

      make = model.startsWith(make) ? '' : `${make} `;

      if (!make && !model) {
        make = '-';
      }

      const fNumberSides = f_number
        .split('/')
        .map((value) => Number.parseInt(value));
      if (fNumberSides.length === 2) {
        f_number = String(fNumberSides[0] / fNumberSides[1]);
      }

      const shutterSpeedValues = shutter_speed_value
        .split('/')
        .map((value) => Number.parseInt(value));
      if (shutterSpeedValues.length === 2) {
        shutter_speed_value = `1/${String(Math.pow(2, shutterSpeedValues[0] / shutterSpeedValues[1]).toFixed(0))}s`;
      }

      const focalLengthSides = focal_length
        .split('/')
        .map((value) => Number.parseInt(value));
      if (focalLengthSides.length === 2) {
        focal_length = String(focalLengthSides[0] / focalLengthSides[1]);
      }

      const displayDate = datetime
        .replace(/:..$/, '')
        .replaceAll('-', '/')
        .replace(' ', ' @ ');

      let coord = '-';
      if (
        gps_latitude &&
        gps_latitude_ref &&
        gps_longitude &&
        gps_longitude_ref
      ) {
        coord = `${gps_latitude.replace(
          /(\d+)\/1 (\d+)\/1 (\d+)\/10+$/,
          (_, group1, group2, group3) =>
            `${group1}˚${group2}'${(Number.parseInt(group3) / 100).toFixed(0)}"`,
        )} ${gps_latitude_ref}, ${gps_longitude.replace(
          /(\d+)\/1 (\d+)\/1 (\d+)\/100$/,
          (_, group1, group2, group3) =>
            `${group1}˚${group2}'${(Number.parseInt(group3) / 100).toFixed(0)}"`,
        )} ${gps_longitude_ref}`;
      }

      let resolution = '-';
      if (width && height) {
        resolution = `${row.width}x${row.height}`;
      }

      exifCache[album][file] = {
        coord,
        datetime,
        displayDate,
        fNumber: f_number,
        focalLength: focal_length,
        isoSpeedRatings: iso_speed_ratings,
        latitude: gps_latitude,
        latitudeRef: gps_latitude_ref,
        longitude: gps_longitude,
        longitudeRef: gps_longitude_ref,
        make,
        megapixels: Number((row.width * row.height) / 1_000_000).toFixed(2),
        model,
        resolution,
        shutterSpeedValue: shutter_speed_value,
        x: width,
        y: height,
      };
    };

    for (const albumExif of stmtGetExif.all(album)) {
      eachRow(albumExif);
    }
  }

  return exifCache;
};

export { getAlbums, getExifCache };
