import type { FC, PropsWithChildren } from 'react';

import { Footer } from './footer.js';
import { Head } from './head.js';
import { Header } from './header.js';

type Properties = {
  readonly header?: string | undefined;
  readonly subheader?: string | undefined;
  readonly title?: string | undefined;
};

const Layout: FC<PropsWithChildren<Properties>> = ({
  children,
  header,
  subheader,
  title,
}) => (
  <html className="min-h-full min-w-full" lang="en-us">
    <Head title={title} />
    <body className="grid-rows-layout m-0 grid max-h-dvh min-h-dvh min-w-full bg-white p-0 tracking-tight text-black">
      <Header header={header} subheader={subheader} />
      <main className="mx-4">{children}</main>
      <Footer />
    </body>
  </html>
);

Layout.defaultProps = {
  header: undefined,
  subheader: undefined,
  title: undefined,
};

export { Layout };
