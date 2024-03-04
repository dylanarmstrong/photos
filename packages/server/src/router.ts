import express from 'express';

import { baseUrl, imagesPerPage } from './constants.js';
import { getAlbums } from './database.js';
import { log } from './utils.js';
import { render, sendStatus } from './render.js';

const albums = getAlbums();

const isValidAlbum = (albumName: string) =>
  albums.some(({ album, disabled }) => !disabled && albumName === album);

const getAlbum = (albumName: string) =>
  albums.find(({ album }) => album === albumName);

const getAlbumImages = async (album: string) => {
  const selectedAlbum = getAlbum(album);
  if (selectedAlbum) {
    await selectedAlbum.refreshExternalPhotos();
    return selectedAlbum.photos;
  }
  return [];
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

  const photos = await getAlbumImages(album);
  const pages = Math.ceil(photos.length / imagesPerPage);

  if (page > pages || page < 1) {
    sendStatus(response, 404);
    return;
  }

  const selectedAlbum = albums.find(
    ({ album: folderName }) => folderName === album,
  );

  if (selectedAlbum) {
    render(response, {
      page: 'album',
      properties: {
        album: selectedAlbum,
        nextPage: page + 1,
        page,
        pages,
        prevPage: page - 1,
      },
    });
  } else {
    sendStatus(response, 404);
  }
});

router.get('/:album/details/:index', async (request, response) => {
  const { album, index } = request.params;
  log(request, `${album}/details/${index}`);

  const photos = await getAlbumImages(album);
  const imageIndex = Number.parseInt(index);

  if (
    Number.isNaN(imageIndex) ||
    imageIndex > photos.length ||
    imageIndex < 0
  ) {
    sendStatus(response, 404);
    return;
  }

  const photo = photos[imageIndex];
  if (photo) {
    render(response, {
      page: 'details',
      properties: {
        nextPage: imageIndex < photos.length - 1 ? imageIndex + 1 : undefined,
        photo,
        prevPage: imageIndex > 0 ? imageIndex - 1 : undefined,
        prevUrl: `${baseUrl}/${album}/${Math.floor(imageIndex / imagesPerPage) + 1}`,
      },
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
  log(request, 'home');
  render(response, {
    page: 'home',
    properties: {
      albums,
    },
  });
});

router.get('/', (_, response) => {
  response.redirect(`${baseUrl}/`);
});

export { router };
