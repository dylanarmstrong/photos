import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { join } from 'node:path';

import { router } from './router.js';
import { baseUrl, isDevelopment, port } from './constants.js';

const app = express();

app.set('view engine', 'pug');
app.set('views', join(process.cwd(), 'views'));
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // eslint-disable-next-line unicorn/no-null
        'connect-src': isDevelopment ? ['ws://localhost:5173/'] : null,
        'img-src': isDevelopment
          ? [
              "'self'",
              'photos.dylan.is',
              'a.basemaps.cartocdn.com',
              'b.basemaps.cartocdn.com',
              'c.basemaps.cartocdn.com',
              'd.basemaps.cartocdn.com',
              'localhost:9006/',
              'localhost:5173/',
            ]
          : [
              "'self'",
              'photos.dylan.is',
              'a.basemaps.cartocdn.com',
              'b.basemaps.cartocdn.com',
              'c.basemaps.cartocdn.com',
              'd.basemaps.cartocdn.com',
              'localhost:9006/',
            ],
        'script-src': isDevelopment
          ? ["'self'", 'localhost:5173/']
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
  app.use(baseUrl, router);

  if (isDevelopment) {
    app.get('/@fs/*', (request, response) => {
      const { path } = request;
      response.redirect(`http://localhost:5173${path}`);
    });
  }

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening at http://localhost:${port}${baseUrl}`);
  });
} else {
  // eslint-disable-next-line no-console
  console.error('Missing baseUrl in .env');
}
