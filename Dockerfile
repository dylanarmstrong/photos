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

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY scripts ./scripts
COPY packages ./packages

RUN pnpm install --frozen-lockfile --prod=false

RUN if [[ "$build" == "true" ]]; then \
  pnpm run -r build; \
  pnpm prune --prod; \
fi

EXPOSE 80/tcp

CMD [ "sh", "./scripts/docker-init.sh" ]
