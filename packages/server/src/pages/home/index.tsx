import { Row } from './row.js';
import { Layout } from '../../components/layout.js';
import { Th } from '../../components/th.js';

import type { IAlbum } from '../../types.js';

type Properties = {
  readonly albums: IAlbum[] | undefined;
};

const Home = ({ albums }: Properties) => {
  const albumRows = albums?.map((album) => (
    <Row album={album} key={album.name} />
  ));

  return (
    <Layout header="Photo Albums">
      <table className="border-collapse text-base">
        <thead>
          <tr>
            <Th border mobile sticky>
              photos
            </Th>
            <Th border mobile sticky>
              country
            </Th>
            <Th border sticky>
              month
            </Th>
            <Th border mobile sticky>
              year
            </Th>
            <Th border sticky>
              count
            </Th>
          </tr>
        </thead>
        <tbody className="[&>tr]:first:[&_td]:border-t-0">{albumRows}</tbody>
      </table>
    </Layout>
  );
};

export { Home };
