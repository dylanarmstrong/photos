FROM node:16-alpine

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

RUN \
  apk add --no-cache --update --virtual \
    .gyp \
    g++ \
    make \
    python3 \
  && \
  npm i -g npm \
  && \
  apk del \
    .gyp

WORKDIR /app

COPY static ./static

COPY package.json package-lock.json ./
RUN npm ci

COPY .env tsconfig.json ./
COPY src ./src
RUN npm run build

COPY images.db ./

EXPOSE 80/tcp

CMD [ "npm", "run", "server" ]
