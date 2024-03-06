import { baseUrl, imagesPerPage } from '../../constants.js';

import type { IPhoto } from '../../@types/index.js';

type Properties = {
  readonly albumName: string;
  readonly country: string;
  readonly index: number;
  readonly page: number;
  readonly photo: IPhoto;
};

const Photo = ({ albumName, country, index, page, photo }: Properties) => {
  const { images } = photo;
  return (
    <div className="image-block" key={photo.file}>
      <figure>
        <a
          aria-label={`Click to see details for image #${index + 1}`}
          className="group"
          href={`${baseUrl}/${albumName}/details/${(page - 1) * imagesPerPage + index}`}
        >
          <picture>
            <source srcSet={images.sm.webp} type="image/webp" />
            <img
              alt={`${country} - ${photo.coord}`}
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
};

export { Photo };
