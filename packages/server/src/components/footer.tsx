// This server will maybe be rebooted once a year?
const date = new Date().getFullYear();

const Footer = () => (
  <footer className="mt-2.5 ml-4 pb-2.5">
    © {date} Dylan Armstrong. All rights reserved.
  </footer>
);

export { Footer };
