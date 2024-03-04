import { baseUrl } from '../../constants.js';

import type { IAlbum } from '../../@types/index.js';

type Properties = {
  readonly album: IAlbum;
};

const Row = ({ album }: Properties) => (
  <tr>
    <td className="mobile">
      {album.disabled ? '-' : <a href={`${baseUrl}/${album.name}/1`}>View</a>}
    </td>
    <td className="mobile">{album.country}</td>
    <td>{album.month}</td>
    <td className="mobile">{album.year}</td>
    <td>{album.disabled ? '-' : album.count}</td>
  </tr>
);

export { Row };
