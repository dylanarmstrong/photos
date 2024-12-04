import classNames from 'classnames';

import type { ReactNode } from 'react';

type Properties = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly href: string | undefined;
  readonly id?: string;
  readonly title?: string;
};

const defaultClassName =
  'text-blue decoration-blue visited:text-purple visited:decoration-purple mr-3 underline decoration-2 underline-offset-1 md:mr-5';
const hiddenClassName = 'opacity-0 pointer-events-none';

const Link = ({ children, className = '', href, id, title }: Properties) => (
  <a
    className={classNames(defaultClassName, className, {
      [hiddenClassName]: href === undefined,
    })}
    href={href}
    id={id}
    title={title}
  >
    {children}
  </a>
);

export { Link };
