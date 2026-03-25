# be-chsrc-construct

MVP de API com Node.js, TypeScript, Express e TypeORM.

## Requisitos

- Node.js 18+

## Como executar

```bash
npm install
npm run dev
```

API padrão em `http://localhost:3000`.

## Build e produção

```bash
npm run build
npm run start
```

## Endpoints

- `GET /health`
- `GET /users`
- `POST /users`

Exemplo de payload para criar usuário:

```json
{
  "name": "Lucas",
  "email": "lucas@email.com"
}
```

## Banco de dados

- SQLite local em `database.sqlite`
- `TypeORM` com `synchronize: true` (adequado para MVP)
