import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import { join } from 'node:path';

import routes from './routes.js';

const { baseUrl } = process.env;

const port = Number.parseInt(String(process.env['port'] ?? '80'));

const app = express();

app.disable('etag');
app.set('views', join(process.cwd(), 'src', 'views'));
app.set('view engine', 'pug');
app.use(compression());

if (baseUrl) {
  app.use(baseUrl, express.static('static'));
  app.use(baseUrl, routes);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening at http://localhost:${port}${baseUrl}`);
  });
} else {
  // eslint-disable-next-line no-console
  console.error('Missing baseUrl in .env');
}
