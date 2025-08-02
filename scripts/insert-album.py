#!/usr/bin/env python3

# /// script
# requires-python = "==3.12"
# dependencies = [
#     "pyexiv2",
#     "pillow",
# ]
# ///

import glob
import os
import re
import sqlite3
import sys
from datetime import datetime

import pyexiv2
from PIL import Image


def adapt_datetime_iso(val):
    """Adapt datetime.datetime to timezone-naive ISO 8601 date."""
    return val.isoformat()


def convert_datetime(val):
    """Convert ISO 8601 datetime to datetime.datetime object."""
    return datetime.fromisoformat(val.decode())


sqlite3.register_adapter(datetime, adapt_datetime_iso)
sqlite3.register_converter("datetime", convert_datetime)


# Usage: uv run scripts/insert.py /path/to/album
def main(argv):
    if len(argv) == 0:
        print("Usage: uv run scripts/insert.py /path/to/album")
        sys.exit(1)

    folder = argv[0]
    album = "invalid album"
    sep = os.path.sep

    path = "./images.db"
    con = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    cur = con.cursor()

    def get(data, key):
        if key in data:
            return data[key]
        return None

    # Only show error messages
    pyexiv2.set_log_level(3)

    # For counting how many rows have been inserted in this album
    count = 0
    # https://www.media.mit.edu/pia/Research/deepview/exif.html
    for file in glob.iglob(f"{folder}/*"):
        if re.match(r"(?!.*_w\d+.*)^.*?\.(jpeg|png)$", file, flags=re.IGNORECASE):
            with pyexiv2.Image(file) as img:
                pil_image = Image.open(file)

                file_split = file.split(sep)
                len_file_split = len(file_split)
                album = file_split[len_file_split - 2]
                try:
                    cur.execute(
                        """
                        insert or ignore into albums (
                            album
                        ) values (
                            ?
                        )
                        """,
                        [album],
                    )
                except Exception as e:
                    print(f"Error inserting album '{album}': {e}")

                cursor = cur.execute(
                    """
                    select id
                    from albums
                    where album = ?
                    """,
                    [album],
                )
                [album_id] = cursor.fetchone()

                file_name = file_split[len_file_split - 1]

                data = img.read_exif()
                date = get(data, "Exif.Image.DateTime")
                if date:
                    try:
                        # Uganda pictures are coming back as a tuple
                        if isinstance(date, tuple):
                            date = date[0]
                        date = datetime.strptime(str(date), "%Y:%m:%d %H:%M:%S")
                    except Exception as e:
                        print(f"Error parsing date for {file}: {e}")
                        date = None

                try:
                    cur.execute(
                        """
                        insert into images (
                            file,
                            height,
                            width,
                            album_id
                        ) values (
                            ?,
                            ?,
                            ?,
                            ?
                        )
                    """,
                        [file_name, pil_image.height, pil_image.width, album_id],
                    )

                    # For compatibility with older sqlite3, do not use returning
                    cur.execute(
                        """
                        select id
                        from images
                        where album_id = ? and file = ?
                    """,
                        [album_id, file_name],
                    )
                    [id] = cur.fetchone()

                    cur.execute(
                        """
                        insert into exif (
                            brightness_value,
                            datetime,
                            exposure_time,
                            f_number,
                            flash,
                            focal_length,
                            gps_altitude,
                            gps_altitude_ref,
                            gps_latitude,
                            gps_latitude_ref,
                            gps_longitude,
                            gps_longitude_ref,
                            iso_speed_ratings,
                            lens_make,
                            lens_model,
                            lens_specification,
                            make,
                            model,
                            pixel_x_dimension,
                            pixel_y_dimension,
                            resolution_unit,
                            shutter_speed_value,
                            x_resolution,
                            y_resolution,
                            image_id
                        ) values (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?
                        )
                    """,
                        [
                            get(data, "Exif.Photo.BrightnessValue"),
                            date,
                            get(data, "Exif.Photo.ExposureTime"),
                            get(data, "Exif.Photo.FNumber"),
                            get(data, "Exif.Photo.Flash"),
                            get(data, "Exif.Photo.FocalLength"),
                            get(data, "Exif.GPSInfo.GPSAltitude"),
                            get(data, "Exif.GPSInfo.GPSAltitudeRef"),
                            get(data, "Exif.GPSInfo.GPSLatitude"),
                            get(data, "Exif.GPSInfo.GPSLatitudeRef"),
                            get(data, "Exif.GPSInfo.GPSLongitude"),
                            get(data, "Exif.GPSInfo.GPSLongitudeRef"),
                            get(data, "Exif.Photo.ISOSpeedRatings"),
                            get(data, "Exif.Photo.LensMake"),
                            get(data, "Exif.Photo.LensModel"),
                            get(data, "Exif.Photo.LensSpecification"),
                            get(data, "Exif.Image.Make"),
                            get(data, "Exif.Image.Model"),
                            get(data, "Exif.Photo.PixelXDimension"),
                            get(data, "Exif.Photo.PixelYDimension"),
                            get(data, "Exif.Image.ResolutionUnit"),
                            get(data, "Exif.Photo.ShutterSpeedValue"),
                            get(data, "Exif.Image.XResolution"),
                            get(data, "Exif.Image.YResolution"),
                            id,
                        ],
                    )
                    count += 1
                except Exception as e:
                    print(f"Error inserting image/exif data for {file}: {e}")

    con.commit()
    con.close()

    print(f"{album}: inserted {count} rows")


if __name__ == "__main__":
    main(sys.argv[1:])
