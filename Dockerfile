FROM node:20-alpine

ARG build

ARG AWS_S3_BUCKET
ENV AWS_S3_BUCKET ${AWS_S3_BUCKET}

ARG AWS_REGION
ENV AWS_REGION ${AWS_REGION}

ARG AWS_IDENTITY_POOL_ID
ENV AWS_IDENTITY_POOL_ID ${AWS_IDENTITY_POOL_ID}

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

RUN npm i -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

COPY src ./src
COPY scripts ./scripts
COPY static ./static

RUN if [[ "$build" == "true" ]]; then \
  pnpm run build; \
  pnpm prune --prod; \
fi

EXPOSE 80/tcp

CMD [ "sh", "./scripts/docker-init.sh" ]
