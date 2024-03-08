import compression from 'compression';
import express from 'express';
import helmet from 'helmet';

import { router } from './router.js';
import { baseUrl, developmentPort, isDevelopment, port } from './constants.js';

const app = express();

app.set('strict routing', true);
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'connect-src': isDevelopment
          ? [`ws://localhost:${developmentPort}/`]
          : [],
        'font-src': isDevelopment
          ? ["'self'", `localhost:${developmentPort}`]
          : ["'self'"],
        'img-src': isDevelopment
          ? [
              "'self'",
              "data:",
              'photos.dylan.is',
              'a.basemaps.cartocdn.com',
              'b.basemaps.cartocdn.com',
              'c.basemaps.cartocdn.com',
              'd.basemaps.cartocdn.com',
              `localhost:${developmentPort}/`,
            ]
          : [
              "'self'",
              "data:",
              'photos.dylan.is',
              'a.basemaps.cartocdn.com',
              'b.basemaps.cartocdn.com',
              'c.basemaps.cartocdn.com',
              'd.basemaps.cartocdn.com',
            ],
        'script-src': isDevelopment
          ? ["'self'", `localhost:${developmentPort}/`]
          : ["'self'"],
        // eslint-disable-next-line unicorn/no-null
        'upgrade-insecure-requests': isDevelopment ? null : [],
      },
      useDefaults: true,
    },
  }),
);

if (baseUrl) {
  app.use(`${baseUrl}/static`, express.static('static', { maxAge: '1y' }));
  app.use(`${baseUrl}/`, router);

  // If vite resources try and load something, it may hit this (Leaflet)
  // So redirect to appropiate place
  if (isDevelopment) {
    app.get('/@fs/*', (request, response) => {
      const { path } = request;
      response.redirect(`http://localhost:${developmentPort}${path}`);
    });
  }

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening at http://localhost:${port}${baseUrl}/`);
  });
} else {
  // eslint-disable-next-line no-console
  console.error('Missing baseUrl in .env');
}
