import defaults from 'defaults';
import sqlite, { type Database } from 'better-sqlite3';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

import type { Album, ExifCache, SqlRow } from './@types/index.js';

const fields = new Map<string, string>();
fields.set('datetime', 'string');
fields.set('file', 'string');
fields.set('gps_latitude', 'string');
fields.set('gps_latitude_ref', 'string');
fields.set('gps_longitude', 'string');
fields.set('gps_longitude_ref', 'string');
fields.set('height', 'number');
fields.set('make', 'string');
fields.set('model', 'string');
fields.set('width', 'number');

const isSqlRow = (value: unknown): value is SqlRow => {
  let result = true;
  for (const [key, type] of fields.entries()) {
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

let albums: Album[] = [];
let exifCache: ExifCache = {};
let database: Database;

const getAlbums = () => albums;
const getExifCache = () => exifCache;

const isValidAlbum = (albumName: string) =>
  albums.some(({ album, disabled }) => !disabled && albumName === album);

const defaultAlbum = {
  album: '-',
  country: '-',
  disabled: true,
  month: '-',
  year: '-',
};

const mapAlbum = (album: Partial<Album>): Required<Album> =>
  defaults(album, defaultAlbum);

const setAlbums = () => {
  albums = JSON.parse(
    String(readFileSync(join(process.cwd(), 'src', 'data.json'))),
  )
    .map((album: Partial<Album>) => mapAlbum(album))
    .filter((album: Album) => album.album !== '-');
};

const populateExifCache = () => {
  exifCache = {};

  if (!database) {
    if (existsSync('./images.db')) {
      database = sqlite('./images.db', {});
    } else {
      for (const { album } of albums) {
        exifCache[album] = {};
      }
      return;
    }
  }

  const exifStmt = database.prepare(`
    SELECT
      i.file,
      i.height as height,
      i.width as width,
      ifnull(e.gps_latitude, '') as gps_latitude,
      ifnull(e.gps_latitude_ref, '') as gps_latitude_ref,
      ifnull(e.gps_longitude, '') as gps_longitude,
      ifnull(e.gps_longitude_ref, '') as gps_longitude_ref,
      ifnull(e.datetime, '1970-01-01 00:00:01') as datetime,
      ifnull(e.make, '') as make,
      ifnull(e.model, '') as model
    FROM images i
    JOIN exif e
    ON
      i.id = e.image
    WHERE
      album = ?
  `);

  for (const { album } of albums) {
    exifCache[album] = {};
    const eachRow = (row: unknown) => {
      if (!isSqlRow(row)) {
        return;
      }
      let { make } = row;

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
      } = row;

      make = model.startsWith(make) ? '' : `${make} `;

      if (!make && !model) {
        make = '-';
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
          /(\d+)\/1 (\d+)\/1 (\d{2}).*$/,
          '$1˚$2\'$3"',
        )} ${gps_latitude_ref}, ${gps_longitude.replace(
          /(\d+)\/1 (\d+)\/1 (\d{2}).*$/,
          '$1˚$2\'$3"',
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
        make,
        model,
        resolution,
        x: width,
        y: height,
      };
    };

    for (const albumExif of exifStmt.all(album)) {
      eachRow(albumExif);
    }
  }
};

setAlbums();
populateExifCache();

export { getAlbums, getExifCache, isValidAlbum };
