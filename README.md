### Just a super, simple, spectacular S3 photo browser

1. Update `.env` following `env.example`.
2. `npm i`
3. `npm run server`

### S3 Folder Structure

```
.
├── turkey-2020
│   ├── IMG_0001.jpeg
│   └── IMG_0001_thumb.jpeg
└── ...
```

### Create Thumbnails

If necessary, install `mogrify` and `rename`.

```sh
mkdir -pv thumbs
mogrify -path thumbs -scale 256 -quality 100 *.jpeg
cd thumbs
rename 's/\.jpeg/_thumb\.jpeg/' *
```

### Demo

Running [here](https://dylan.is/photos/).
