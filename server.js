#!/usr/bin/env node

const AWS = require('aws-sdk');
const crypto = require('crypto');
const compression = require('compression');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const path = require('path');
const sqlite = require('better-sqlite3');

const config = require('./config');

const __DEV__ = process.env.MODE === 'development';

let db = null;

const app = express();

app.use((_, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'photos.dylan.is'],
        'script-src': ["'self'", (_, res) => `'nonce-${res.locals.nonce}'`],
        'upgrade-insecure-requests': __DEV__ ? null : [],
      },
      useDefaults: true,
    },
  }),
);

app.use('/photos', express.static('static'));
app.use(compression());
app.set('view engine', 'pug');

let albums = [];
let exifCache = {};
const albumImages = new Map();

const defaults = (obj) => {
  const defaultObj = {
    album: '-',
    country: '-',
    disabled: true,
    month: '-',
    year: '-',
  };

  Object.keys(defaultObj).forEach((key) => {
    if (!Object.hasOwnProperty.call(obj, key)) {
      obj[key] = defaultObj[key];
    }
  });
  return obj;
};

const setAlbums = () => {
  albums = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'albums.json')),
  ).map(defaults);
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
    const eachRow = (row) => {
      let {
        make,
      } = row;

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
      if (gps_latitude && gps_latitude_ref && gps_longitude && gps_longitude_ref) {
        coord = `${
          gps_latitude.replace(/([0-9]+)\/1 ([0-9]+)\/1 ([0-9]{2}).*$/, '$1˚$2\'$3"')
        } ${gps_latitude_ref}, ${
          gps_longitude.replace(/([0-9]+)\/1 ([0-9]+)\/1 ([0-9]{2}).*$/, '$1˚$2\'$3"')
        } ${gps_longitude_ref}`;
      }

      let resolution = '-';
      if (width && height) {
        resolution = `${
          row.width
        }x${
          row.height
        }`;
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

// Pulled from .env file
const {
  Bucket,
  IdentityPoolId,
  PUBLIC_IP,
  baseUrl,
  imagesPerPage,
  port,
  region,
} = config;

// Use the devDomain if running server:dev
const domain = __DEV__ ? config.devDomain : config.domain;

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

const photoMap = ({ Key, Size }) => {
  if (Size === 0) {
    return null;
  }

  // Only list full size images, and not thumbnails
  if (Key.match(/(?!.*_thumb.*)^.*\.jpeg$/i)) {
    return Key;
  }
  return null;
};

const viewAlbum = async (albumName) => {
  const getObjects = async (Marker) => new Promise(
    (resolve) => {
      const listCb = (err, { Contents, IsTruncated, NextMarker }) => {
        if (err) {
          resolve({ IsTruncated: false, NextMarker: null, photos: [] });
        }

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
    const cache = exifCache[album];
    const sortImages = (a, b) => {
      const [,fileA] = a.split('/');
      const [,fileB] = b.split('/');
      const dateA = new Date(cache[fileA].datetime);
      const dateB = new Date(cache[fileB].datetime);
      if (dateA > dateB) {
        return 1;
      }
      if (dateA < dateB) {
        return -1;
      }
      return 0;
    };
    const hasExif = (album) => {
      const [,file] = album.split('/');
      return !!cache[file];
    };
    images = (await viewAlbum(album)).filter(hasExif).sort(sortImages);
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
      const baseFile = splitFile.replace(/.jpe?g/i, '');
      const exif = exifCache[splitAlbum][splitFile];
      const base = `${domain}/${splitAlbum}`;
      const { x, y } = exif;
      const ratio = y / x;
      const width = Math.max(256, Math.floor(192 / ratio));
      const heightRatio = width / x;
      const height = Math.floor(y * heightRatio);

      return {
        exif,
        height,
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
    nonce: res.locals.nonce,
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
  console.log(`Listening at http://localhost:${port}${baseUrl}`);
});
