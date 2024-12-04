import { baseUrl, developmentPort, isDevelopment } from '../constants.js';

import type { ReactNode } from 'react';

type Properties = {
  readonly children?: ReactNode;
  readonly title?: string;
};

const Head = ({ children, title = 'Photo Albums' }: Properties) => (
  <head>
    <title>{title}</title>
    <meta
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
      name="viewport"
    />
    <meta content="Travel photos by Dylan Armstrong" name="description" />
    <meta content="#133dc8" name="theme-color" />
    <meta content="same-origin" name="referrer" />
    <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
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
        <script
          src={`http://localhost:${developmentPort}/@vite/client`}
          type="module"
        />
        <script
          src={`http://localhost:${developmentPort}/src/main.ts`}
          type="module"
        />
      </>
    ) : (
      <>
        <link href={`${baseUrl}/static/main.css`} rel="stylesheet" />
        <script src={`${baseUrl}/static/main.js`} type="module" />
      </>
    )}
    {children}
  </head>
);

export { Head };
