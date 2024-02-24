#!/usr/bin/env bash

set -eEu -o pipefail

if [ ! $# -eq 1 ]; then
  printf 'Usage: thumbs.sh folder\n'
  exit 1
fi

command -v convert >/dev/null || (echo 'convert missing, install imagemagick' && exit 1)
command -v exiv2 >/dev/null || (echo 'exiv2 missing, install exiv2' && exit 1)
command -v rename >/dev/null || (echo 'rename missing, install rename' && exit 1)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

folder=$1

cd "$folder" || exit 1

rm -- *_{163,325,650,768}.{webp,jpeg} || true
rm -- *.ppm || true
rm -- *.{in,out}.png || true

rm -- *_thumb.jpeg || true
rm -- *_thumb.webp || true
rm -- *-thumb.jpeg || true
rm -- *-thumb.webp || true

find . -type f -exec "$SCRIPT_DIR/convert.sh" "{}" \;
cd ..
