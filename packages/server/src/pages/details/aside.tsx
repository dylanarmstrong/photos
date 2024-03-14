import {
  CalendarDaysIcon,
  CameraIcon,
  MapPinIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

import { P } from '../../components/p.js';
import { Td } from '../../components/td.js';
import { Th } from '../../components/th.js';

import type { IPhoto } from '../../types.js';

type Properties = {
  readonly photo: IPhoto;
};

const Aside = ({ photo }: Properties) => {
  const { latLng } = photo;
  return (
    <aside className="h-full w-full self-start bg-white px-5 text-black">
      <table className="border-collapse text-base">
        <thead>
          <tr>
            <Th mobile />
            <Th big mobile>
              Info
            </Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td alignTop mobile>
              <PhotoIcon className="h-6 w-6" />
            </Td>
            <Td mobile>
              {photo.file}
              <br />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <P>{photo.resolution}</P>
                <P>{photo.megapixels}</P>
              </div>
            </Td>
          </tr>

          <tr>
            <Td alignTop mobile>
              <CalendarDaysIcon className="h-6 w-6" />
            </Td>
            <Td mobile>{photo.displayDate}</Td>
          </tr>

          <tr>
            <Td alignTop mobile>
              <CameraIcon className="h-6 w-6" />
            </Td>
            <Td mobile>
              {photo.make}
              {photo.model}
              <br />
              <div className="grid grid-cols-4 gap-2 text-sm">
                <P>{photo.isoSpeedRatings}</P>
                <P>{photo.fNumber}</P>
                <P>{photo.shutterSpeedValue}</P>
                <P>{photo.focalLength}</P>
              </div>
            </Td>
          </tr>

          <tr>
            <Td alignTop mobile>
              <MapPinIcon className="h-6 w-6" />
            </Td>
            <Td mobile>{photo.coord}</Td>
          </tr>
        </tbody>
      </table>

      <hr className="my-5" />

      {latLng !== undefined && (
        <div
          className="h-64 w-full self-end"
          data-latitude={latLng[0]}
          data-longitude={latLng[1]}
          id="map"
        />
      )}
    </aside>
  );
};

export { Aside };
