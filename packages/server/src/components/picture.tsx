import classNames from 'classnames';

import { sizes } from '../constants.js';

import type { IPhoto } from '../types.js';

type Properties = {
  readonly className?: Partial<{
    img: string;
    picture: string;
  }>;
  readonly pageName: 'details' | 'album';
  readonly photo: IPhoto;
  readonly size: (typeof sizes)[number];
};

const Picture = ({ className, pageName, photo, size }: Properties) => {
  const { images } = photo;
  return (
    <picture className={classNames(className?.picture)}>
      <source
        sizes={photo.getSizes(pageName)}
        srcSet={photo.getSrcSet('avif')}
        type="image/avif"
      />
      <source
        sizes={photo.getSizes(pageName)}
        srcSet={photo.getSrcSet('webp')}
        type="image/webp"
      />
      <img
        alt={`Taken at ${photo.coord} on ${photo.datetime}`}
        className={classNames(className?.img)}
        height={images[size].height}
        sizes={photo.getSizes(pageName)}
        src={images['320'].jpeg}
        srcSet={photo.getSrcSet('jpeg')}
        width={images[size].width}
      />
    </picture>
  );
};

Picture.defaultProps = {
  className: {
    img: '',
    picture: '',
  },
};

export { Picture };
