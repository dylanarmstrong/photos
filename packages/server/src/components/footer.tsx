// This server will maybe be updated once a year?
const date = new Date().getFullYear();

const Footer = () => (
  <footer className="ml-4 mt-2.5 pb-2.5">
    © {date} Dylan Armstrong. All rights reserved.
  </footer>
);

export { Footer };
