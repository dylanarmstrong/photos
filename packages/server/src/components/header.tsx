type Properties = {
  readonly header?: string;
  readonly subheader?: string;
};

const Header = ({ header = '', subheader = '' }: Properties) => (
  <header className="mt-2 ml-4">
    {header && <h1 className="text-3xl">{header}</h1>}
    {subheader && <h2 className="text-base">{subheader}</h2>}
  </header>
);

export { Header };
