import { Layout } from '../../components/layout.js';
import { Link } from '../../components/link.js';
import { Photo } from './photo.js';
import { baseUrl, imagesPerPage } from '../../constants.js';

import type { IAlbum } from '../../@types/index.js';

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
        country={album.country}
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
        {page > 1 && (
          <Link href={prevPage} id="prev">
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={nextPage} id="next">
            Next
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-8">
        {photos}
      </div>
      <div className="mt-2.5">
        {page > 1 && <Link href={prevPage}>Previous</Link>}
        {page < pages && <Link href={nextPage}>Next</Link>}
      </div>
    </Layout>
  );
};

export { Album };
