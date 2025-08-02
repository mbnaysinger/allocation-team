# Allocation Team - Ferramenta de Alocação de Equipes

## Visão Geral

O **Allocation Team** é uma aplicação web Full-Stack construída com **Next.js**, projetada para facilitar o gerenciamento e a alocação de tempo de equipes em diferentes projetos e atividades. A ferramenta oferece uma interface visual intuitiva que permite aos gestores visualizar a carga de trabalho de cada membro da equipe, adicionar, editar e mover tarefas em uma linha do tempo semanal.

Este projeto foi desenvolvido com uma filosofia inspirada na **Clean Architecture**, mesmo sendo um monorepo. O objetivo é manter uma separação clara entre as responsabilidades do back-end (lógica de negócio, acesso a dados) e do front-end (interface do usuário, estado da UI), garantindo um código organizado, manutenível e escalável.

---

## Arquitetura e Conceitos Aplicados

A estrutura do projeto segue uma abordagem de componentização e separação de responsabilidades, dividindo o código em camadas lógicas:

- **`src/app`**: Contém as páginas da aplicação (rotas) e a lógica de UI do lado do cliente (`"use client"`), seguindo o padrão do App Router do Next.js.
- **`src/app/api`**: Endpoints da API, que servem como a camada de entrada para o back-end. Eles recebem as requisições HTTP e as delegam para os serviços da aplicação.
- **`src/core`**: O coração do back-end.
    - **`models`**: Define as entidades de negócio da aplicação (Pessoa, Projeto, Atividade).
    - **`ports`**: Define as interfaces (contratos) para os repositórios, garantindo a inversão de dependência. O core não sabe qual banco de dados está sendo usado.
    - **`services`**: Contém a lógica de negócio da aplicação (casos de uso), como `CriarAtividade` ou `BuscarAlocacaoSemana`.
- **`src/infrastructure`**: Implementação das interfaces definidas no `core`.
    - **`repositories`**: Implementações concretas dos repositórios (ex: `MongoDbPessoaRepository`) que interagem com o banco de dados.
    - **`factories`**: Fábricas de dependência para instanciar os serviços com suas implementações concretas.
- **`src/components`**: Componentes React reutilizáveis, divididos entre `features` (específicos de uma funcionalidade) e `ui` (genéricos).
- **`src/config`**: Configurações da aplicação, incluindo a conexão com o banco de dados e o inovador serviço de configuração.

### Principais Conceitos Implementados

- **Clean Architecture (Adaptada)**: Separação clara entre a lógica de negócio (core) e os detalhes de infraestrutura (framework, banco de dados), promovendo baixo acoplamento e alta testabilidade.
- **Inversão de Dependência**: O `core` define as interfaces (`ports`) e a `infrastructure` as implementa. Isso permite trocar o banco de dados ou qualquer outra dependência externa com o mínimo de impacto na lógica de negócio.
- **Service Layer**: A lógica de negócio é encapsulada em serviços, tornando os casos de uso explícitos e reutilizáveis.
- **API Endpoints como Controladores**: Os `route.ts` do Next.js agem como controladores, orquestrando o fluxo da requisição para a camada de serviço.
- **Componentização e Hooks**: O front-end é construído com componentes React e utiliza hooks customizados (`useDragAndDrop`) para isolar lógicas complexas.

---

## Principais Bibliotecas e Ferramentas

- **Framework**: [Next.js](https://nextjs.org/) (com App Router e Turbopack)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados**: [MongoDB](https://www.mongodb.com/)
- **UI & Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Drag and Drop**: [@dnd-kit](https://dndkit.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Validação de Código**: [ESLint](https://eslint.org/)
- **Documentação da API**: [@scalar/api-reference-react](https://github.com/scalar/scalar)

---

## Documentação da API

O projeto inclui uma documentação de API interativa gerada automaticamente. Para acessá-la, com o projeto rodando, navegue para:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Configuração e Gerenciamento de Ambientes

O `Allocation Team` utiliza um sistema de configuração flexível que se adapta a diferentes ambientes (desenvolvimento e produção).

### `ConfigService`

O `src/config/config.service.ts` é responsável por carregar as variáveis de ambiente.

- **Em Desenvolvimento (`NODE_ENV=development`)**: As configurações são lidas do arquivo `.env.yml` na raiz do projeto.
- **Em Produção**: As configurações são buscadas de um **Config Server**, cuja URL deve ser definida na variável de ambiente `CONFIG_SERVER_URL`.

### Configuração para Vercel

Para deploy na Vercel, você pode definir as variáveis de ambiente diretamente na plataforma (via dashboard ou Vercel CLI). O `ConfigService` foi projetado para, caso a `CONFIG_SERVER_URL` não esteja definida, automaticamente buscar as configurações diretamente do `process.env` da aplicação.

Você deve configurar as seguintes variáveis de ambiente na Vercel, utilizando a convenção de nomes em **MAIÚSCULAS e com underscores** (`_`) no lugar dos pontos (`.`):

-   `CONFIG_DATABASE_MONGODB_URI`: URI de conexão com o MongoDB (ex: `mongodb://user:pass@host:port/db_name`)
-   `CONFIG_DATABASE_MONGODB_DB_NAME`: Nome do banco de dados MongoDB (ex: `allocation_team`)

Exemplo de como seria a configuração de variáveis de ambiente na Vercel:

```
CONFIG_DATABASE_MONGODB_URI=mongodb://user:pass@your-mongo-host:27017/allocation_team
CONFIG_DATABASE_MONGODB_DB_NAME=allocation_team
```

### Arquivo `.env.yml`

Para rodar em ambiente de desenvolvimento, crie um arquivo `.env.yml` na raiz do projeto com a seguinte estrutura:

```yaml
config:
  database:
    mongodb:
      uri: "mongodb://admin:password123@localhost:27017"
      db_name: "allocation_team"
  # Outras configurações podem ser adicionadas aqui
```

**Importante**: Este arquivo **não deve** ser versionado no Git. Ele contém informações sensíveis.

---

## Rodando Localmente com Docker (Recomendado)

A maneira mais simples de configurar o ambiente de desenvolvimento é usando Docker.

### Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (v20 ou superior)

### Passos

1.  **Clone o repositório:**
```bash
    git clone <URL_DO_REPOSITORIO>
    cd allocation-team
    ```

2.  **Crie o arquivo de configuração `.env.yml`:**
    Crie o arquivo na raiz do projeto, como descrito na seção anterior.

3.  **Suba os contêineres do Docker:**
    Este comando irá iniciar o MongoDB e o Mongo Express.
```bash
    docker-compose up -d
```

4.  **Instale as dependências do projeto:**
```bash
    npm install
    ```

5.  **Rode a aplicação em modo de desenvolvimento:**
```bash
    npm run dev
    ```

-   Sua aplicação estará disponível em [http://localhost:3000](http://localhost:3000).
-   Você pode gerenciar o banco de dados visualmente através do Mongo Express em [http://localhost:8081](http://localhost:8081).

---

## Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento com Turbopack.
-   `npm run build`: Compila a aplicação para produção.
-   `npm run start`: Inicia o servidor de produção.
-   `npm run lint`: Executa o linter para verificar a qualidade do código.

---

## Débitos Técnicos

-   **Melhorar Divisão do Domínio**: Aprimorar a organização de models, ENUMs e outros objetos na camada de domínio (`core/models`).
-   **Criar Entidades**: Implementar `entities` para segregar as responsabilidades das variáveis entre as camadas de domínio e infraestrutura.
-   **Segurança**: Implementar uma tela de login e aplicar regras de segurança nos endpoints da API.
-   **Autenticação Centralizada**: Integrar o [Keycloak](https://www.keycloak.org/) para gerenciamento de identidade e acesso.

## Próximas Features (Roadmap)

-   **Autoavaliação Semanal**: Implementar um campo para que cada usuário possa registrar impeditivos, justificativas e uma revisão da semana, planejando a semana seguinte.
-   **Atividades Colaborativas**: Permitir a criação de um "card" para uma pessoa existente ao marcar uma atividade como sendo em conjunto.
-   **Gerenciamento de Skills**: Adicionar a funcionalidade de gerenciar as habilidades (skills) de cada pessoa.
-   **Gerenciamento de Pessoas**: Desenvolver uma tela dedicada para gerenciar (CRUD) as pessoas, superando a necessidade de alterações diretas no banco de dados.
-   **Gerenciamento de Projetos**: Criar uma tela para o gerenciamento completo de projetos.
-   **Indicadores de Gestão**: Desenvolver um painel com indicadores de alocação, previsibilidade de recursos e um gráfico de Gantt.

---
Este `README.md` é um documento vivo. Sinta-se à vontade para atualizá-lo conforme o projeto evolui.
