# Análise do Projeto: Allocation Team

## Visão Geral e Regras de Negócio

O projeto **Allocation Team** é uma aplicação web Full-Stack para gerenciamento e alocação de equipes. O objetivo principal é permitir que gestores visualizem e organizem a carga de trabalho dos membros da equipe em diferentes projetos e atividades de forma visual e intuitiva.

### Principais Entidades de Negócio:

- **Pessoa**: Representa um membro da equipe que pode ser alocado.
- **Projeto**: Representa um projeto ao qual as pessoas podem ser associadas.
- **Atividade**: A unidade de trabalho. Uma atividade é atribuída a uma `Pessoa`, pode ou não estar ligada a um `Projeto`, e tem uma data específica.
- **Resumo Semanal**: Um registro onde o usuário pode fazer um balanço da sua semana, apontando impedimentos e planejando a próxima.

### Funcionalidades Principais:

- **Visualização de Alocação**: A interface principal exibe um quadro semanal onde as atividades de cada pessoa são mostradas dia a dia.
- **Gerenciamento de Atividades**:
    - Criar, editar e deletar atividades.
    - Arrastar e soltar (Drag and Drop) atividades entre os dias da semana para realocá-las.
    - Clonar uma atividade existente.
- **Gerenciamento de Entidades**:
    - Modais para adicionar novas Pessoas, Projetos e Atividades.
- **Autenticação**: O sistema possui um fluxo de autenticação de usuários (embora o `README.md` aponte a necessidade de melhorias e integração com Keycloak).
- **Documentação da API**: A API do back-end é documentada com Swagger e pode ser acessada em `/api-docs`.

## Arquitetura e Detalhes Técnicos

A aplicação é um monorepo construído com Next.js e segue princípios da **Clean Architecture** para separar as responsabilidades.

### Estrutura de Diretórios:

- **`src/app`**: Contém as rotas da aplicação (App Router) e a interface do usuário (componentes do lado do cliente).
- **`src/app/api`**: Endpoints da API RESTful, que servem como a camada de entrada para o back-end.
- **`src/backend/core`**: O "coração" da lógica de negócio.
    - **`models`**: Define as entidades de negócio (`Pessoa`, `Projeto`, etc.).
    - **`ports`**: Define as interfaces (contratos) para os repositórios, aplicando o princípio da Inversão de Dependência.
    - **`services`**: Contém os casos de uso da aplicação (ex: `BuscarAlocacaoSemana`, `CriarAtividade`).
- **`src/backend/infrastructure`**: Contém as implementações concretas das interfaces do `core`.
    - **`repositories/mongodb`**: Implementações dos repositórios que interagem com o MongoDB.
    - **`factories`**: Fábricas para criar instâncias de serviços com suas dependências.
- **`src/components`**: Componentes React, divididos em `features` (específicos de uma funcionalidade) e `ui` (genéricos).
- **`src/config`**: Lógica de configuração da aplicação.

### Stack Tecnológica:

- **Framework**: Next.js (com App Router e Turbopack)
- **Linguagem**: TypeScript
- **Banco de Dados**: MongoDB
- **Estilização**: Tailwind CSS
- **UI/UX**:
    - **Drag and Drop**: `@dnd-kit`
    - **Ícones**: `lucide-react`
    - **Componentes**: Radix UI para primitivos como Checkbox e Label.
- **Autenticação**: NextAuth.js
- **Documentação da API**: `next-swagger-doc` e `@scalar/api-reference-react`
- **Containerização**: Docker e Docker Compose para o ambiente de desenvolvimento (MongoDB).

### Configuração:

- O serviço `src/config/config.service.ts` gerencia as variáveis de ambiente.
- **Desenvolvimento**: As configurações são lidas do arquivo `.env.yml`.
- **Produção**: As configurações são lidas de um Config Server (via `CONFIG_SERVER_URL`) ou diretamente das variáveis de ambiente do processo (ex: na Vercel).

### Scripts Importantes:

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila a aplicação para produção.
- `npm run start`: Inicia o servidor de produção.
- `npm run lint`: Executa o linter (ESLint) para análise estática do código.
