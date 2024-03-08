import { baseUrl, developmentPort, isDevelopment } from '../../constants.js';

const Head = () =>
  isDevelopment ? (
    <script
      src={`http://localhost:${developmentPort}/src/leaflet.ts`}
      type="module"
    />
  ) : (
    <>
      <link href={`${baseUrl}/static/leaflet.css`} rel="stylesheet" />
      <script src={`${baseUrl}/static/leaflet.js`} type="module" />
    </>
  );

export { Head };
