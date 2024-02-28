import defaults from 'defaults';

import type { Request, Response } from 'express';

import { baseUrl, isDevelopment } from './constants.js';

import type { RenderOptions } from './@types/index.js';

const getIp = (request: Request) => {
  try {
    return String(
      request.headers['x-forwarded-for'] || request.socket.remoteAddress,
    ).split(',')[0];
  } catch {
    return 'Error';
  }
};

const getDate = () => new Date().toLocaleString().replace(',', '');

const log = (request: Request, message: string) => {
  // eslint-disable-next-line no-console
  console.log(`[${getDate()}] [${getIp(request)}] ${message}`);
};

const sendStatus = (response: Response, status: number) => {
  response.status(status).render('status', {
    baseUrl,
    isDevelopment,
    nonce: response.locals['nonce'],
    status,
    year: new Date().getFullYear(),
  });
};

const render = (response: Response, page: string, object: RenderOptions) => {
  const defaultRender = {
    baseUrl,
    isDevelopment,
    nonce: response.locals['nonce'],
    status: 200,
    year: new Date().getFullYear(),
  };

  response.status(200).render(page, defaults(object, defaultRender));
};

export { log, render, sendStatus };
