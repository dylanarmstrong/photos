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

export { filterUndefined, log };
