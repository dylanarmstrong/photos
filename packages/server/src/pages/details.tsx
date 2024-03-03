import {
  CalendarDaysIcon,
  CameraIcon,
  MapPinIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

import { Layout } from '../components/layout.js';
import { baseUrl } from '../constants.js';

import type { IPhoto } from '../@types/index.js';

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
      <div className="header navigation">
        <div>
          <a href={baseUrl} id="home">
            Home
          </a>
          <a href={prevUrl} id="back">
            Go Back
          </a>
          {prevPage !== undefined && (
            <a href={prevPage} id="prev">
              Previous
            </a>
          )}
          {nextPage !== undefined && (
            <a href={nextPage} id="next">
              Next
            </a>
          )}
          <a href={images.lg.jpeg} title="Download">
            Download
          </a>
        </div>
      </div>
      <div className="details">
        <div className="details-image">
          <picture>
            <source srcSet={images.md.webp} type="image/webp" />
            <img alt={`Taken at ${photo.coord}`} src={images.md.jpeg} />
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
                  {photo.file}
                  <br />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <p>{photo.resolution}</p>
                    <p>{photo.megapixels}</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="mobile">
                  <CalendarDaysIcon className="h-6 w-6" />
                </td>
                <td className="mobile">{photo.displayDate}</td>
              </tr>

              <tr>
                <td className="mobile">
                  <CameraIcon className="h-6 w-6" />
                </td>
                <td className="mobile">
                  {photo.make}
                  {photo.model}
                  <br />
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <p>{photo.isoSpeedRatings}</p>
                    <p>{photo.fNumber}</p>
                    <p>{photo.shutterSpeedValue}</p>
                    <p>{photo.focalLength}</p>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="mobile">
                  <MapPinIcon className="h-6 w-6" />
                </td>
                <td className="mobile">{photo.coord}</td>
              </tr>
            </tbody>
          </table>

          <hr className="my-5" />

          <div
            className="w-full"
            data-latitude={photo.gpsLatitude}
            data-latitude-ref={photo.gpsLatitudeRef}
            data-longitude={photo.gpsLongitude}
            data-longitude-ref={photo.gpsLongitudeRef}
            id="map"
          />
        </aside>
      </div>
    </Layout>
  );
};

export { Details };
