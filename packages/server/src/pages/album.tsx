import { Layout } from '../components/layout.js';
import { baseUrl, imagesPerPage } from '../constants.js';

import type { IAlbum } from '../@types/index.js';

type Properties = {
  readonly album: IAlbum;
  readonly nextPage: string;
  readonly page: number;
  readonly pages: number;
  readonly prevPage: string;
};

const Album = ({ album, nextPage, page, pages, prevPage }: Properties) => {
  const photos = album.photos.slice(
    (page - 1) * imagesPerPage,
    page * imagesPerPage,
  );

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
      <div className="image-container">
        {photos.map((photo, index) => {
          const { images } = photo;
          return (
            <div className="image-block" key={photo.file}>
              <figure>
                <a
                  aria-label={`Click to see details for image #${index + 1}`}
                  className="group"
                  href={`${baseUrl}/${album.album}/details/${(page - 1) * imagesPerPage + index}`}
                >
                  <picture>
                    <source srcSet={images.sm.webp} type="image/webp" />
                    <img
                      alt={`${album.country} - ${photo.coord}`}
                      height={images.sm.height}
                      src={images.sm.jpeg}
                      width={images.sm.width}
                    />
                  </picture>
                  <div className="data md:group-hover:opacity-100">
                    <p>{photo.coord}</p>
                    <p>{photo.displayDate}</p>
                    <p>
                      {photo.make}
                      {photo.model}
                    </p>
                    <p>{photo.resolution}</p>
                  </div>
                </a>
                <figcaption>
                  <p>{photo.coord}</p>
                  <p>{photo.displayDate}</p>
                  <p>
                    {photo.make}
                    {photo.model}
                  </p>
                  <p>{photo.resolution}</p>
                </figcaption>
              </figure>
            </div>
          );
        })}
      </div>
      <div className="footer navigation">
        {page > 1 && <a href={prevPage}>Previous</a>}
        {page < pages && <a href={nextPage}>Next</a>}
      </div>
    </Layout>
  );
};

export { Album };
