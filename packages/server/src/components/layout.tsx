import { Footer } from './footer.js';
import { Head } from './head.js';
import { Header } from './header.js';

import type { FC, PropsWithChildren, ReactNode } from 'react';

type Properties = {
  readonly head?: ReactNode;
  readonly header?: string;
  readonly subheader?: string;
  readonly title?: string;
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

export { Layout };
