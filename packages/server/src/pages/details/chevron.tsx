import type { ReactNode } from 'react';

import { Link } from '../../components/link.js';

type Properties = {
  readonly children: ReactNode;
  readonly href: string | undefined;
  readonly title: string;
};

const Chevron = ({ children, href, title }: Properties) => (
  <Link
    className="m-auto flex h-full w-full items-center justify-center"
    href={href}
    title={title}
  >
    {children}
  </Link>
);

export { Chevron };
