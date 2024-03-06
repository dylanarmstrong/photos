type Properties = {
  readonly header?: string;
  readonly subheader?: string;
};

const Header = ({ header, subheader }: Properties) => (
  <header>
    {header && <h1>{header}</h1>}
    {subheader && <h2>{subheader}</h2>}
  </header>
);

Header.defaultProps = {
  header: '',
  subheader: '',
};

export { Header };
