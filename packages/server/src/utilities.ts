import { createHash } from 'node:crypto';

import { TOKEN_KEY, tokenExpiration } from './constants.js';

import type { Request } from 'express';

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

const filterUndefined = <T>(object: T | undefined): object is T =>
  object !== undefined;

const signUrl = (url: string): string => {
  if (!TOKEN_KEY) {
    return url;
  }

  const parsed = new URL(url);
  const expires = Math.floor(Date.now() / 1000) + tokenExpiration;
  const hashableBase = `${TOKEN_KEY}${parsed.pathname}${expires}`;
  const token = createHash('sha256')
    .update(hashableBase)
    .digest('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

  parsed.searchParams.set('token', token);
  parsed.searchParams.set('expires', String(expires));

  return parsed.toString();
};

export { filterUndefined, log, signUrl };
