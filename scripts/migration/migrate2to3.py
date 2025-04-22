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
    version = "3"
    con = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    cur = con.cursor()

    try:
        cursor = cur.execute(
            """
            SELECT value
            FROM meta
            WHERE key = 'version';
            """
        )
        value = cursor.fetchone()[0]
        if value >= version:
            print("Failure: db already on version", value)
            sys.exit(1)
    except:
        print("Failure: db on version 1, please run migrate1to2.py first")
        sys.exit(1)

    cur.execute(
        """
        UPDATE meta
        SET value = ?
        WHERE key = 'version'
        """,
        [version],
    )

    cur.execute(
        """
        ALTER table images
        ADD COLUMN deleted integer NOT NULL DEFAULT 0
        """
    )

    cur.execute(
        """
        ALTER table albums 
        DROP COLUMN month
        """
    )

    cur.execute(
        """
        ALTER table albums 
        DROP COLUMN year
        """
    )

    cur.execute(
        """
        ALTER table albums
        ADD COLUMN datetime timestamp
        """
    )

    cur.execute(
        """
        UPDATE albums
        SET datetime = grouped.datetime
        FROM (
            SELECT
                a.id AS id,
                MIN(e.datetime) AS datetime
            FROM exif e
            JOIN images i ON i.id = e.image_id
            JOIN albums a ON a.id = i.album_id
            GROUP BY a.id
        ) AS grouped
        WHERE albums.id = grouped.id
        """
    )

    con.commit()
    con.close()


if __name__ == "__main__":
    main()
