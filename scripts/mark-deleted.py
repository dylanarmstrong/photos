#!/usr/bin/env python3

# /// script
# requires-python = "==3.12"
# ///

import json
import sqlite3
from collections import defaultdict


def main():
    path = "./images.db"
    con = sqlite3.connect(path, detect_types=sqlite3.PARSE_DECLTYPES)
    cur = con.cursor()

    with open("sorted.json", "r") as f:
        sorted_files: list[str] = json.load(f)

    files_by_album: dict[str, set[str]] = defaultdict(set)
    for file_path in sorted_files:
        album, filename = file_path.rsplit("/", 1)
        files_by_album[album].add(filename)

    total_deleted = 0

    for album, files in files_by_album.items():
        cursor = cur.execute("select id from albums where album = ?", [album])
        row = cursor.fetchone()
        if not row:
            print(f"Album not found in DB: {album}")
            continue

        album_id = row[0]

        cursor = cur.execute(
            "select id, file from images where album_id = ? and deleted = 0",
            [album_id],
        )
        db_images = cursor.fetchall()

        for image_id, filename in db_images:
            name_without_ext = filename.rsplit(".", 1)[0]
            if name_without_ext not in files:
                cur.execute(
                    "update images set deleted = 1 where id = ?",
                    [image_id],
                )
                total_deleted += 1
                print(f"Marked deleted: {album}/{filename}")

    con.commit()
    con.close()

    print(f"\nTotal marked as deleted: {total_deleted}")


if __name__ == "__main__":
    main()
