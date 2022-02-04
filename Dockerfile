FROM node:14-alpine

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

WORKDIR /app

COPY .env ./
COPY images.db ./
COPY tsconfig.json ./
COPY package-lock.json ./
COPY package.json ./
COPY src ./src
COPY static ./static

RUN \
  apk add --no-cache --update --virtual \
    .gyp \
    g++ \
    make \
    python3 \
  && \
  npm i -g npm@8.4.0 \
  && \
  npm ci \
  && \
  npm run build \
  && \
  apk del \
    .gyp

EXPOSE 80/tcp

CMD [ "npm", "run", "server" ]
