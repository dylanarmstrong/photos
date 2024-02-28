import compression from 'compression';
import etag from 'etag';
import express from 'express';
import helmet from 'helmet';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

import { router } from './routes.js';
import { baseUrl, isDevelopment, port } from './constants.js';

const app = express();

// Used for nonce to ensure it doesn't work if undefined
const rnd = randomBytes(16).toString('hex');

app.set('view engine', 'pug');
app.set('views', join(process.cwd(), 'views'));
// Remove nonces from the buffer before generating etags
app.set('etag', (body: string | Buffer, encoding?: BufferEncoding) => {
  const buffer = Buffer.from(
    String(body).replaceAll(/nonce=".*?"/g, ''),
    encoding,
  );
  return etag(buffer, { weak: false });
});
app.use(compression());

app.use((_, response, next) => {
  response.locals['nonce'] = randomBytes(16).toString('hex');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // eslint-disable-next-line unicorn/no-null
        'connect-src': isDevelopment ? ['ws://localhost:5173/'] : null,
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
  app.use(baseUrl, router);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening at http://localhost:${port}${baseUrl}`);
  });
} else {
  // eslint-disable-next-line no-console
  console.error('Missing baseUrl in .env');
}
