import defaults from 'defaults';
import express from 'express';

import type { Response } from 'express';

import { log } from './utils.js';
import { getAlbums, getExifCache } from './database.js';
import { viewAlbum } from './aws.js';

import type { RenderOptions } from './@types/index.js';

const albums = getAlbums();
const exifCache = getExifCache(albums);

const isValidAlbum = (albumName: string) =>
  albums.some(({ album, disabled }) => !disabled && albumName === album);

const { baseUrl } = process.env;

const imagesPerPage = Number.parseInt(process.env['imagesPerPage'] || '20');

const albumImages = new Map<string, string[]>();
const __DEV__ = process.env['NODE_ENV'] === 'development';
// Use the devDomain if running server:dev
const domain = __DEV__ ? process.env['devDomain'] : process.env['domain'];

// eslint-disable-next-line new-cap
const router = express.Router();

const sendStatus = (response: Response, status: number) => {
  response.status(status).render('status', {
    baseUrl,
    nonce: response.locals['nonce'],
    status,
    year: new Date().getFullYear(),
  });
};

const render = (response: Response, page: string, object: RenderOptions) => {
  const defaultRender = {
    baseUrl,
    nonce: response.locals['nonce'],
    status: 200,
    year: new Date().getFullYear(),
  };

  response.status(200).render(page, defaults(object, defaultRender));
};

const mapImage = (image: string) => {
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
};

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

  let images: string[] = [];
  if (albumImages.has(album)) {
    // Oh typescript and your silly missing .map assertions
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

router.get('/', (request, response) => {
  log(request, 'index');
  render(response, 'index', {
    albums,
  });
});

export default router;
