FROM node:22-alpine as stage0

LABEL maintainer="Dylan Armstrong <dylan@dylan.is>"

ARG build

WORKDIR /app
RUN npm i -g pnpm

COPY scripts/docker-init.sh ./scripts/docker-init.sh
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY packages/client/package.json ./packages/client/package.json
COPY packages/server/package.json ./packages/server/package.json

RUN pnpm install --frozen-lockfile --prod=false

COPY packages/client/src ./packages/client/src
COPY packages/client/tailwind.config.ts packages/client/tsconfig.json packages/client/vite.config.ts ./packages/client/

COPY packages/server/src ./packages/server/src
COPY packages/server/tsconfig.json ./packages/server/

RUN if [[ "$build" == "true" ]]; then \
  pnpm run -r build; \
fi

CMD [ "sh", "./scripts/docker-init.sh" ]

FROM node:22-alpine as stage1

WORKDIR /app
RUN npm i -g pnpm

COPY --from=stage0 /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=stage0 /app/packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --prod=true

COPY --from=stage0 /app/packages/server/lib ./packages/server/lib
COPY --from=stage0 /app/packages/server/static ./packages/server/static

EXPOSE 80/tcp

CMD [ "pnpm", "run", "start" ]
