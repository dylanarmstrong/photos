import { Layout } from '../components/layout.js';
import { baseUrl } from '../constants.js';

import type { IAlbum } from '../@types/index.js';

type Properties = {
  albums?: IAlbum[];
};

const Home = ({ albums }: Required<Properties>) => (
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
      <tbody>
        {albums.map((album) => (
          <tr key={album.album}>
            <td className="mobile">
              {album.disabled ? (
                '-'
              ) : (
                <a href={`${baseUrl}/${album.album}/1`}>View</a>
              )}
            </td>
            <td className="mobile">{album.country}</td>
            <td>{album.month}</td>
            <td className="mobile">{album.year}</td>
            <td>{album.disabled ? '-' : album.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Layout>
);

Home.defaultProps = {
  albums: [],
};

export { Home };
