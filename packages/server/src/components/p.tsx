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

const P = ({ children, full, small }: Properties) => (
  <p
    className={classNames(className, {
      [fullClassName]: full,
      [smallClassName]: small,
    })}
  >
    {children}
  </p>
);

P.defaultProps = {
  full: false,
  small: false,
};

export { P };
