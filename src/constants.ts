const baseUrl = '/photos';
const imagesPerPage = 20;
const isDevelopment = process.env['NODE_ENV'] === 'development';
const port = 80;

export { baseUrl, imagesPerPage, isDevelopment, port };
