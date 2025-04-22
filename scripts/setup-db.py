#!/usr/bin/env python3

# /// script
# requires-python = "==3.12"
# ///

import sqlite3
import sys


# Run this to setup the image database
def main():
    path = "./images.db"
    version = "3"
    con = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    cur = con.cursor()

    # Check if meta table exists, if it does, we are on version >2
    try:
        cursor = cur.execute(
            """
            select value
            from meta
            where key = 'version';
            """
        )
        value = cursor.fetchone()[0]
        if value >= version:
            print("Failure: db already on version", value)
            sys.exit(1)
    except:
        pass

    cur.execute(
        """
        create table if not exists meta (
            id integer primary key,

            key text not null,
            value text not null,
            unique (key)
        )
        """
    )

    cur.execute(
        """
        insert or ignore into meta (key, value) values ('version', ?)
        """,
        [version],
    )

    cur.execute(
        """
        update meta
        set value = ?
        where key = 'version'
        """,
        [version],
    )

    cur.execute(
        """
        create table if not exists albums (
            id integer primary key,

            album text not null,
            country text,
            datetime timestamp,
            disabled integer not null default 1,

            unique (album)
        )
        """
    )

    cur.execute(
        """
        create table if not exists images (
            id integer primary key,

            deleted integer not null default 0,
            file text not null,
            height integer,
            width integer,

            album_id integer not null,

            unique (album_id, file),
            foreign key (album_id) references albums (id) on delete cascade
        )"""
    )

    cur.execute(
        """
        create table if not exists exif (
            id integer primary key,

            brightness_value text,
            datetime timestamp,
            exposure_time text,
            f_number text,
            flash integer,
            focal_length text,
            gps_altitude text,
            gps_altitude_ref text,
            gps_latitude text,
            gps_latitude_ref text,
            gps_longitude text,
            gps_longitude_ref text,
            iso_speed_ratings text,
            lens_make text,
            lens_model text,
            lens_specification text,
            make text,
            model text,
            pixel_x_dimension text,
            pixel_y_dimension text,
            resolution_unit text,
            shutter_speed_value text,
            x_resolution text,
            y_resolution text,

            image_id integer,
            foreign key (image_id) references images (id) on delete cascade
        )"""
    )

    con.commit()
    con.close()


if __name__ == "__main__":
    main()
