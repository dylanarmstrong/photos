// Single place for getting constants and accessing process.env variables
const baseUrl = '/photos';
const imagesPerPage = 20;
const isDevelopment = process.env['NODE_ENV'] === 'development';
const port = 80;
const {
  AWS_IDENTITY_POOL_ID = '',
  AWS_REGION = '',
  AWS_S3_BUCKET = '',
  IMAGE_DOMAIN = '',
} = process.env;

const months = [
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
];

export {
  AWS_IDENTITY_POOL_ID,
  AWS_REGION,
  AWS_S3_BUCKET,
  IMAGE_DOMAIN,
  baseUrl,
  imagesPerPage,
  isDevelopment,
  months,
  port,
};
