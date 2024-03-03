import { Layout } from '../components/layout.js';
import { baseUrl, imagesPerPage } from '../constants.js';

import type { AlbumRenderData, IAlbum } from '../@types/index.js';

type Properties = {
  album?: IAlbum;
  datas?: AlbumRenderData[];
  nextPage?: string;
  page?: number;
  pages?: number;
  prevPage?: string;
};

const Album = ({
  album,
  datas,
  nextPage,
  page,
  pages,
  prevPage,
}: Required<Properties>) => (
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
      {datas.map((data, index) => (
        <div className="image-block" key={data.base}>
          <figure>
            <a
              aria-label={`Click to see details for image #${index + 1}`}
              className="group"
              href={`${baseUrl}/${album.album}/details/${(page - 1) * imagesPerPage + index}`}
            >
              <picture>
                <source srcSet={data.images.sm.webp} type="image/webp" />
                <img
                  alt={`Image ${index + 1}`}
                  height={data.images.sm.height}
                  src={data.images.sm.jpeg}
                  width={data.images.sm.width}
                />
              </picture>
              <div className="data md:group-hover:opacity-100">
                <p>{data.exif.coord}</p>
                <p>{data.exif.displayDate}</p>
                <p>
                  {data.exif.make}
                  {data.exif.model}
                </p>
                <p>{data.exif.resolution}</p>
              </div>
            </a>
            <figcaption>
              <p>{data.exif.coord}</p>
              <p>{data.exif.displayDate}</p>
              <p>
                {data.exif.make}
                {data.exif.model}
              </p>
              <p>{data.exif.resolution}</p>
            </figcaption>
          </figure>
        </div>
      ))}
    </div>
    <div className="footer navigation">
      {page > 1 && <a href={prevPage}>Previous</a>}
      {page < pages && <a href={nextPage}>Next</a>}
    </div>
  </Layout>
);

Album.defaultProps = {
  album: {
    album: '-',
    count: 0,
    country: '-',
    disabled: true,
    header: '-',
    month: '-',
    year: '-',
  },
  datas: [],
  page: 1,
  pages: 1,
};

export { Album };
