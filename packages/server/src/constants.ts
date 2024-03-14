// Single place for getting constants and accessing process.env variables
const baseUrl = '/photos';
const developmentPort = 5173;
const imagesPerPage = 20;
const isDevelopment = process.env['NODE_ENV'] === 'development';
const port = 80;
const {
  AWS_IDENTITY_POOL_ID = '',
  AWS_REGION = '',
  AWS_S3_BUCKET = '',
  IMAGE_DOMAIN = '',
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
  AWS_IDENTITY_POOL_ID,
  AWS_REGION,
  AWS_S3_BUCKET,
  IMAGE_DOMAIN,
  baseUrl,
  developmentPort,
  imagesPerPage,
  isDevelopment,
  months,
  port,
  sizes,
};
