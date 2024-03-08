import { Layout } from '../components/layout.js';
import { P } from '../components/p.js';

type Properties = {
  readonly status: string;
};

const message = `You've reached a page that doesn't exist.`;

const Status = ({ status }: Properties) => (
  <Layout header={status}>
    <P>{message}</P>
  </Layout>
);

export { Status };
