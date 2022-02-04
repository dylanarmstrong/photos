import type { Request } from 'express';

const getIp = (req: Request) => {
  try {
    return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress)
      .split(',')[0];
  } catch (e) {
    return 'Error';
  }
};

const getDate = () => (new Date())
  .toLocaleString()
  .replace(',', '');

const log = (req: Request, msg: string) => {
  console.log(`[${getDate()}] [${getIp(req)}] ${msg}`);
};

// Having fun with this change
// https://github.com/microsoft/TypeScript/pull/30769
const defaults = <T extends Record<string, unknown>, S extends Record<string, unknown>>(
  obj: T,
  src: S,
): S & T => {
  Object.keys(src).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'undefined' || !Object.hasOwnProperty.call(obj, key)) {
      Object.defineProperty(obj, key, {
        configurable: false,
        enumerable: true,
        value: src[key],
        writable: true,
      });
    }
  });
  return obj as S & T;
};

export {
  defaults,
  log,
};
