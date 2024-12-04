import classNames from 'classnames';

import type { ReactNode } from 'react';

type Properties = {
  readonly children: ReactNode;
  readonly full?: boolean;
  readonly small?: boolean;
};

const className = 'leading-4';
const fullClassName = 'w-full';
const smallClassName = 'text-sm';

const P = ({ children, full = false, small = false }: Properties) => (
  <p
    className={classNames(className, {
      [fullClassName]: full,
      [smallClassName]: small,
    })}
  >
    {children}
  </p>
);

export { P };
