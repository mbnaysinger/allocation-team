import { getApiDocs } from '../../../swagger';
import SwaggerUI from 'swagger-ui-react';

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <section className="w-full">
      <SwaggerUI spec={spec} />
    </section>
  );
}