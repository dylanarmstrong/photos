import {
  CalendarDaysIcon,
  CameraIcon,
  MapPinIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

import { Layout } from '../components/layout.js';
import { baseUrl } from '../constants.js';

import type { AlbumRenderData } from '../@types/index.js';

type Properties = {
  data?: AlbumRenderData;
  nextPage?: string;
  prevPage?: string;
  prevUrl?: string;
};

const Details = ({ data, prevPage, nextPage, prevUrl }: Properties) => (
  <Layout>
    <div className="header navigation">
      <div>
        <a id="home" href={baseUrl}>
          Home
        </a>
        <a id="back" href={prevUrl}>
          Go Back
        </a>
        {prevPage !== undefined && (
          <a id="prev" href={prevPage}>
            Previous
          </a>
        )}
        {nextPage !== undefined && (
          <a id="next" href={nextPage}>
            Next
          </a>
        )}
        <a title="Download" href={data?.images.lg.jpeg}>
          Download
        </a>
      </div>
    </div>
    <div className="details">
      <div className="details-image">
        <picture>
          <source srcSet={data?.images.md.webp} type="image/webp" />
          <img alt={`Image 1}`} src={data?.images.md.jpeg} />
        </picture>
      </div>
      <aside className="details-data">
        <table className="details-table">
          <thead>
            <tr>
              <th className="mobile" />
              <th className="mobile text-3xl">Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mobile">
                <PhotoIcon className="h-6 w-6" />
              </td>
              <td className="mobile">
                {data?.base}
                <br />
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <p>{data?.exif.resolution}</p>
                  <p>{data?.exif.megapixels}</p>
                </div>
              </td>
            </tr>

            <tr>
              <td className="mobile">
                <CalendarDaysIcon className="h-6 w-6" />
              </td>
              <td className="mobile">{data?.exif.displayDate}</td>
            </tr>

            <tr>
              <td className="mobile">
                <CameraIcon className="h-6 w-6" />
              </td>
              <td className="mobile">
                {data?.exif.make}
                {data?.exif.model}
                <br />
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <p>{data?.exif.isoSpeedRatings}</p>
                  <p>{data?.exif.fNumber}</p>
                  <p>{data?.exif.shutterSpeedValue}</p>
                  <p>{data?.exif.focalLength}</p>
                </div>
              </td>
            </tr>

            <tr>
              <td className="mobile">
                <MapPinIcon className="h-6 w-6" />
              </td>
              <td className="mobile">{data?.exif.coord}</td>
            </tr>
          </tbody>
        </table>

        <hr className="my-5" />

        <div
          className="w-full"
          id="map"
          data-latitude-ref={data?.exif.gpsLatitudeRef}
          data-latitude={data?.exif.gpsLatitude}
          data-longitude-ref={data?.exif.gpsLongitudeRef}
          data-longitude={data?.exif.gpsLongitude}
        />
      </aside>
    </div>
  </Layout>
);

export { Details };
