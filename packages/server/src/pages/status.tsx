import { Layout } from '../components/layout.js';

type Properties = {
  readonly status: string;
};

const message = `You've reached a page that doesn't exist.`;

const Status = ({ status }: Properties) => (
  <Layout header={status}>
    <p>{message}</p>
  </Layout>
);

export { Status };
