import { Link } from '../../components/link.js';
import { Td } from '../../components/td.js';
import { baseUrl } from '../../constants.js';

import type { IAlbum } from '../../@types/index.js';

type Properties = {
  readonly album: IAlbum;
};

const Row = ({ album }: Properties) => (
  <tr>
    <Td border mobile>
      {album.disabled ? (
        '-'
      ) : (
        <Link href={`${baseUrl}/${album.name}/1`}>View</Link>
      )}
    </Td>
    <Td border mobile>
      {album.country}
    </Td>
    <Td border>{album.month}</Td>
    <Td border mobile>
      {album.year}
    </Td>
    <Td border>{album.disabled ? '-' : album.count}</Td>
  </tr>
);

export { Row };
