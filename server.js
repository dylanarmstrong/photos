#!/usr/bin/env node

/* eslint-disable camelcase */

const AWS = require('aws-sdk');
const compression = require('compression');
const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite = require('better-sqlite3');

const config = require('./config');

let db = null;

const app = express();
let albums = [];
let exifCache = {};
const albumImages = new Map();
const __DEV__ = process.env.MODE === 'development';

const setAlbums = () => {
  albums = JSON.parse(fs.readFileSync(path.join(__dirname, 'albums.json')));
};

const populateExifCache = () => {
  exifCache = {};

  if (db === null) {
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
    select
      i.file,
      ifnull(e.gps_latitude, '') as gps_latitude,
      ifnull(e.gps_latitude_ref, '') as gps_latitude_ref,
      ifnull(e.gps_longitude, '') as gps_longitude,
      ifnull(e.gps_longitude_ref, '') as gps_longitude_ref,
      ifnull(e.datetime, '') as datetime,
      ifnull(e.make, '') as make,
      ifnull(e.model, '') as model,
      ifnull(e.pixel_x_dimension, '') as pixel_x_dimension,
      ifnull(e.pixel_y_dimension, '') as pixel_y_dimension
    from images i
    join exif e
    on
      i.id = e.image
    where
      album = ?
  `);

  albums.forEach(({ album }) => {
    exifCache[album] = {};

    const rows = exifStmt.all(album);
    rows.forEach((row) => {
      let {
        datetime,
        make,
      } = row;

      const {
        file,
        model,
        gps_latitude,
        gps_latitude_ref,
        gps_longitude,
        gps_longitude_ref,
        pixel_x_dimension,
        pixel_y_dimension,
      } = row;

      if (model.startsWith(make)) {
        make = '';
      } else {
        make = `${make} `;
      }

      if (!make && !model) {
        make = '-';
      }

      if (datetime) {
        datetime = datetime
          .replace(/:..$/, '')
          .replace(/-/g, '/')
          .replace(' ', ' @ ');
      } else {
        datetime = '-';
      }

      let coord = '-';
      if (gps_latitude && gps_latitude_ref && gps_longitude && gps_longitude_ref) {
        coord = `${
          gps_latitude.replace(/([0-9]+)\/1 ([0-9]+)\/1 ([0-9]{2}).*$/, '$1˚$2\'$3"')
        } ${gps_latitude_ref}, ${
          gps_longitude.replace(/([0-9]+)\/1 ([0-9]+)\/1 ([0-9]{2}).*$/, '$1˚$2\'$3"')
        } ${gps_longitude_ref}`;
      }

      let resolution = '-';
      if (pixel_x_dimension && pixel_y_dimension) {
        resolution = `${
          row.pixel_x_dimension
        }x${
          row.pixel_y_dimension
        }`;
      }

      exifCache[album][file] = {
        coord,
        datetime,
        make,
        model,
        resolution,
        x: pixel_x_dimension,
        y: pixel_y_dimension,
      };
    });
  });
};

setAlbums();
populateExifCache();

// Pulled from .env file
const {
  Bucket,
  IdentityPoolId,
  PUBLIC_IP,
  baseUrl,
  domain,
  imagesPerPage,
  port,
  region,
} = config;

app.use('/photos', express.static('static'));
app.use(compression());

AWS.config.update({
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId,
  }),
  region,
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket },
});

const isValidAlbum = (albumName) => albums.some(
  ({ album, disabled }) => !disabled && albumName === album,
);

const viewAlbum = async (albumName) => {
  const getObjects = async (Marker) => new Promise(
    (resolve) => {
      const listCb = (err, { Contents, IsTruncated, NextMarker }) => {
        if (err) {
          resolve({ IsTruncated: false, NextMarker: null, photos: [] });
        }

        const photoMap = ({ Key, Size }) => {
          if (Size === 0) {
            return null;
          }

          // Don't show .mov, _thumb, _exif, or downloadable zip files
          if (
            Key.endsWith('.mov') ||
            Key.match(/.*_thumb\..*$/) ||
            Key.match(/.*_exif\..*$/) ||
            Key.endsWith('.zip')
          ) {
            return null;
          }

          return Key;
        };


        const photos = Contents.map(photoMap).filter(Boolean);

        resolve({
          IsTruncated,
          NextMarker,
          photos,
        });
      };

      s3.listObjects({
        Delimiter: '/',
        Marker,
        Prefix: `${encodeURIComponent(albumName)}/`,
      }, listCb);
    },
  );

  const photos = [];
  let data = await getObjects();
  photos.push(data.photos);
  while (data.IsTruncated) {
    data = await getObjects(data.NextMarker);
    photos.push(data.photos);
  }
  return photos.flat();
};

const getIp = (req) => {
  try {
    return String(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
      .split(',')[0];
  } catch (e) {
    return 'Error';
  }
};

const getDate = () => (new Date())
  .toLocaleString()
  .replace(',', '');

const log = (req, msg) => {
  console.log(`[${getDate()}] [${getIp(req)}] ${msg}`);
};

app.set('view engine', 'pug');

app.post(`${baseUrl}/recache`, (req, res) => {
  const ip = getIp(req);
  log(req, 'recache');
  if (ip === PUBLIC_IP || __DEV__) {
    setAlbums();
    populateExifCache();
    albumImages.clear();
    res.sendStatus(200);
    return;
  }

  res.sendStatus(403);
});

// Check that album exists
app.get(`${baseUrl}/:album*`, (req, res, next) => {
  const { album } = req.params;
  if (!isValidAlbum(album)) {
    log(req, `invalid album: ${album}`);
    res.sendStatus(404);
    return;
  }
  next();
});

// Typically only briefly exists so I can send to a specific person
app.get(`${baseUrl}/:album/download`, (req, res) => {
  const { album } = req.params;
  log(req, `${album}/download`);
  // Do not use cloudfront cache for this
  res.redirect(s3.getSignedUrl(
    'getObject',
    {
      Bucket,
      Key: `${album}/all.zip`,
    },
  ));
});

app.get(`${baseUrl}/:album/:page`, async (req, res) => {
  const { album } = req.params;
  const page = Number.parseInt(req.params.page, 10);
  log(req, `${album}/${page}`);

  if (Number.isNaN(page)) {
    res.sendStatus(404);
    return;
  }

  let images;
  if (albumImages.has(album)) {
    images = albumImages.get(album);
  } else {
    images = await viewAlbum(album);
    albumImages.set(album, images);
  }

  const pages = Math.ceil(images.length / imagesPerPage);

  if (page > pages || page < 1) {
    res.sendStatus(404);
    return;
  }

  const data = images
    .slice((page - 1) * imagesPerPage, page * imagesPerPage)
    .map((image) => {
      const [splitAlbum, splitFile] = image.split('/');
      const baseFile = splitFile.replace(/.jpe?g/, '');
      const exif = exifCache[splitAlbum][splitFile];
      const base = `${domain}/${splitAlbum}`;
      const hasExif = !!exif;
      let width = 256;
      if (hasExif) {
        const { x, y } = exif;
        const ratio = y / x;
        width = Math.max(256, Math.floor(192 / ratio));
      }

      return {
        exif,
        hasExif,
        image: `${base}/${splitFile}`,
        jpeg: `${base}/${baseFile}_thumb.jpeg`,
        webp: `${base}/${baseFile}_thumb.webp`,
        width,
      };
    });

  res.render('album', {
    // Display Name
    album: albums.find(({ album: folderName }) => folderName === album),
    datas: data,
    home: baseUrl,
    nextPage: page + 1,
    page,
    pages,
    prevPage: page - 1,
    year: (new Date()).getFullYear(),
  });
});

app.get(`${baseUrl}/:album`, (req, res) => {
  const { album } = req.params;
  res.redirect(`${baseUrl}/${album}/1`);
});

app.get(baseUrl, (req, res) => {
  log(req, 'index');
  res.render('index', {
    albums,
    year: (new Date()).getFullYear(),
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port} at ${baseUrl}.`);
});
