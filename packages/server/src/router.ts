import express from 'express';

import { getAlbums, getExifCache } from './database.js';
import { IMAGE_DOMAIN, baseUrl, imagesPerPage } from './constants.js';
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

  const smWidth = Math.max(256, Math.floor(192 / ratio));
  const smHeightRatio = smWidth / x;
  const smHeight = Math.floor(y * smHeightRatio);

  const mdWidth = Math.max(512, Math.floor(384 / ratio));
  const mdHeightRatio = mdWidth / x;
  const mdHeight = Math.floor(y * mdHeightRatio);

  const lgWidth = Math.max(1024, Math.floor(768 / ratio));
  const lgHeightRatio = lgWidth / x;
  const lgHeight = Math.floor(y * lgHeightRatio);

  return {
    base: splitFile,
    exif,
    image: `${base}/${splitFile}`,
    images: {
      lg: {
        height: lgHeight,
        jpeg: `${base}/${baseFile}_2048.jpeg`,
        webp: `${base}/${baseFile}_2048.webp`,
        width: lgWidth,
      },
      md: {
        height: mdHeight,
        jpeg: `${base}/${baseFile}_1024.jpeg`,
        webp: `${base}/${baseFile}_1024.webp`,
        width: mdWidth,
      },
      sm: {
        height: smHeight,
        jpeg: `${base}/${baseFile}_512.jpeg`,
        webp: `${base}/${baseFile}_512.webp`,
        width: smWidth,
      },
    },
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
const router = express.Router({ caseSensitive: true, strict: true });

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

  const selectedAlbum = albums.find(
    ({ album: folderName }) => folderName === album,
  );
  if (album) {
    render(response, 'album', {
      // Display Name
      album: selectedAlbum,
      datas: data,
      nextPage: page + 1,
      page,
      pages,
      prevPage: page - 1,
    });
  } else {
    sendStatus(response, 404);
  }
});

router.get('/:album/details/:index', async (request, response) => {
  const { album, index } = request.params;
  log(request, `${album}/details/${index}`);

  const images = await getAlbumImages(album);
  const imageIndex = Number.parseInt(index);

  if (
    Number.isNaN(imageIndex) ||
    imageIndex > images.length ||
    imageIndex < 0
  ) {
    sendStatus(response, 404);
    return;
  }

  const image = images[imageIndex];
  const selectedAlbum = albums.find(
    ({ album: folderName }) => folderName === album,
  );
  if (selectedAlbum && image) {
    render(response, 'details', {
      album: selectedAlbum,
      data: mapImage(image),
      nextPage: imageIndex < images.length - 1 ? imageIndex + 1 : undefined,
      prevPage: imageIndex > 0 ? imageIndex - 1 : undefined,
      prevUrl: `${baseUrl}/${album}/${Math.floor(imageIndex / imagesPerPage) + 1}`,
    });
  } else {
    sendStatus(response, 404);
  }
});

router.get('/:album', (request, response) => {
  const { album } = request.params;
  response.redirect(`/${album}/1`);
});

router.get('/', async (request, response, next) => {
  if (request.originalUrl.at(-1) !== '/') {
    next();
    return;
  }
  log(request, 'index');
  render(response, 'index', {
    albums,
  });
});

router.get('/', (_, response) => {
  response.redirect(`${baseUrl}/`);
});

export { router };
