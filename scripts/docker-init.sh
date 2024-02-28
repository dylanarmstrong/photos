#!/usr/bin/env bash

set -eEu -o pipefail

if [[ "$NODE_ENV" == "development" ]]; then
  pnpm run dev
else
  pnpm run start
fi
