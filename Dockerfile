FROM node:20-alpine

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

ARG build

ARG AWS_S3_BUCKET
ENV AWS_S3_BUCKET ${AWS_S3_BUCKET}

ARG AWS_REGION
ENV AWS_REGION ${AWS_REGION}

ARG AWS_IDENTITY_POOL_ID
ENV AWS_IDENTITY_POOL_ID ${AWS_IDENTITY_POOL_ID}

ARG IMAGE_DOMAIN
ENV IMAGE_DOMAIN ${IMAGE_DOMAIN}

WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

COPY scripts ./scripts
COPY src ./src
COPY static ./static
COPY views ./views

RUN if [[ "$build" == "true" ]]; then \
  pnpm run build; \
  pnpm prune --prod; \
  rm -r ./src; \
fi

EXPOSE 80/tcp

CMD [ "sh", "./scripts/docker-init.sh" ]
