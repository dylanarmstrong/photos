// TODO: import tailwind theme color
import type { FC, PropsWithChildren } from 'react';

import { Footer } from './footer.js';
import { Header } from './header.js';
import { baseUrl, isDevelopment } from '../constants.js';

type Properties = {
  readonly header?: string;
  readonly subheader?: string;
  readonly title?: string;
};

const Layout: FC<PropsWithChildren<Properties>> = ({
  children,
  header,
  subheader,
  title,
}) => (
  <html lang="en-us">
    <head>
      <title>{title}</title>
      <meta
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
        name="viewport"
      />
      <meta content="Travel photos by Dylan Armstrong" name="description" />
      <meta content="#133dc8" name="theme-color" />
      <meta content="same-origin" name="referrer" />
      <link
        href="/apple-touch-icon.png"
        rel="apple-touch-icon"
        sizes="180x180"
      />
      <link href="/favicon-32x32.png" rel="apple-touch-icon" sizes="32x32" />
      <link href="/favicon-16x16.png" rel="apple-touch-icon" sizes="16x16" />
      <link href="/favicon.ico" rel="shortcut icon" />
      <link
        as="font"
        crossOrigin="anonymous"
        href={`${baseUrl}/static/poppins-latin-400-normal.woff`}
        rel="preload"
        type="font/woff"
      />
      <link
        as="font"
        crossOrigin="anonymous"
        href={`${baseUrl}/static/poppins-latin-400-normal.woff2`}
        rel="preload"
        type="font/woff2"
      />
      <link
        as="font"
        crossOrigin="anonymous"
        href={`${baseUrl}/static/poppins-latin-700-normal.woff`}
        rel="preload"
        type="font/woff"
      />
      <link
        as="font"
        crossOrigin="anonymous"
        href={`${baseUrl}/static/poppins-latin-700-normal.woff2`}
        rel="preload"
        type="font/woff2"
      />
      {isDevelopment ? (
        <>
          <script src="http://localhost:5173/@vite/client" type="module" />
          <script src="http://localhost:5173/src/main.ts" type="module" />
        </>
      ) : (
        <>
          <link href={`${baseUrl}/static/main.css`} rel="stylesheet" />
          <script src={`${baseUrl}/static/main.js`} type="module" />
        </>
      )}
    </head>
    <body>
      <Header header={header} subheader={subheader} />
      <main>{children}</main>
      <Footer />
    </body>
  </html>
);

Layout.defaultProps = {
  header: '',
  subheader: '',
  title: 'Photo Albums',
};

export { Layout };
