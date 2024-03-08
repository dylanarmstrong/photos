import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { Aside } from './aside.js';
import { Chevron } from './chevron.js';
import { Layout } from '../../components/layout.js';
import { Link } from '../../components/link.js';
import { baseUrl } from '../../constants.js';

import type { IPhoto } from '../../@types/index.js';

type Properties = {
  readonly photo: IPhoto;
  readonly nextPage: string | undefined;
  readonly prevPage: string | undefined;
  readonly prevUrl: string;
};

const Details = ({ photo, prevPage, nextPage, prevUrl }: Properties) => {
  const { images } = photo;
  return (
    <Layout>
      <div className="mb-2.5 flex flex-wrap">
        <Link href={baseUrl} id="home">
          Home
        </Link>
        <Link href={prevUrl} id="back">
          Go Back
        </Link>
        {prevPage !== undefined && (
          <Link href={prevPage} id="prev">
            Previous
          </Link>
        )}
        {nextPage !== undefined && (
          <Link href={nextPage} id="next">
            Next
          </Link>
        )}
        <Link href={images.lg.jpeg} title="Download">
          Download
        </Link>
      </div>
      <div className="grid-rows-details md:grid-cols-details grid grid-flow-col md:h-[95%] md:grid-rows-none">
        <div className="grid-cols-detailContainer grid bg-black">
          {prevPage === undefined ? (
            <span />
          ) : (
            <Chevron href={prevPage} title="Previous Image">
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </Chevron>
          )}

          <div className="mx-auto self-center p-5">
            <picture>
              <source srcSet={images.md.webp} type="image/webp" />
              <img
                alt={`Taken at ${photo.coord}`}
                className="max-h-[83dvh] object-contain"
                height={images.md.height}
                src={images.md.jpeg}
                width={images.md.width}
              />
            </picture>
          </div>

          {nextPage === undefined ? (
            <span />
          ) : (
            <Chevron href={nextPage} title="Next Image">
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </Chevron>
          )}
        </div>
        <Aside photo={photo} />
      </div>
    </Layout>
  );
};

export { Details };
