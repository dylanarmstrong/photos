### Just a super, simple, spectacular S3 photo browser

1. Copy `env.example` to `.env`, and update as needed.
2. `pnpm install`
3. `pnpm run -r build && pnpm run start`

### S3 Folder Structure

```
.
├── turkey-2020
│   ├── IMG_0001.jpeg
│   └── IMG_0001_thumb.webp
│   └── IMG_0001_thumb.jpeg
└── ...
```

### Running

```
docker-compose up --build
```

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
python3 -m pip install -r requirements.txt
python3 scripts/setup-db.py
python3 scripts/insert-album.py /tmp/photos/turkey-2020
```

#### Development (Docker)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

#### Development (Non-Docker)

```bash
pnpm install
pnpm run dev
```

### Demo

Running [here](https://dylan.is/photos/).

### TODO

- Add detail page:
  - Have SVG icons for camera and such
  - Have a map via leaflet show the GPS
  - Design will be 80/20 with details on right of page
  - Reprocess all photos for new size I want here
- Fix mobile:
  - Responsive queries in tailwind

### License

The underlying source code for this application is provided under
the [ISC](LICENSE) license.

All files on my personal site, linked above as demo, are not
included under this license, and all rights are reserved to me.
