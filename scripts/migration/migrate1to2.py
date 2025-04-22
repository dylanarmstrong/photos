#!/usr/bin/env -S uv run --script

# /// script
# requires-python = "==3.12"
# dependencies = [
# ]
# ///

import sqlite3
import sys


# Run this to setup the image database
def main():
    path = "./images.db"
    version = "2"
    con = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    cur = con.cursor()

    # Check if meta table exists, if it does, we are on version >2
    try:
        cur.execute(
            """
            select value
            from meta
            where key = 'version';
            """
        )
        print("Failure: already migrated to version 2")
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
            disabled integer,
            month text,
            year integer,
            unique (album)
        )
        """
    )

    cur.execute(
        """
        insert or ignore into albums
        (
            album,
            country,
            disabled,
            month,
            year
        ) values
        ('tunis-2023', 'Tunis', 0, 'November', 2023),
        ('madagascar-2023', 'Madagascar', 1, 'August', 2023),
        ('iceland-2023', 'Iceland', 1, 'June', 2023),
        ('cape-verde-2023', 'Cape Verde', 0, 'April', 2023),
        ('portugal-2023', 'Portugal', 0, 'April', 2023),
        ('qatar-2021', 'Qatar', 0, 'December', 2021),
        ('iraqi-kurdistan-2021', 'Iraqi Kurdistan', 0, 'December', 2021),
        ('iraq-2021', 'Iraq', 0, 'November', 2021),
        ('netherlands-2021', 'Netherlands', 0, 'October', 2021),
        ('luxembourg-2021', 'Luxembourg', 0, 'October', 2021),
        ('belgium-2021', 'Belgium', 0, 'October', 2021),
        ('andorra-2021', 'Andorra', 0, 'October', 2021),
        ('france-2021', 'France', 0, 'October', 2021),
        ('liechtenstein-2021', 'Liechtenstein', 0, 'September', 2021),
        ('switzerland-2021', 'Switzerland', 0, 'September', 2021),
        ('austria-2021', 'Austria', 0, 'September', 2021),
        ('czech-2021', 'Czech Republic', 0, 'September', 2021),
        ('germany-2021', 'Germany', 0, 'September', 2021),
        ('ukraine-2021', 'Ukraine', 0, 'July', 2021),
        ('sudan-2020', 'Sudan', 0, 'November', 2020),
        ('turkey-2020-2', 'Turkey', 0, 'November', 2020),
        ('ghana-2020', 'Ghana', 0, 'January', 2020),
        ('togo-2020', 'Togo', 0, 'January', 2020),
        ('benin-2020', 'Benin', 0, 'January', 2020),
        ('turkey-2020-1', 'Turkey', 0, 'January', 2020),
        ('vietnam-2019', 'Vietnam', 0, 'December', 2019),
        ('cambodia-2019', 'Cambodia', 0, 'December', 2019),
        ('thailand-2019', 'Thailand', 0, 'December', 2019),
        ('japan-2019', 'Japan', 0, 'November', 2019),
        ('madagascar-2019', 'Madagascar', 0, 'May', 2019),
        ('germany-2019', 'Germany', 0, 'May', 2019),
        ('tanzania-2018', 'Tanzania', 1, 'November', 2018),
        ('kenya-2018', 'Kenya', 1, 'November', 2018),
        ('rwanda-2018', 'Rwanda', 0, 'November', 2018),
        ('uganda-2018', 'Uganda', 0, 'November', 2018),
        ('uae-2018', 'United Arab Emirates', 1, 'November', 2018),
        ('namibia-2017', 'Namibia', 0, 'November', 2017),
        ('botswana-2017', 'Botswana', 0, 'November', 2017),
        ('zimbabwe-2017', 'Zimbabwe', 0, 'November', 2017),
        ('germany-2017', 'Germany', 0, 'November', 2017),
        ('morocco-2017', 'Morocco', 0, 'June', 2017),
        ('vatican-2017', 'Vatican', 0, 'May', 2017),
        ('italy-2017', 'Italy', 0, 'May', 2017),
        ('monaco-2017', 'Monaco', 0, 'May', 2017),
        ('france-2017', 'France', 0, 'May', 2017),
        ('spain-2017', 'Spain', 0, 'May', 2017),
        ('france-2016', 'France', 0, 'November', 2016),
        ('england-2016', 'England', 0, 'November', 2016),
        ('new-zealand-2009', 'New Zealand', 1, 'July', 2009),
        ('bahamas-2006', 'Bahamas', 1, null, null),
        ('dominica-2006', 'Dominica', 1, null, null),
        ('mexico-2005', 'Mexico', 1, 'March', 2005),
        ('jamaica-2005', 'Jamaica', 1, 'March', 2005),
        ('haiti-2005', 'Haiti', 1, 'March', 2005),
        ('belize-2004', 'Belize', 1, 'April', 2004),
        ('mexico-2004', 'Mexico', 1, 'March', 2004),
        ('canada-1994', 'Canada', 1, 'July', 1994),
        ('united-states-1989', 'United States', 1, 'November', 1989)
        """
    )

    cur.execute(
        """
        create table if not exists new_images (
            id integer primary key,

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
        insert or ignore into new_images (
            file,
            height,
            width,
            album_id
        )
            select
                i.file,
                i.height,
                i.width,
                (
                    select a.id
                    from albums a
                    where a.album = i.album
                )
            from images i
        """
    )

    cur.execute(
        """
        alter table images
        rename to old_images;
        """
    )

    cur.execute(
        """
        alter table new_images
        rename to images;
        """
    )

    cur.execute(
        """
        drop table old_images;
        """
    )

    cur.execute(
        """
        create table if not exists new_exif (
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

    cur.execute(
        """
        insert or ignore into new_exif (
            id,
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
        )
            select
                e.id,
                e.brightness_value,
                e.datetime,
                e.exposure_time,
                e.f_number,
                e.flash,
                e.focal_length,
                e.gps_altitude,
                e.gps_altitude_ref,
                e.gps_latitude,
                e.gps_latitude_ref,
                e.gps_longitude,
                e.gps_longitude_ref,
                e.iso_speed_ratings,
                e.lens_make,
                e.lens_model,
                e.lens_specification,
                e.make,
                e.model,
                e.pixel_x_dimension,
                e.pixel_y_dimension,
                e.resolution_unit,
                e.shutter_speed_value,
                e.x_resolution,
                e.y_resolution,
                e.image
            from exif e
        """
    )

    cur.execute(
        """
        alter table exif
        rename to old_exif;
        """
    )

    cur.execute(
        """
        alter table new_exif
        rename to exif;
        """
    )

    cur.execute(
        """
        drop table old_exif;
        """
    )

    con.commit()
    con.close()


if __name__ == "__main__":
    main()
