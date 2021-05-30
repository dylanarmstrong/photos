#!/usr/bin/env bash
if [ ! $# -eq 1 ]; then
  printf 'Usage: thumbs.sh folder\n'
  exit 1
fi

folder=$1

cd $folder
mkdir -pv thumbs
mogrify -path thumbs -scale 256 -quality 100 *.jpeg
cd thumbs
rename 's/\.jpeg/_thumb\.jpeg/' *
cd ..
mv thumbs/* .
rmdir thumbs
