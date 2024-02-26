import express from 'express';

import { getAlbums, getExifCache } from './database.js';
import { IMAGE_DOMAIN, imagesPerPage } from './constants.js';
import { log, render, sendStatus } from './utils.js';
import { viewAlbum } from './aws.js';

const albums = getAlbums();
const exifCache = getExifCache(albums);

const isValidAlbum = (albumName: string) =>
  albums.some(({ album, disabled }) => !disabled && albumName === album);

const albumImages = new Map<string, string[]>();

const mapImage = (image: string) => {
  const [splitAlbum, splitFile] = image.split('/');
  const baseFile = splitFile.replace(/.jpe?g/i, '');
  const exif = exifCache[splitAlbum][splitFile];
  const base = `${IMAGE_DOMAIN}/${splitAlbum}`;
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
};

const getAlbumImages = async (album: string) => {
  let images: string[] = [];
  if (albumImages.has(album)) {
    // Oh typescript and your silly missing map .has assertions
    // https://github.com/microsoft/TypeScript/issues/9619
    const _images = albumImages.get(album);
    if (_images) {
      images = _images;
    }
  } else {
    const cache = exifCache[album];
    const sortImages = (a: string, b: string) => {
      const [, fileA] = a.split('/');
      const [, fileB] = b.split('/');
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
    const hasExif = (exifAlbum: string) => {
      const [, file] = exifAlbum.split('/');
      return !!cache[file];
    };
    const allImages = await viewAlbum(album);
    images = allImages.filter((image) => hasExif(image)).sort(sortImages);
    albumImages.set(album, images);
  }
  return images;
};

// eslint-disable-next-line new-cap
const router = express.Router();

// Check that album exists
router.get('/:album*', (request, response, next) => {
  // Asterisk is not in the param name..
  const { album } = request.params as unknown as { album: string };
  if (!isValidAlbum(album)) {
    log(request, `invalid album: ${album}`);
    sendStatus(response, 404);
    return;
  }
  next();
});

router.get('/:album/:page', async (request, response) => {
  const { album } = request.params;
  const page = Number.parseInt(request.params.page, 10);
  log(request, `${album}/${page}`);

  if (Number.isNaN(page)) {
    sendStatus(response, 404);
    return;
  }

  const images = await getAlbumImages(album);
  const pages = Math.ceil(images.length / imagesPerPage);

  if (page > pages || page < 1) {
    sendStatus(response, 404);
    return;
  }

  const data = images
    .slice((page - 1) * imagesPerPage, page * imagesPerPage)
    .map((image) => mapImage(image));

  render(response, 'album', {
    // Display Name
    album: albums.find(({ album: folderName }) => folderName === album),
    datas: data,
    nextPage: page + 1,
    page,
    pages,
    prevPage: page - 1,
  });
});

router.get('/:album', (request, response) => {
  const { album } = request.params;
  response.redirect(`/${album}/1`);
});

router.get('/', async (request, response) => {
  log(request, 'index');
  render(response, 'index', {
    albums,
  });
});

export { router };
