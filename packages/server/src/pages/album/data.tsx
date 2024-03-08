import { P } from '../../components/p.js';

import type { IPhoto } from '../../@types/index.js';

type Properties = {
  readonly component: 'div' | 'figcaption';
  readonly photo: IPhoto;
};

const Data = ({ component, photo }: Properties) => {
  const data = (
    <>
      <P full small>
        {photo.coord}
      </P>
      <P full small>
        {photo.displayDate}
      </P>
      <P full small>{`${photo.make}${photo.model}`}</P>
      <P full small>
        {photo.resolution}
      </P>
    </>
  );
  return component === 'div' ? (
    <div className="backdrop-blur-safari absolute bottom-0 flex h-auto w-full flex-wrap justify-start overflow-hidden rounded-b border border-black bg-black/60 p-3 text-white subpixel-antialiased opacity-0 backdrop-blur backdrop-saturate-150 transition-opacity duration-300 ease-out before:rounded-xl md:group-hover:opacity-100">
      {data}
    </div>
  ) : (
    <figcaption className="block rounded-b border-b border-l border-r p-2 text-base leading-5 text-black md:hidden">
      {data}
    </figcaption>
  );
};

export { Data };
