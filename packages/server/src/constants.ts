// Single place for getting constants and accessing process.env variables
const baseUrl = '/photos';
const developmentPort = 5173;
const imagesPerPage = 20;
const isDevelopment = process.env['NODE_ENV'] === 'development';
const port = 80;
const {
  IMAGE_DOMAIN = '',
  R2_BUCKET = '',
  R2_ENDPOINT = '',
  R2_SECRET = '',
  R2_TOKEN = '',
} = process.env;

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
  IMAGE_DOMAIN,
  R2_BUCKET,
  R2_ENDPOINT,
  R2_SECRET,
  R2_TOKEN,
  baseUrl,
  developmentPort,
  imagesPerPage,
  isDevelopment,
  months,
  port,
  sizes,
};
