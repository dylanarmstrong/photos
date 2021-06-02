#!/usr/bin/env python3

import sqlite3

# Run this to setup the image database
def main():
    path = './images.db'
    con = sqlite3.connect(
        path,
        detect_types=sqlite3.PARSE_DECLTYPES
    )
    cur = con.cursor()

    cur.execute('''
        create table if not exists images (
            id integer primary key,
            album text not null,
            file text not null,
            unique (album, file)
        )'''
    )

    cur.execute('''
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

            image integer,
            foreign key (image) references images (id) on delete cascade
        )'''
    )

    con.commit()
    con.close()

if __name__ == '__main__':
    main()
