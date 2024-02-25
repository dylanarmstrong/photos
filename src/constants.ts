// Single place for getting constants and accessing process.env variables
const baseUrl = '/photos';
const imagesPerPage = 20;
const isDevelopment = process.env['NODE_ENV'] === 'development';
const port = 80;
const {
  AWS_IDENTITY_POOL_ID = '',
  AWS_REGION = '',
  AWS_S3_BUCKET = '',
  IMAGE_DOMAIN,
} = process.env;

export {
  AWS_IDENTITY_POOL_ID,
  AWS_REGION,
  AWS_S3_BUCKET,
  IMAGE_DOMAIN,
  baseUrl,
  imagesPerPage,
  isDevelopment,
  port,
};
