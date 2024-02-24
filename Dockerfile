FROM node:20-alpine

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

RUN npm i -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json .env ./
RUN pnpm install --frozen-lockfile

COPY src ./src
COPY scripts ./scripts
COPY static ./static
COPY images.db ./

RUN if [[ "$build" == "true" ]]; then \
  pnpm run build; \
  pnpm prune --prod; \
fi

EXPOSE 80/tcp

CMD [ "sh", "./scripts/docker-init.sh" ]
