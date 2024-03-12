import { Data } from './data.js';
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
    <div
      className="relative flex h-auto flex-col self-end overflow-hidden"
      key={photo.file}
    >
      <figure>
        <a
          aria-label={`Click to see details for image #${index + 1}`}
          className="group"
          href={`${baseUrl}/${albumName}/details/${(page - 1) * imagesPerPage + index}`}
        >
          <picture>
            <source
              sizes={photo.getSizes('album')}
              srcSet={photo.getSrcSet('avif')}
              type="image/avif"
            />
            <source
              sizes={photo.getSizes('album')}
              srcSet={photo.getSrcSet('webp')}
              type="image/webp"
            />
            <img
              alt={`${country} - ${photo.coord}`}
              className="relative max-h-[512px] w-full rounded-b-none rounded-t border border-black object-contain md:max-h-[362.25px] md:rounded-b"
              height={images['320'].height}
              sizes={photo.getSizes('album')}
              src={images['320'].jpeg}
              srcSet={photo.getSrcSet('jpeg')}
              width={images['320'].width}
            />
          </picture>
          <Data component="div" photo={photo} />
        </a>
        <Data component="figcaption" photo={photo} />
      </figure>
    </div>
  );
};

export { Photo };
