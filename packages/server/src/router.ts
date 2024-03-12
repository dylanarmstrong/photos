import express from 'express';

import { baseUrl, imagesPerPage } from './constants.js';
import { getAlbums } from './database.js';
import { log } from './utils.js';
import { render, sendStatus } from './render.js';

const albums = getAlbums();

const isValidAlbum = (albumName: string) =>
  albums.some(({ disabled, name }) => !disabled && name === albumName);

const getAlbum = (albumName: string) =>
  albums.find(({ name }) => name === albumName);

const getAlbumImages = async (albumName: string) => {
  const selectedAlbum = getAlbum(albumName);
  if (selectedAlbum) {
    await selectedAlbum.refreshExternalPhotos();
    return selectedAlbum.photos;
  }
  return [];
};

// eslint-disable-next-line new-cap
const router = express.Router({ caseSensitive: true, strict: true });

// Check that album exists
router.get('/:albumName*', (request, response, next) => {
  // Asterisk is not in the param name..
  const { albumName } = request.params as unknown as { albumName: string };
  if (!isValidAlbum(albumName)) {
    log(request, `invalid album: ${albumName}`);
    sendStatus(response, 404);
    return;
  }
  next();
});

router.get('/:albumName/:page', async (request, response) => {
  const { albumName } = request.params;
  const page = Number.parseInt(request.params.page, 10);
  log(request, `${albumName}/${page}`);

  if (Number.isNaN(page)) {
    sendStatus(response, 404);
    return;
  }

  const photos = await getAlbumImages(albumName);
  const pages = Math.ceil(photos.length / imagesPerPage);

  if (page > pages || page < 1) {
    sendStatus(response, 404);
    return;
  }

  const selectedAlbum = getAlbum(albumName);
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

router.get('/:albumName/details/:index', async (request, response) => {
  const { albumName, index } = request.params;
  log(request, `${albumName}/details/${index}`);

  const photos = await getAlbumImages(albumName);
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
        prevUrl: `${baseUrl}/${albumName}/${Math.floor(imageIndex / imagesPerPage) + 1}`,
      },
    });
  } else {
    sendStatus(response, 404);
  }
});

router.get('/:albumName', (request, response) => {
  const { albumName } = request.params;
  response.redirect(`${baseUrl}/${albumName}/1`);
});

router.get('/:albumName/', (request, response) => {
  const { albumName } = request.params;
  response.redirect(`${baseUrl}/${albumName}/1`);
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
