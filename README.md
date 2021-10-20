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
│   └── IMG_0001_thumb.webp
│   └── IMG_0001_thumb.jpeg
└── ...
```

### Docker

```
docker build -t dylanarms/photos .
docker run -d -p <host port>:<container port> --name photos dylanarms/photos
```

### List of Albums

This is hardcoded to allow specifying the visibility and the display name.

### Create Thumbnails

Use `thumbs.sh`

```sh
cd /tmp/photos
bash ~/scripts/thumbs.sh turkey-2020
```

### Exif Data

To load exif data, download all images to an album directory, then run:

```sh
python3 -m venv venv
. venv/bin/activate
python3 -m pip install pyexiv2 pillow
python3 scripts/setup-db.py
python3 scripts/insert.py /tmp/photos/turkey-2020
```

### Demo

Running [here](https://dylan.is/photos/).

### License

The underlying source code for this application is provided under
the [ISC](LICENSE) license.

All files on my personal site, linked above as demo, are not
included under this license, and all rights are reserved to me.
