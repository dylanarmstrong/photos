#!/usr/bin/env bash

set -eEu -o pipefail

file="$1"
file_name=${file//\.jpeg/}

out="$file_name.out.png"
png="$file_name.in.png"
ppm="$file_name.ppm"

sm=512
md=1024
lg=2048

convert "$file" "$png"

# Stat command behaves differently
platform='unknown'
uname=$(uname)
if [[ "$uname" == 'Linux' ]]; then
  platform='linux'
else
  platform='osx'
fi

function convertToSize {
  size="$1"
  file_name_jpeg="$file_name-$size.jpeg"
  file_name_webp="$file_name-$size.webp"

  convert "$file" -depth 16 -gamma 0.454545 -filter lanczos -resize x"$size" -gamma 2.2 -depth 8 "$out"
  # Come out as odd jpeg files when exporting from Photos
  # So the gamma needs to be adjusted back to normal
  model=$(exiv2 -K Exif.Image.Model "$file" | awk '{$1=$2=$3=""; print $0}' | sed -e 's/^\ *//g')
  if [ "$model" == "Canon EOS Rebel T6" ]; then
    convert -gamma 2.2 "$out" "$ppm"
  else
    convert "$out" "$ppm"
  fi

  cjpeg -optimize -quality 80 -outfile "$file_name_jpeg" "$ppm"
  if [[ $platform == 'osx' ]]; then
    jpeg_size=$(stat -f%z "$file_name_jpeg")
  else
    jpeg_size=$(stat --printf "%s" "$file_name_jpeg")
  fi
  webp_size=$(echo "$jpeg_size * .7" | bc)
  cwebp -q 80 -m 6 -f 25 -hint photo -size "$webp_size" "$ppm" -o "$file_name_webp"

  rm "$ppm"
  rm "$out"
}

convertToSize $sm
convertToSize $md
convertToSize $lg

rm "$png"

rename 's/-/_/' -- *
