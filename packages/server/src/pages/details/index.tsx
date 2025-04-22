import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { Aside } from './aside.js';
import { Chevron } from './chevron.js';
import { Head } from './head.js';
import { Layout } from '../../components/layout.js';
import { Link } from '../../components/link.js';
import { Picture } from '../../components/picture.js';
import { baseUrl } from '../../constants.js';

import type { IPhoto } from '../../types.js';

type Properties = {
  readonly photo: IPhoto;
  readonly nextPage: string | undefined;
  readonly prevPage: string | undefined;
  readonly prevUrl: string;
};

const Details = ({ photo, prevPage, nextPage, prevUrl }: Properties) => {
  const { images } = photo;
  return (
    <Layout head={<Head />}>
      <div className="mb-2.5 flex flex-wrap">
        <Link href={baseUrl} id="home">
          Home
        </Link>
        <Link href={prevUrl} id="back">
          Go Back
        </Link>
        <Link href={prevPage} id="prev">
          Previous
        </Link>
        <Link href={nextPage} id="next">
          Next
        </Link>
        <Link href={images['2560'].jpeg} title="Download">
          Download
        </Link>
      </div>
      <div className="grid grid-flow-col grid-rows-[1fr_auto] md:h-[95%] md:grid-cols-[1fr_400px] md:grid-rows-none">
        <div className="grid min-h-[60vh] grid-cols-[24px_1fr_24px] bg-white">
          <Chevron href={prevPage} title="Previous Image">
            <ChevronLeftIcon className="h-6 w-6 text-black" />
          </Chevron>

          <Picture
            className={{
              img: 'max-h-[82dvh] object-contain',
              picture: 'mx-auto self-center p-1 md:p-5',
            }}
            pageName="details"
            photo={photo}
            size={1280}
          />

          <Chevron href={nextPage} title="Next Image">
            <ChevronRightIcon className="h-6 w-6 text-black" />
          </Chevron>
        </div>
        <Aside photo={photo} />
      </div>
    </Layout>
  );
};

export { Details };
