import { Layout } from '../../components/layout.js';
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
      <div className="header navigation">
        <a href={baseUrl} id="home">
          Home
        </a>
        {page > 1 && (
          <a href={prevPage} id="prev">
            Previous
          </a>
        )}
        {page < pages && (
          <a href={nextPage} id="next">
            Next
          </a>
        )}
      </div>
      <div className="image-container">{photos}</div>
      <div className="footer navigation">
        {page > 1 && <a href={prevPage}>Previous</a>}
        {page < pages && <a href={nextPage}>Next</a>}
      </div>
    </Layout>
  );
};

export { Album };
