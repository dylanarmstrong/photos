import Database from 'better-sqlite3';

import { Album } from './album.js';
import { Photo } from './photo.js';

import type { SqlRowAlbum, SqlRowExif } from './types.js';

const exifFields = new Map<string, string>([
  ['album', 'string'],
  ['datetime', 'string'],
  ['f_number', 'string'],
  ['file', 'string'],
  ['focal_length', 'string'],
  ['gps_latitude', 'string'],
  ['gps_latitude_ref', 'string'],
  ['gps_longitude', 'string'],
  ['gps_longitude_ref', 'string'],
  ['height', 'number'],
  ['iso_speed_ratings', 'string'],
  ['make', 'string'],
  ['model', 'string'],
  ['shutter_speed_value', 'string'],
  ['width', 'number'],
]);

const isExifRow = (value: unknown): value is SqlRowExif => {
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

const isAlbums = (values: unknown[]): values is SqlRowAlbum[] =>
  Array.isArray(values) &&
  values.every(
    (value) =>
      Object.hasOwnProperty.call(value, 'album') &&
      Object.hasOwnProperty.call(value, 'count') &&
      Object.hasOwnProperty.call(value, 'country') &&
      Object.hasOwnProperty.call(value, 'disabled') &&
      Object.hasOwnProperty.call(value, 'month') &&
      Object.hasOwnProperty.call(value, 'year') &&
      typeof (value as SqlRowAlbum).album === 'string' &&
      typeof (value as SqlRowAlbum).count === 'number' &&
      typeof (value as SqlRowAlbum).country === 'string' &&
      typeof (value as SqlRowAlbum).disabled === 'number' &&
      typeof (value as SqlRowAlbum).month === 'string' &&
      typeof (value as SqlRowAlbum).year === 'string',
  );

const database = new Database('../../images.db');
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
    a.album AS album,
    i.file AS file,
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
    a.disabled = 0 AND
    i.deleted = 0
`);

const getAlbums = (): Album[] => {
  const rows = stmtGetAlbums.all();
  if (isAlbums(rows)) {
    return rows.map((row) => {
      const album = new Album(row);
      for (const albumExif of stmtGetExif.all(album.name)) {
        const eachRow = (exifRow: unknown) => {
          if (isExifRow(exifRow)) {
            album.addPhoto(new Photo(exifRow));
          }
        };
        eachRow(albumExif);
      }
      return album;
    });
  }
  return [];
};

export { getAlbums };
