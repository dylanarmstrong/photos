import classNames from 'classnames';

import type { ReactNode } from 'react';

type Properties = {
  readonly alignTop?: boolean;
  readonly border?: boolean;
  readonly mobile?: boolean;
  readonly children: ReactNode;
};

const alignTopClassName = 'align-top';
const borderClassName = 'border border-black';
const className = 'p-1.5 text-left';
const mobileClassName = 'table-cell';
const nonMobileClassName = 'hidden sm:table-cell';

const Td = ({
  alignTop = false,
  border = false,
  children,
  mobile = false,
}: Properties) => (
  <td
    className={classNames(className, {
      [alignTopClassName]: alignTop,
      [borderClassName]: border,
      [mobileClassName]: mobile,
      [nonMobileClassName]: !mobile,
    })}
  >
    {children}
  </td>
);

export { Td };
