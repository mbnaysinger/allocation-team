// src/app/(views)/api-docs/page.tsx

import { getApiDocs } from '../../../swagger';
import ApiDocsClient from './ApiDocsClient';

// Importamos os estilos globais aqui para que só carreguem nesta página
import '@scalar/api-reference-react/style.css';

export default async function ApiDocsPage() {
  // 1. Busca a especificação da API no lado do servidor
  const spec = await getApiDocs();

  // 2. Passa a especificação para o componente cliente como um prop
  return <ApiDocsClient spec={spec} />;
}