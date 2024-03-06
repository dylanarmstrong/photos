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
  <html lang="en-us">
    <Head title={title} />
    <body>
      <Header header={header} subheader={subheader} />
      <main>{children}</main>
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
