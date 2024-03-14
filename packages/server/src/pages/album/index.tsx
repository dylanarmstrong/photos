import { Photo } from './photo.js';
import { Layout } from '../../components/layout.js';
import { Link } from '../../components/link.js';
import { baseUrl, imagesPerPage } from '../../constants.js';

import type { IAlbum } from '../../types.js';

type Properties = {
  readonly album: IAlbum;
  readonly nextPage: string;
  readonly page: number;
  readonly pages: number;
  readonly prevPage: string;
};

const Album = ({ album, nextPage, page, pages, prevPage }: Properties) => {
  const photos = album.photos
    .slice((page - 1) * imagesPerPage, page * imagesPerPage)
    .map((photo, index) => (
      <Photo
        albumName={album.name}
        index={index}
        key={photo.file}
        page={page}
        photo={photo}
      />
    ));

  return (
    <Layout
      header={album.header}
      subheader={`Page ${page} of ${pages}`}
      title={album.header}
    >
      <div className="mb-2.5 flex flex-wrap">
        <Link href={baseUrl} id="home">
          Home
        </Link>
        <Link href={page > 1 ? prevPage : undefined} id="prev">
          Previous
        </Link>
        <Link href={page < pages ? nextPage : undefined} id="next">
          Next
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-8">
        {photos}
      </div>
      <div className="mt-2.5">
        <Link href={page > 1 ? prevPage : undefined}>Previous</Link>
        <Link href={page < pages ? nextPage : undefined}>Next</Link>
      </div>
    </Layout>
  );
};

export { Album };
