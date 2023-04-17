import compression from 'compression';
import express from 'express';
import path from 'path';
import process from 'process';
import 'dotenv/config';

import routes from './routes';

const { baseUrl } = process.env;

(() => {
  const app = express();

  const __DEV__ = process.env.MODE === 'development';
  // Use the devPort if running server:dev
  const port = __DEV__ ? process.env.devPort : process.env.port;

  app.disable('etag');
  app.set('views', path.join(process.cwd(), 'src', 'views'));
  app.set('view engine', 'pug');
  app.use(compression());

  if (baseUrl) {
    app.use(baseUrl, express.static('static'));
    app.use(baseUrl, routes);
  } else {
    console.error('Missing baseUrl in .env');
    return;
  }

  app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}${baseUrl}`);
  });
})();
