import { Layout } from '../../components/layout.js';
import { Row } from './row.js';

import type { IAlbum } from '../../@types/index.js';

type Properties = {
  readonly albums: IAlbum[] | undefined;
};

const Home = ({ albums }: Properties) => {
  const albumRows = albums?.map((album) => (
    <Row album={album} key={album.name} />
  ));

  return (
    <Layout header="Photo Albums">
      <table className="index-table">
        <thead>
          <tr>
            <th className="mobile">photos</th>
            <th className="mobile">country</th>
            <th>month</th>
            <th className="mobile">year</th>
            <th>count</th>
          </tr>
        </thead>
        <tbody>{albumRows}</tbody>
      </table>
    </Layout>
  );
};

export { Home };
