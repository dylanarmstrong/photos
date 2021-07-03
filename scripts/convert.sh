#!/usr/bin/env bash

#set -eEu -o pipefail
set -e

file="$1"
file_name=$(echo "$file" | sed -e 's/\.jpeg//g')

out="$file_name.out.png"
png="$file_name.in.png"
ppm="$file_name.ppm"
jpeg="$file_name-thumb.jpeg"
webp="$file_name-thumb.webp"
convert "$file" "$png"
convert "$file" -depth 16 -gamma 0.454545 -filter lanczos -resize 15% -gamma 2.2 -depth 8 "$out"
# Come out as odd jpeg files when exporting from Photos
# So the gamma needs to be adjusted back to normal
make=$(exiv2 -K Exif.Image.Make "$file" | awk '{print $4}')
if [ "$make" == "Canon" ]; then
  convert -gamma 2.2 "$out" "$ppm"
else
  convert "$out" "$ppm"
fi

cjpeg -optimize -quality 80 -outfile "$jpeg" "$ppm"
#jpeg_size=$(stat -f%z "$jpeg")
jpeg_size=$(stat --printf "%s" "$jpeg")
webp_size=$(echo "$jpeg_size * .7" | bc)

cwebp -q 80 -m 6 -f 25 -hint photo -size "$webp_size" "$ppm" -o "$webp"
rm "$ppm"
rm "$png"
rm "$out"

rename 's/-thumb./_thumb./' -- *
