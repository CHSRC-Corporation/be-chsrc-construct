# be-chsrc-construct

API mínima (MVP) construída com Node.js, TypeScript, Express e TypeORM, usando SQLite local.

## Sumário

- Visão geral
- Stack
- Requisitos
- Configuração
- Instalação e execução
- Scripts
- Endpoints
- Banco de dados
- Estrutura do projeto

## Visão geral

Este projeto expõe uma API HTTP com:

- Endpoint de saúde
- Operações iniciais de usuários (listar e criar)

A aplicação inicializa o `DataSource` do TypeORM no startup; se a conexão com o banco falhar, o processo encerra com erro.

## Stack

- Runtime: Node.js
- Linguagem: TypeScript
- HTTP: Express
- ORM: TypeORM
- Banco: SQLite (arquivo local)

## Requisitos

- Node.js 18+
- npm (ou gerenciador compatível)

## Configuração

Variáveis de ambiente suportadas:

- `PORT` (opcional): porta do servidor HTTP. Padrão: `3000`.

## Instalação e execução

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento (hot reload):

```bash
npm run dev
```

Por padrão, a API fica disponível em `http://localhost:3000`.

## Scripts

- `npm run dev`: inicia o servidor via `ts-node-dev` (TypeScript diretamente)
- `npm run build`: compila TypeScript para `dist/`
- `npm run start`: executa o build gerado em `dist/server.js`

Build e execução em modo produção:

```bash
npm run build
npm run start
```

## Endpoints

Base URL (local): `http://localhost:3000`

### Health check

- `GET /health`

Resposta (200):

```json
{ "status": "ok" }
```

Exemplo:

```bash
curl -s http://localhost:3000/health
```

### Listar usuários

- `GET /users`

Retorna uma lista de usuários ordenada por `createdAt` (mais recentes primeiro).

Exemplo:

```bash
curl -s http://localhost:3000/users
```

### Criar usuário

- `POST /users`
- `Content-Type: application/json`

Body:

```json
{
  "name": "Lucas",
  "email": "lucas@email.com"
}
```

Exemplo:

```bash
curl -s -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Lucas","email":"lucas@email.com"}'
```

Respostas de erro:

- (400) `name and email are required`
- (409) `email already exists`

## Banco de dados

- SQLite local em `database.sqlite`
- O TypeORM está configurado com `synchronize: true`, o que é apropriado para MVP e desenvolvimento, mas não é recomendado para cenários de produção (prefira migrações e `synchronize: false`).

Configuração do DataSource: [src/config/data-source.ts](src/config/data-source.ts)

## Estrutura do projeto

- Entrada do servidor e inicialização do banco: [src/server.ts](src/server.ts)
- Configuração do Express: [src/app.ts](src/app.ts)
- Rotas HTTP: [src/routes/index.ts](src/routes/index.ts)
- Entidades TypeORM: [src/entities/User.ts](src/entities/User.ts)
