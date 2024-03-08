import type { FC, PropsWithChildren, ReactNode } from 'react';

import { Footer } from './footer.js';
import { Head } from './head.js';
import { Header } from './header.js';

type Properties = {
  readonly head?: ReactNode | undefined;
  readonly header?: string | undefined;
  readonly subheader?: string | undefined;
  readonly title?: string | undefined;
};

const Layout: FC<PropsWithChildren<Properties>> = ({
  children,
  head,
  header,
  subheader,
  title,
}) => (
  <html className="min-h-full min-w-full" lang="en-us">
    <Head title={title}>{head}</Head>
    <body className="grid-rows-layout m-0 grid max-h-dvh min-h-dvh min-w-full bg-white p-0 tracking-tight text-black">
      <Header header={header} subheader={subheader} />
      <main className="mx-4">{children}</main>
      <Footer />
    </body>
  </html>
);

Layout.defaultProps = {
  head: undefined,
  header: undefined,
  subheader: undefined,
  title: undefined,
};

export { Layout };
