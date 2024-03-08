import { baseUrl, developmentPort, isDevelopment } from '../../constants.js';

const Head = () =>
  isDevelopment ? (
    <script
      src={`http://localhost:${developmentPort}/src/leaflet.ts`}
      type="module"
    />
  ) : (
    <>
      <link as="style" href={`${baseUrl}/static/leaflet.css`} rel="preload" />
      <script src={`${baseUrl}/static/leaflet.js`} type="module" />
    </>
  );

export { Head };
