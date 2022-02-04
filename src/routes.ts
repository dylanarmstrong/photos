import crypto from 'crypto';
import express from 'express';
import helmet from 'helmet';
import process from 'process';
import type { Response } from 'express';

import { defaults, log } from './utils';

import {
  getAlbums,
  getExifCache,
  isValidAlbum,
} from './albums';

import type {
  RenderOptions,
} from './@types';

import {
  viewAlbum,
} from './aws';

const albums = getAlbums();
const exifCache = getExifCache();

const { baseUrl } = process.env;

const imagesPerPage = Number.parseInt(process.env.imagesPerPage || '20');

const albumImages = new Map<string, string[]>();
const __DEV__ = process.env.MODE === 'development';
// Use the devDomain if running server:dev
const domain = __DEV__ ? process.env.devDomain : process.env.domain;

// eslint-disable-next-line new-cap
const router = express.Router();

const sendStatus = (res: Response, status: number) => {
  res
    .status(status)
    .render('status', {
      baseUrl,
      nonce: res.locals.nonce,
      status,
      year: (new Date()).getFullYear(),
    });
};

const render = (res: Response, page: string, obj: RenderOptions) => {
  const defaultRender = {
    baseUrl,
    nonce: res.locals.nonce,
    status: 200,
    year: (new Date()).getFullYear(),
  };

  res
    .status(200)
    .render(page, defaults(obj, defaultRender));
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

router.use((_, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
});

// Used for nonce to ensure it doesn't work if undefined
const rnd = crypto.randomBytes(16).toString('hex');

router.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'photos.dylan.is'],
        'script-src': [
          "'self'",
          (_, res) => `'nonce-${res.locals.nonce || rnd}'`,
        ],
        'upgrade-insecure-requests': __DEV__ ? null : [],
      },
      useDefaults: true,
    },
  }),
);

// Check that album exists
router.get('/:album*', (req, res, next) => {
  // Asterisk is not in the param name..
  const { album } = req.params as unknown as { album: string };
  if (!isValidAlbum(album)) {
    log(req, `invalid album: ${album}`);
    sendStatus(res, 404);
    return;
  }
  next();
});

router.get('/:album/:page', async (req, res) => {
  const { album } = req.params;
  const page = Number.parseInt(req.params.page, 10);
  log(req, `${album}/${page}`);

  if (Number.isNaN(page)) {
    sendStatus(res, 404);
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
    images = (await viewAlbum(album)).filter(hasExif).sort(sortImages);
    albumImages.set(album, images);
  }

  const pages = Math.ceil(images.length / imagesPerPage);

  if (page > pages || page < 1) {
    sendStatus(res, 404);
    return;
  }

  const data = images
    .slice((page - 1) * imagesPerPage, page * imagesPerPage)
    .map(mapImage);

  render(res, 'album', {
    // Display Name
    album: albums.find(({ album: folderName }) => folderName === album),
    datas: data,
    nextPage: page + 1,
    page,
    pages,
    prevPage: page - 1,
  });
});

router.get('/:album', (req, res) => {
  const { album } = req.params;
  res.redirect(`/${album}/1`);
});

router.get('/', (req, res) => {
  log(req, 'index');
  render(res, 'index', {
    albums,
  });
});

export default router;
