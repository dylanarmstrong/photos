import { Data } from './data.js';
import { Picture } from '../../components/picture.js';
import { baseUrl, imagesPerPage } from '../../constants.js';

import type { IPhoto } from '../../types.js';

type Properties = {
  readonly albumName: string;
  readonly index: number;
  readonly page: number;
  readonly photo: IPhoto;
};

const Photo = ({ albumName, index, page, photo }: Properties) => (
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
        <Picture
          className={{
            img: 'relative max-h-[512px] w-full rounded-b-none rounded-t border border-black object-contain md:max-h-[362.25px] md:rounded-b',
          }}
          pageName="album"
          photo={photo}
          size={320}
        />
        <Data component="div" photo={photo} />
      </a>
      <Data component="figcaption" photo={photo} />
    </figure>
  </div>
);

export { Photo };
