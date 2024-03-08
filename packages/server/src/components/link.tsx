import type { ReactNode } from 'react';

type Properties = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly href: string;
  readonly id?: string;
  readonly title?: string;
};

const Link = ({ children, className, href, id, title }: Properties) => (
  <a
    className={`text-blue decoration-blue visited:text-purple visited:decoration-purple mr-3 underline decoration-2 underline-offset-1 md:mr-5 ${className}`}
    href={href}
    id={id}
    title={title}
  >
    {children}
  </a>
);

Link.defaultProps = {
  className: '',
  id: undefined,
  title: undefined,
};

export { Link };
