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

- Clean stuff up
- Remove AWS permissions on original photos
- Reprocess all photos for new size I want here
- Update README with more DB information

### Database

```sql
table exif (
    id integer primary key,

    -- Exif.Photo.BrightnessValue,
    brightness_value text,

    -- Exif.Image.DateTime
    datetime timestamp,

    -- Exif.Photo.ExposureTime,
    exposure_time text,

    -- Exif.Photo.FNumber,
    f_number text,

    -- Exif.Photo.Flash,
    flash integer,

    -- Exif.Photo.FocalLength,
    focal_length text,

    -- Exif.GPSInfo.GPSAltitude,
    gps_altitude text,

    -- Exif.GPSInfo.GPSAltitudeRef,
    gps_altitude_ref text,

    -- Exif.GPSInfo.GPSLatitude,
    gps_latitude text,

    -- Exif.GPSInfo.GPSLatitudeRef,
    gps_latitude_ref text,

    -- Exif.GPSInfo.GPSLongitude,
    gps_longitude text,

    -- Exif.GPSInfo.GPSLongitudeRef,
    gps_longitude_ref text,

    -- Exif.Photo.ISOSpeedRatings,
    iso_speed_ratings text,

    -- Exif.Photo.LensMake,
    lens_make text,

    -- Exif.Photo.LensModel,
    lens_model text,

    -- Exif.Photo.LensSpecification,
    lens_specification text,

    -- Exif.Image.Make,
    make text,

    -- Exif.Image.Model,
    model text,

    -- Exif.Photo.PixelXDimension,
    pixel_x_dimension text,

    -- Exif.Photo.PixelYDimension,
    pixel_y_dimension text,

    -- Exif.Image.ResolutionUnit,
    resolution_unit text,

    -- Exif.Photo.ShutterSpeedValue,
    shutter_speed_value text,

    -- Exif.Image.XResolution,
    x_resolution text,

    -- Exif.Image.YResolution,
    y_resolution text,

    image_id integer,
    foreign key (image_id) references images (id) on delete cascade
)
```

### License

The underlying source code for this application is provided under
the [ISC](LICENSE) license.

All files on my personal site, linked above as demo, are not
included under this license, and all rights are reserved to me.
