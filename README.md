### Just a super, simple, spectacular S3 photo browser

1. Copy `config.example.json` to `config.json`, and update as needed.
2. Copy `albums.example.json` to `albums.json`, and update as needed.
3. `npm i`
4. `npm run server`

### S3 Folder Structure

```
.
├── turkey-2020
│   ├── IMG_0001.jpeg
│   └── IMG_0001_thumb.jpeg
└── ...
```

### List of Albums

This is hardcoded to allow specifying the visibility and the display name.

### Create Thumbnails

If necessary, install `mogrify` and `rename`.

```sh
mkdir -pv thumbs
mogrify -path thumbs -scale 256 -quality 100 *.jpeg
cd thumbs
rename 's/\.jpeg/_thumb\.jpeg/' *
cd ..
mv thumbs/* .
rmdir thumbs
```

### Demo

Running [here](https://dylan.is/photos/).

### License

This repository, specifically the source code and documentation is
provided under the MIT license.
The photos and videos on my personal site (linked above as demo)
are not licensed for any use, and all rights are reserved to me.
