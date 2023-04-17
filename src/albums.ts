import fs from 'fs';
import path from 'path';
import sqlite from 'better-sqlite3';
import type { Database } from 'better-sqlite3';

import { defaults } from './utils';

import type { Album, ExifCache, SqlRow } from './@types';

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
  fields.forEach((key, type) => {
    if (result) {
      const good =
        Object.hasOwnProperty.call(value, key) &&
        typeof (value as { [key: string]: unknown })[key] === type;
      if (!good) {
        result = false;
      }
    }
  });
  return result;
};

let albums: Album[] = [];
let exifCache: ExifCache = {};
let db: Database;

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

const mapAlbum = (album: Album) => defaults(album, defaultAlbum);

const setAlbums = () => {
  albums = JSON.parse(
    String(fs.readFileSync(path.join(process.cwd(), 'src', 'data.json'))),
  ).map(mapAlbum);
};

const populateExifCache = () => {
  exifCache = {};

  if (!db) {
    if (fs.existsSync('./images.db')) {
      db = sqlite('./images.db', {});
    } else {
      albums.forEach(({ album }) => {
        exifCache[album] = {};
      });
      return;
    }
  }

  const exifStmt = db.prepare(`
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

  albums.forEach(({ album }) => {
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

      if (model.startsWith(make)) {
        make = '';
      } else {
        make = `${make} `;
      }

      if (!make && !model) {
        make = '-';
      }

      const displayDate = datetime
        .replace(/:..$/, '')
        .replace(/-/g, '/')
        .replace(' ', ' @ ');

      let coord = '-';
      if (
        gps_latitude &&
        gps_latitude_ref &&
        gps_longitude &&
        gps_longitude_ref
      ) {
        coord = `${gps_latitude.replace(
          /([0-9]+)\/1 ([0-9]+)\/1 ([0-9]{2}).*$/,
          '$1˚$2\'$3"',
        )} ${gps_latitude_ref}, ${gps_longitude.replace(
          /([0-9]+)\/1 ([0-9]+)\/1 ([0-9]{2}).*$/,
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

    exifStmt.all(album).forEach(eachRow);
  });
};

setAlbums();
populateExifCache();

export { getAlbums, getExifCache, isValidAlbum };
