import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

import routes from './routes.js';

const baseUrl = process.env['baseUrl'] || '/photos';
const port = Number.parseInt(String(process.env['port'] || '80'));
const isDevelopment = process.env['NODE_ENV'] === 'development';

const app = express();

// Used for nonce to ensure it doesn't work if undefined
const rnd = randomBytes(16).toString('hex');

app.set('view engine', 'pug');
app.set('views', join(process.cwd(), 'src', 'views'));
app.use(compression());

app.use((_, response, next) => {
  response.locals['nonce'] = randomBytes(16).toString('hex');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'photos.dylan.is'],
        'script-src': [
          "'self'",
          (_, response) => `'nonce-${response.locals.nonce || rnd}'`,
        ],
        // eslint-disable-next-line unicorn/no-null
        'upgrade-insecure-requests': isDevelopment ? null : [],
      },
      useDefaults: true,
    },
  }),
);

if (baseUrl) {
  app.use(baseUrl, express.static('static', { maxAge: '1y' }));
  app.use(baseUrl, routes);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening at http://localhost:${port}${baseUrl}`);
  });
} else {
  // eslint-disable-next-line no-console
  console.error('Missing baseUrl in .env');
}
