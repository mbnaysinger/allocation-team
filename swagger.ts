import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // Pasta onde estão suas API Routes
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API do Sistema de Alocação',
        version: '1.0',
        description: 'Documentação da API para o sistema de alocação de equipes.',
      },
      // Você pode adicionar componentes globais aqui, como esquemas de segurança
      components: {
        // Exemplo de esquema de segurança (descomente se usar)
        // securitySchemes: {
        //   BearerAuth: {
        //     type: 'http',
        //     scheme: 'bearer',
        //     bearerFormat: 'JWT',
        //   },
        // },
      },
      // security: [], // Se a API for protegida, adicione aqui
    },
  });
  return spec;
};