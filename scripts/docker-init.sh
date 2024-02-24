#!/usr/bin/env sh

set -eEu -o pipefail

if [[ "$NODE_ENV" == "development" ]]; then
  pnpm run dev
else
  pnpm run start
fi
