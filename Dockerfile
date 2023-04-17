FROM node:16-alpine

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

WORKDIR /app

COPY .env images.db tsconfig.json package.json package-lock.json ./
COPY static ./static
COPY src ./src

RUN \
  apk add --no-cache --update --virtual \
    .gyp \
    g++ \
    make \
    python3 \
  && \
  npm i -g npm \
  && \
  npm ci \
  && \
  npm run build \
  && \
  apk del \
    .gyp

EXPOSE 80/tcp

CMD [ "npm", "run", "server" ]
