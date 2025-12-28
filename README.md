# Team Allocation Planning - Ferramenta de Alocação de Equipes

## Visão Geral

O **Team Allocation Planning** é uma aplicação web Full-Stack construída com **Next.js**, projetada para facilitar o gerenciamento e a alocação de tempo de equipes em diferentes projetos e atividades. A ferramenta oferece uma interface visual intuitiva que permite aos gestores visualizar a carga de trabalho de cada membro da equipe, adicionar, editar e mover tarefas em uma linha do tempo semanal.

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
- **`src/config`**: Configurações da aplicação, incluindo a conexão com o banco de dados e o serviço de configuração.

### Principais Conceitos Implementados

- **Clean Architecture (Adaptada)**: Separação clara entre a lógica de negócio (core) e os detalhes de infraestrutura (framework, banco de dados), promovendo baixo acoplamento e alta testabilidade.
- **Inversão de Dependência**: O `core` define as interfaces (`ports`) e a `infrastructure` as implementa. Isso permite trocar o banco de dados ou qualquer outra dependência externa com o mínimo de impacto na lógica de negócio.
- **Service Layer**: A lógica de negócio é encapsulada em serviços, tornando os casos de uso explícitos e reutilizáveis.
- **API Endpoints como Controladores**: Os arquivos `route.ts` do Next.js agem como controladores, orquestrando o fluxo da requisição para a camada de serviço.
- **Componentização e Hooks**: O front-end é construído com componentes React e utiliza hooks customizados (ex: `useDragAndDrop`) para isolar lógicas complexas.

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

O `Team Allocation Planning` utiliza um sistema de configuração flexível que se adapta a diferentes ambientes (desenvolvimento e produção).

### `ConfigService`

O `src/config/config.service.ts` é responsável por carregar as variáveis de ambiente de forma segura.

- **Em Desenvolvimento (`NODE_ENV=development`)**: As configurações são lidas do arquivo `.env.yml` na raiz do projeto e processadas em build time para compatibilidade com Edge Runtime.
- **Em Produção**: As configurações são buscadas de um **Config Server**, cuja URL deve ser definida na variável de ambiente `CONFIG_SERVER_URL`.

### Processamento em Build Time

Para garantir compatibilidade com o Edge Runtime (usado pelo middleware do Next.js), as configurações do arquivo `.env.yml` são processadas em build time através do script `scripts/build-config.js`. Este script:

1. Lê o arquivo `.env.yml` durante o build
2. Gera um arquivo `src/config/build-time-config.ts` com as configurações
3. Este arquivo é usado pelo `ConfigService` em runtime

**Scripts relacionados:**
- `npm run build:config`: Processa as configurações do `.env.yml`
- `npm run dev`: Executa automaticamente o build das configurações antes de iniciar o servidor
- `npm run build`: Executa automaticamente o build das configurações antes de compilar para produção

### Inicialização Preguiçosa (Lazy Loading) de Configurações

Para evitar erros durante o processo de build do Next.js, que pode tentar acessar `process.env` antes de estar disponível, o sistema de configuração e a conexão com o banco de dados foram refatorados para usar um padrão de **inicialização preguiçosa (lazy loading)**.

Isso significa que as configurações e a conexão com o banco só são carregadas na **primeira requisição da aplicação**, e não durante o build.

**Como adicionar novas configurações de forma segura:**

1.  Adicione a nova variável no seu arquivo `.env.yml` (para desenvolvimento) ou no seu Config Server (para produção).
2.  No módulo onde você precisa da configuração (ex: um repositório, um serviço), utilize o `configService` para buscar o valor.
3.  **Importante**: Faça a chamada ao `configService.get()` dentro de uma função `async`, no momento do uso, e não no escopo global do módulo.

**Exemplo:**
```typescript
// Dentro de uma função de um repositório ou serviço
import { configService } from '@/config/config.service';

async function minhaFuncaoQueUsaConfig() {
  // A configuração é buscada aqui, no momento da execução
  const minhaChaveSecreta = await configService.get<string>('config.minha_api.chave_secreta');
  
  // Use a chave...
}
```
**Nunca faça isso no topo do arquivo**, pois anularia o benefício do lazy loading:
```typescript
// EVITAR! Isso será executado no tempo de build.
const minhaChaveSecreta = await configService.get<string>('config.minha_api.chave_secreta'); // ERRADO

export class MeuServico {
  // ...
}
```

### Arquivo `.env.yml`

Para rodar em ambiente de desenvolvimento, crie um arquivo `.env.yml` na raiz do projeto com a seguinte estrutura:

```yaml
server:
  port: 3000

config:
  database:
    mongodb:
      uri: "mongodb://admin:password123@localhost:27017"
      db_name: "tap"
  
  # Configurações do NextAuth
  NEXTAUTH_SECRET: "seu-secret-aqui"
  NEXTAUTH_URL: "http://localhost:3000"
  
  # URL do servidor de configuração (para produção)
  CONFIG_SERVER_URL: "https://seu-config-server.com/config"
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
    cd tap-webapp
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
-   **Criar Entidades**: Implementar `entidades` para segregar as responsabilidades das variáveis entre as camadas de domínio e infraestrutura.
-   **Segurança**: Implementar uma tela de login e aplicar regras de segurança nos endpoints da API.
-   **Autenticação Centralizada**: Integrar o `Keycloak` para gerenciamento de identidade e acesso.

## Próximas Features (Roadmap)

-   **Gerenciamento de Skills**: Adicionar a funcionalidade de gerenciar as habilidades (skills) de cada pessoa.
-   **Gerenciamento de Pessoas**: Desenvolver uma tela dedicada para gerenciar (CRUD) as pessoas, superando a necessidade de alterações diretas no banco de dados.
-   **Gerenciamento de Projetos**: Criar uma tela para o gerenciamento completo de projetos.
-   **Indicadores de Gestão**: Desenvolver um painel com indicadores de alocação, previsibilidade de recursos e um gráfico de Gantt.

---
Este `README.md` é um documento vivo. Sinta-se à vontade para atualizá-lo conforme o projeto evolui.
