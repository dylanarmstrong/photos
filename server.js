#!/usr/bin/env node

const AWS = require('aws-sdk');
const compression = require('compression');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const config = require('./config');

const app = express();
let albums = [];
const albumImages = new Map();
const __DEV__ = process.env.MODE === 'development';

const setAlbums = () => {
  albums = JSON.parse(fs.readFileSync(path.join(__dirname, 'albums.json')));
};

setAlbums();

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

          if (Key.match(/.*_thumb\..*$/) || Key.match(/.*_exif\..*$/) || Key.endsWith('.zip')) {
            return null;
          }

          return Key;
        };


        const photos = Contents.map(photoMap).filter(Boolean);

        /*
        for (let i = 0, len = photos.length; i < len; i++) {
          const photo = photos[i];
          s3.getObject({
            Bucket,
            Key: photo,
          }, (_, data) => {
            const objectData = data.Body;
            const folder = `/tmp/photos/${albumName}`;
            fs.mkdir(folder, { recursive: true }, () => undefined);
            const fileName = `${folder}/${photo.split('/')[1]}`;
            fs.writeFile(fileName, objectData, (err) => {
              if (!err) {
                const output = String(execSync(`exiv2 \
                  -K Exif.Image.Make \
                  -K Exif.Image.Model \
                  -K Exif.Image.DateTime \
                  -K Exif.Photo.PixelXDimension \
                  -K Exif.Photo.PixelYDimension \
                  -K Exif.GPSInfo.GPSLatitudeRef \
                  -K Exif.GPSInfo.GPSLatitude \
                  -K Exif.GPSInfo.GPSLongitudeRef \
                  -K Exif.GPSInfo.GPSLongitude \
                  -K Exif.GPSInfo.GPSAltitudeRef \
                  -K Exif.GPSInfo.GPSAltitude \
                  "${fileName}"`,
                  {
                    stdio: ['ignore', 'pipe', 'ignore'],
                  },
                ))
                  .split('\n')
                  .filter(s => s !== '');

                const exif = {};
                output.forEach((line) => {
                  const key = line.match(/([\.a-zA-Z]*)/)[0];
                  const value = line.replace(/([\.a-zA-Z]* *[a-zA-Z]* *[a-zA-Z0-9]* *)/, '')
                  exif[key] = value;
                });
                console.log(exif);
                console.log('\n');
              }
            });
          });
        }
        */

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

const getIp = (req) => String(req.headers['x-forwarded-for'] || req.connection.remoteAddress);

app.set('view engine', 'pug');

app.post(`${baseUrl}/recache`, (req, res) => {
  const ip = getIp(req);
  if (ip === PUBLIC_IP || __DEV__) {
    console.log(`[${ip}] recache`);
    setAlbums();
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
    console.log(`[${getIp(req)}] invalid album: ${album}`);
    res.sendStatus(404);
    return;
  }
  next();
});

// Typically only briefly exists so I can send to a specific person
app.get(`${baseUrl}/:album/download`, (req, res) => {
  const { album } = req.params;
  console.log(`[${getIp(req)}] ${album}/download`);
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
  console.log(`[${getIp(req)}] ${album}/${page}`);

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

  const data = images.map(
    (image) => ({
      image: `https://${domain}/${image}`,
      thumb: `https://${domain}/${image.replace(/\./, '_thumb.')}`,
    }),
  );

  res.render('album', {
    // Display Name
    album: albums.find(({ album: folderName }) => folderName === album),
    datas: data.slice((page - 1) * imagesPerPage, page * imagesPerPage),
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
  console.log(`[${getIp(req)}] index`);
  res.render('index', {
    albums,
    year: (new Date()).getFullYear(),
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port} at ${baseUrl}.`);
});
