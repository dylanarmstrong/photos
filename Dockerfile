FROM node:14-alpine

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

WORKDIR /app

COPY albums.json ./
COPY config.json ./
COPY images.db ./
COPY package-lock.json ./
COPY package.json ./
COPY server.js ./
COPY static ./static
COPY views ./views

RUN \
  apk add --no-cache --update --virtual \
    .gyp \
    g++ \
    make \
    python3 \
  && \
  npm i -g npm \
  && \
  npm install \
  && \
  apk del \
    .gyp

EXPOSE 80/tcp

CMD [ "npm", "run", "server" ]
