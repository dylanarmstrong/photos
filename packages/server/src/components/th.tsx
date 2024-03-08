import classNames from 'classnames';

import type { ReactNode } from 'react';

type Properties = {
  readonly big?: boolean;
  readonly border?: boolean;
  readonly mobile?: boolean;
  readonly sticky?: boolean;
  readonly children?: ReactNode;
};

const bigClassName = 'text-3xl';
const borderClassName =
  "border-x border-y-0 border-black before:absolute before:left-0 before:top-0 before:w-full before:border-t before:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:border-b after:content-['']";
const className = 'bg-white p-1.5 text-left';
const mobileClassName = 'table-cell';
const nonMobileClassName = 'hidden md:table-cell';
const stickyClassName = 'sticky top-0';

const Th = ({ big, border, children, mobile, sticky }: Properties) => (
  <th
    className={classNames(className, {
      [bigClassName]: big,
      [borderClassName]: border,
      [mobileClassName]: mobile,
      [nonMobileClassName]: !mobile,
      [stickyClassName]: sticky,
    })}
  >
    {children}
  </th>
);

Th.defaultProps = {
  big: false,
  border: false,
  children: '',
  mobile: false,
  sticky: false,
};

export { Th };
