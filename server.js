#!/usr/bin/env node

const AWS = require('aws-sdk');
const compression = require('compression');
const express = require('express');

const port = 9005;
const app = express();
const imagesPerPage = 20;
const albumImages = new Map();
let albums = null;

// Pulled from .env file
const {
  Bucket,
  IdentityPoolId,
  PUBLIC_IP,
  region,
} = process.env;

const validIps = ['::1', PUBLIC_IP];

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

const getAlbums = async () => new Promise(
  (resolve) => {
    const commonPrefixMap = ({ Prefix }) => decodeURIComponent(Prefix.replace('/', ''));
    const listCb = (err, { CommonPrefixes }) => {
      if (err) {
        resolve([]);
      }
      // Album Names
      resolve(CommonPrefixes.map(commonPrefixMap));
    };

    s3.listObjects({ Delimiter: '/' }, listCb);
  },
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

app.set('view engine', 'pug');

const getIp = (req) => String(req.headers['x-forwarded-for'] || req.connection.remoteAddress);

app.post('/photos/recache', async (req, res) => {
  const ip = getIp(req);
  if (validIps.includes(ip)) {
    console.log(`[${ip}] recache`);
    albums = await getAlbums();
    albumImages.clear();
    res.sendStatus(200);
    return;
  }

  res.sendStatus(403);
});

// Check that album exists
app.get('/photos/:album*', (req, res, next) => {
  const { album } = req.params;
  if (!albums || !albums.includes(album)) {
    console.log(`[${getIp(req)}] invalid album: ${album}`);
    res.sendStatus(404);
    return;
  }
  next();
});

// Typically only briefly exists so I can send to a specific person
app.get('/photos/:album/download', async (req, res) => {
  const { album } = req.params;
  console.log(`[${getIp(req)}] ${album}/download`);
  res.redirect(s3.getSignedUrl(
    'getObject',
    {
      Bucket,
      Key: `${album}/all.zip`,
    },
  ));
});

app.get('/photos/:album/:page', async (req, res) => {
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

  const signedImages = images.map(
    (image) => ({
      // Not used at the moment
      exif: s3.getSignedUrl(
        'getObject',
        {
          Bucket,
          Key: image.replace(/\.jpeg/, '_exif.txt'),
        },
      ),
      image: s3.getSignedUrl(
        'getObject',
        {
          Bucket,
          Key: image,
        },
      ),
      thumb: s3.getSignedUrl(
        'getObject',
        {
          Bucket,
          Key: image.replace(/\./, '_thumb.'),
        },
      ),
    }),
  );

  res.render('album', {
    album,
    images: signedImages.slice((page - 1) * imagesPerPage, page * imagesPerPage),
    nextPage: page + 1,
    page,
    pages,
    prevPage: page - 1,
  });
});

app.get('/photos/:album', (req, res) => {
  const { album } = req.params;
  res.redirect(`/photos/${album}/1`);
});

app.get('/photos', (req, res) => {
  console.log(`[${getIp(req)}] index`);
  res.render('index', { albums });
});

// Fetch albums on server startup
const init = async () => {
  albums = await getAlbums();
};

app.listen(port, () => {
  console.log(`Listening on ${port}`);
  init();
});
