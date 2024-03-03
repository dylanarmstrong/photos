import { Layout } from '../components/layout.js';

type Properties = {
  status: string;
};

const Status = ({ status }: Properties) => (
  <Layout header={status}>
    <p>You've reached a page that doesn't exist.</p>
  </Layout>
);

export { Status };
