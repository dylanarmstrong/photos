#!/usr/bin/env bash

set -eEu -o pipefail

if [ ! $# -eq 1 ]; then
  printf 'Usage: thumbs.sh folder\n'
  exit 1
fi

command -v convert >/dev/null || (echo 'convert missing, install imagemagick' && exit 1)
command -v exiftool >/dev/null || (echo 'exiftool missing, install exiftool' && exit 1)
command -v fd >/dev/null || (echo 'fd missing, install fd' && exit 1)
command -v rename >/dev/null || (echo 'rename missing, install rename' && exit 1)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

folder=$1

cd "$folder" || exit 1

rm -- *_{512,1024,2048}.{webp,jpeg} || true
rm -- *-{512,1024,2048}.{webp,jpeg} || true
rm -- *.ppm || true
rm -- *.{in,out}.png || true

rm -- *_thumb.jpeg || true
rm -- *_thumb.webp || true
rm -- *-thumb.jpeg || true
rm -- *-thumb.webp || true

fd -t f --threads=1 -x "$SCRIPT_DIR/convert.sh" "{}" \;

cd ..
