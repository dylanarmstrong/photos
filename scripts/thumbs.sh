#!/usr/bin/env bash
if [ ! $# -eq 1 ]; then
  printf 'Usage: thumbs.sh folder\n'
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

folder=$1

cd "$folder" || exit 1

rm -- *_{163,325,650,768}.{webp,jpeg}
rm -- *.ppm
rm -- *.{in,out}.png

rm -- *_thumb.jpeg
rm -- *_thumb.webp
rm -- *-thumb.jpeg
rm -- *-thumb.webp

find . -type f -exec "$SCRIPT_DIR/convert.sh" "{}" \;
cd ..
