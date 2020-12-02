#!/usr/bin/env node

const AWS = require('aws-sdk');
const compression = require('compression');
const express = require('express');

const port = 9005;
const app = express();

app.use('/photos', express.static('static'));
app.use(compression());

// Pulled from .env file
const Bucket = process.env.Bucket;
const IdentityPoolId = process.env.IdentityPoolId;
const region = process.env.region;

AWS.config.update({
  region,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId,
  })
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: { Bucket }
});

const getAlbums = async (req, res) => {
  const p = new Promise((resolve, reject) => {
    s3.listObjects({ Delimiter: '/' }, (err, data) => {
      if (err) {
        resolve([]);
      }

      const albumNames = data.CommonPrefixes.map((commonPrefix) => {
        const prefix = commonPrefix.Prefix;
        const albumName = decodeURIComponent(prefix.replace('/', ''));
        return albumName;
      });

      resolve(albumNames);
    });
  });

  const albums = await p;
  return albums;
};

const viewAlbum = async (albumName) => {
  const albumPhotosKey = encodeURIComponent(albumName) + '/';
  const getObjects = async (Marker) => {
    const p = new Promise((resolve, reject) => {
      s3.listObjects({
        Delimiter: '/',
        Marker,
        Prefix: albumPhotosKey
      }, function(err, data) {
        if (err) {
          resolve({ photos: [], IsTruncated: false, NextMarker: null });
        }

        // 'this' references the AWS.Response instance that represents the response
        const href = this.request.httpRequest.endpoint.href;
        const bucketUrl = href + Bucket + '/';

        const photos = data.Contents.map((photo) => {
          if (photo.Size === 0) {
            return null;
          }
          const { Key } = photo;
          if (Key.match(/.*_thumb\..*$/) || Key.endsWith('.zip')) {
            return null;
          }
          return Key;
        }).filter(Boolean);

        resolve({
          photos,
          IsTruncated: data.IsTruncated,
          NextMarker: data.NextMarker,
        });
      });
    });
    const data = await p;
    return data;
  };

  let photos = [];
  let data = await getObjects();
  photos.push(data.photos);
  while (data.IsTruncated) {
    data = await getObjects(data.NextMarker);
    photos.push(data.photos);
  }
  return photos.flat();
};

app.set('view engine', 'pug')

const imagesPerPage = 20;

app.get('/photos/:album/download', async (req, res) => {
  const { album } = req.params;
  res.redirect(s3.getSignedUrl(
    'getObject',
    {
      Bucket,
      Key: `${album}/all.zip`,
    },
  ));
});

let albums = {};
app.get('/photos/:album/:page', async (req, res) => {
  const { album } = req.params;
  const page = Number.parseInt(req.params.page, 10);
  let images;
  if (Object.hasOwnProperty.call(albums, album)) {
    images = albums[album];
  } else {
    images = await viewAlbum(album);
    albums[album] = images;
  }

  const signedImages = images.map(
    image => ({
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
    page,
    prevPage: page - 1,
    nextPage: page + 1,
    pages: Math.ceil(images.length / imagesPerPage),
  });
});

app.get('/photos', async (req, res) => {
  res.render('index', { albums: await getAlbums() })
});

app.listen(port, () => console.log(`Listening on ${port}`));
