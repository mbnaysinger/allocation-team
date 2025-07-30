# Documentação Técnica - Sistema de Alocação de Equipe

## 📋 Visão Geral

Este projeto é um sistema de alocação de equipe desenvolvido com Next.js 15, TypeScript e suporte a múltiplos bancos de dados (Firebase e MongoDB). O sistema permite gerenciar pessoas, projetos e atividades com funcionalidades de drag-and-drop para reorganização de alocações.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica Principal

- **Framework**: Next.js 15.3.4 (App Router)
- **Linguagem**: TypeScript 5
- **UI Framework**: Tailwind CSS 4
- **React**: 19.0.0
- **Bancos de Dados**: Firebase Firestore + MongoDB
- **Drag & Drop**: @dnd-kit/core e @dnd-kit/sortable
- **Animações**: GSAP 3.13.0
- **Ícones**: Lucide React
- **Tooltips**: React Tooltip

### Estrutura de Diretórios

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── allocation/         # Página principal de alocação
│   ├── api/               # API Routes
│   ├── atoms/             # Componentes atômicos (Design System)
│   ├── molecules/         # Componentes moleculares
│   └── globals.css        # Estilos globais
├── hooks/                 # Custom hooks
├── lib/                   # Configurações e serviços
├── types/                 # Definições de tipos TypeScript
└── scripts/              # Scripts de teste e inicialização
```

## 🎨 Design System e UI/UX

### Atomic Design
O projeto segue a metodologia Atomic Design com três níveis:

1. **Atoms** (`src/app/atoms/`):
   - `Button.tsx` - Botões reutilizáveis
   - `CodeBlock.tsx` - Blocos de código
   - `DraggableActivityCard.tsx` - Cards de atividade arrastáveis
   - `DroppableDayColumn.tsx` - Colunas para receber atividades
   - `Heading.tsx` - Títulos padronizados
   - `TarjaHoras.tsx` - Indicador visual de horas

2. **Molecules** (`src/app/molecules/`):
   - `AllocationControls.tsx` - Controles de navegação
   - `AllocationHeader.tsx` - Cabeçalho da aplicação
   - `AllocationLegend.tsx` - Legenda de cores e tipos
   - `ModalAdicionarPessoa.tsx` - Modal para adicionar pessoas
   - `ModalAdicionarProjeto.tsx` - Modal para adicionar projetos
   - `ModalAdicionarAtividade.tsx` - Modal para adicionar atividades
   - `ModalEditarAtividade.tsx` - Modal para editar atividades
   - `PersonCard.tsx` - Cards de pessoas

### Design System
- **Cores**: Paleta baseada em azul escuro (#0A192F) com acentos em verde (#64FFDA)
- **Tipografia**: Sistema responsivo com clamp() para escalabilidade
- **Componentes**: Glassmorphism com backdrop-blur e sombras sutis
- **Responsividade**: Design mobile-first com breakpoints otimizados

## 🗄️ Arquitetura de Dados

### Modelos de Dados (TypeScript)

```typescript
// Tipos principais
interface Pessoa {
  id: string;
  nome: string;
  cargo: Cargo; // 'Analista de TI' | 'Analista de Negócios'
  ativo: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

interface Projeto {
  id: string;
  abreviatura: string;
  nome: string;
  descricao: string;
  entidade?: Entidade; // SESI, SENAI, IEL, etc.
  linkJira?: string;
  ativo: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

interface Atividade {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD format
  pessoaId: string;
  tipo: TipoAtividade; // 'Projeto' | 'Melhoria' | 'Sustentação'
  projetoId?: string;
  descricaoJira?: string;
  horas: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

### Sistema de Cores para Horas
```typescript
const getCoresHoras = (totalHoras: number) => {
  if (totalHoras === 0) return { cor: '#f3f4f6', texto: '#000000' }; // Cinza
  if (totalHoras <= 4) return { cor: '#f7fc6d', texto: '#000000' };   // Amarelo
  if (totalHoras <= 8) return { cor: '#6af27a', texto: '#000000' };   // Verde
  if (totalHoras > 8) return { cor: '#f53b3b', texto: '#FFFFFF' };    // Vermelho
};
```

## 🔄 Sistema de Bancos de Dados

### Arquitetura Multi-Database

O sistema suporta dois bancos de dados com configuração dinâmica:

#### 1. Firebase Firestore
- **Configuração**: `src/lib/firebase.ts`
- **Serviços**: `src/lib/firestore.ts`
- **Hook**: `src/hooks/useGerenciadorAtividades.ts`

#### 2. MongoDB
- **Configuração**: `src/lib/mongodb.ts`
- **Serviços**: `src/lib/mongodb-service.ts`
- **Hook**: `src/hooks/useMongoDBClient.ts`

### Configuração Dinâmica
```typescript
// src/lib/config.ts
export const CONFIG = {
  DATABASE: process.env.NEXT_PUBLIC_DATABASE || 'mongodb',
  MONGODB: { URI: process.env.MONGODB_URI, DB: process.env.MONGODB_DB },
  FIREBASE: { API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, ... }
};
```

### Hook Unificado
```typescript
// src/hooks/useDatabase.ts
export const useDatabase = ({ dataInicio, dataFim }: UseDatabaseProps) => {
  const mongodbHook = useMongoDBClient({ dataInicio, dataFim });
  
  if (isUsingMongoDB()) {
    return { ...mongodbHook, databaseType: 'mongodb' };
  } else {
    const { useGerenciadorAtividades } = require('./useGerenciadorAtividades');
    const firebaseHook = useGerenciadorAtividades({ dataInicio, dataFim });
    return { ...firebaseHook, databaseType: 'firebase' };
  }
};
```

## 🎯 Funcionalidades Principais

### 1. Sistema de Drag & Drop
- **Implementação**: `src/hooks/useDragAndDrop.ts`
- **Componentes**: `DraggableActivityCard.tsx` e `DroppableDayColumn.tsx`
- **Funcionalidades**:
  - Arrastar atividades entre dias
  - Feedback visual durante arrasto
  - Validação de movimentação
  - Persistência automática

### 2. Gerenciamento de Estado
- **Hooks Customizados**: 
  - `useDatabase.ts` - Gerenciamento de dados
  - `useDragAndDrop.ts` - Estado de drag & drop
  - `useScrollPreservation.ts` - Preservação de scroll
- **Estado Local**: React useState para modais e seleções
- **Otimizações**: Funções otimizadas para atualizações específicas

### 3. Sistema de Modais
- **Modais Implementados**:
  - Adicionar Pessoa
  - Adicionar Projeto
  - Adicionar Atividade
  - Editar Atividade
  - Firebase Debugger

### 4. Navegação Temporal
- **Semana Atual**: Navegação por semanas
- **Controles**: Botões anterior/próximo
- **Filtros**: Data de início e fim dinâmicos

## 🐳 Containerização e DevOps

### Docker Compose
```yaml
services:
  mongodb:
    image: mongo:latest
    ports: ["27017:27017"]
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      
  mongo-express:
    image: mongo-express:1.0.0
    ports: ["8081:8081"]
    # Interface web para MongoDB
```

### Scripts de Teste
- `scripts/test-firebase.js` - Testes do Firebase
- `scripts/test-mongodb.js` - Testes do MongoDB
- `scripts/test-persistence.js` - Testes de persistência
- `scripts/init-mongo.js` - Inicialização do MongoDB

## 🔧 Configurações e Build

### Next.js Config
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // Configurações do Next.js 15
};
```

### Tailwind CSS
```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: { bg: '#0A192F', accent: '#64FFDA' },
      fontSize: { base: 'clamp(1rem, 1.125vw, 1.125rem)' },
      boxShadow: { glass: '0 4px 32px 0 rgba(10,25,47,0.25)' }
    }
  }
};
```

### ESLint
```javascript
// eslint.config.mjs
export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    }
  }
];
```

## 📊 Performance e Otimizações

### 1. Lazy Loading
- Importação dinâmica do Firebase apenas quando necessário
- Componentes carregados sob demanda

### 2. Caching
- Conexões MongoDB cacheadas globalmente
- Hot reload otimizado para desenvolvimento

### 3. Otimizações de Estado
- Funções otimizadas para atualizações específicas
- Preservação de scroll entre navegações
- Debounce em operações de drag & drop

### 4. Bundle Optimization
- Turbopack habilitado para desenvolvimento
- Tree shaking automático
- Code splitting por rota

## 🔒 Segurança

### Variáveis de Ambiente
- Configurações sensíveis em `.env.local`
- Validação de configurações no startup
- Separação entre client e server-side

### Validação de Dados
- TypeScript para type safety
- Validação de entrada nos modais
- Sanitização de dados antes da persistência

## 🧪 Testes e Qualidade

### Scripts de Teste
```json
{
  "scripts": {
    "test:firebase": "node scripts/test-firebase.js",
    "test:mongodb": "node scripts/test-mongodb.js",
    "test:persistence": "node scripts/test-persistence.js"
  }
}
```

### Logging
- Sistema de logging transacional (`src/lib/logger.ts`)
- Rastreamento de operações
- Debug de erros estruturado

## 🚀 Deploy e Infraestrutura

### Vercel Analytics
- Integração com `@vercel/analytics`
- Monitoramento de performance
- Métricas de uso

### Environment Variables
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# MongoDB
MONGODB_URI=
MONGODB_DB=

# Database Selection
NEXT_PUBLIC_DATABASE=mongodb
```

## 📈 Métricas e Monitoramento

### Performance Metrics
- Core Web Vitals
- Bundle size analysis
- Runtime performance

### Error Tracking
- Console logging estruturado
- Error boundaries
- Transaction logging

## 🔄 Versionamento e Releases

### Dependências Principais
- **Next.js**: 15.3.4 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5
- **Tailwind CSS**: 4
- **MongoDB**: 6.3.0
- **Firebase**: 12.0.0

### Compatibilidade
- Node.js 18+
- NPM 9+
- Docker 20+

## 📝 Conclusão

Este sistema representa uma arquitetura moderna e escalável para gerenciamento de alocação de equipe, com:

- **Flexibilidade**: Suporte a múltiplos bancos de dados
- **Performance**: Otimizações de bundle e runtime
- **UX**: Interface intuitiva com drag & drop
- **Manutenibilidade**: Código bem estruturado e tipado
- **Escalabilidade**: Arquitetura modular e extensível

A combinação de Next.js 15, TypeScript e design system bem definido proporciona uma base sólida para futuras expansões e melhorias do sistema. 