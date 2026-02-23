// Single place for getting constants and accessing process.env variables
const { TOKEN_KEY } = process.env;

const baseUrl = '/photos';
const developmentPort = 5173;
const imageDomain = 'https://photos.dylan.is';
const imagesPerPage = 20;
const isDevelopment = process.env['NODE_ENV'] === 'development';
const port = 80;
const tokenExpiration = 3600;

const sizes = Object.freeze([320, 640, 960, 1280, 2560] as const);

const months = Object.freeze([
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]);

export {
  TOKEN_KEY,
  baseUrl,
  developmentPort,
  imageDomain,
  imagesPerPage,
  isDevelopment,
  months,
  port,
  sizes,
  tokenExpiration,
};
