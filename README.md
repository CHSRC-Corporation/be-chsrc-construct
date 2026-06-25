# be-chsrc-construct

Backend MVP em Node.js, TypeScript, Express, TypeORM e SQLite. Esta versão adiciona o pacote DevOps/Cloud pedido para a entrega: observabilidade, healthcheck real, incidente controlado, Docker, CI e documentação de evidências.

## Stack

- Node.js 22
- Express 5
- TypeScript
- TypeORM
- PostgreSQL em dev/producao; SQLite em memoria (`better-sqlite3`) apenas nos testes
- Vitest + Supertest
- Pino, Prometheus metrics, Helmet, CORS e Zod
- Docker e GitHub Actions

## Configuracao

Copie `.env.example` para `.env` quando quiser rodar com variaveis locais.

| Variavel | Descricao | Padrao |
| --- | --- | --- |
| `PORT` | Porta HTTP | `3000` |
| `NODE_ENV` | Ambiente de execucao | `development` |
| `DATABASE_URL` | Connection string do PostgreSQL (Render/docker) | variaveis `DB_*` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Conexao Postgres quando nao usa `DATABASE_URL` | `localhost` / `5432` / `postgres` / `postgres` / `chsrc` |
| `DB_SSL` | Habilita SSL no Postgres (URL externa de gerenciados) | `false` |
| `APP_VERSION` | Versao exibida em `/version` | `package.json` |
| `GIT_SHA` / `GITHUB_SHA` | SHA exibido em `/version` | `local` |
| `LOG_LEVEL` | Nivel do Pino | `info` |
| `CORS_ORIGIN` | Origens permitidas, separadas por virgula | permissivo fora de producao |
| `ENABLE_DEMO_INCIDENTS` | Habilita rotas de incidente em producao | `false` |
| `JWT_SECRET` | Segredo para assinar os JWTs (obrigatorio em producao) | dev fallback |
| `JWT_EXPIRES_IN` | Validade do token | `1d` |

> Os testes usam SQLite em memoria automaticamente (`NODE_ENV=test`), entao nao precisam de um Postgres rodando.

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm test
pnpm test:coverage
```

## Endpoints

Base local: `http://localhost:3000`

| Metodo | Rota | Objetivo |
| --- | --- | --- |
| `GET` | `/health` | Estado da API, uptime, memoria, ambiente, banco e incidente |
| `GET` | `/version` | Servico, versao, SHA, Node e ambiente |
| `GET` | `/metrics` | Metricas Prometheus do processo Node |
| `GET` | `/incident` | Estado do incidente de demonstracao |
| `POST` | `/incident` | Ativa incidente com `degraded`, `error` ou `slow` |
| `DELETE` | `/incident` | Restaura o estado normal |
| `GET` | `/incident/probe` | Rota para demonstrar erro ou lentidao controlada |
| `POST` | `/auth/register` | Cadastra usuario (nome, email, senha; `confirmPassword` opcional) e devolve um JWT |
| `POST` | `/auth/login` | Autentica por email e senha e devolve um JWT |
| `GET` | `/users` | Lista usuarios (**requer** `Authorization: Bearer <token>`) |
| `GET` | `/users/me` | Dados do usuario autenticado (**requer** token) |

## Autenticacao

O cadastro e o login devolvem um JWT no campo `token`. O front-end armazena esse
token no `localStorage` e o envia em cada requisicao protegida no header
`Authorization: Bearer <token>`. A senha e gravada com hash (bcrypt) e nunca e
retornada pela API. Defina `JWT_SECRET` (obrigatorio em producao) e, opcionalmente,
`JWT_EXPIRES_IN` (padrao `1d`).

Exemplos:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/version
curl -s http://localhost:3000/metrics | head
curl -X POST http://localhost:3000/incident \
  -H "Content-Type: application/json" \
  -d '{"mode":"degraded"}'
curl -i http://localhost:3000/health
curl -X DELETE http://localhost:3000/incident

# Cadastro -> devolve { user, token }
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@example.com","password":"senha12345"}'

# Login -> devolve { user, token }
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","password":"senha12345"}'

# Rota protegida (substitua <token> pelo JWT recebido)
curl http://localhost:3000/users -H "Authorization: Bearer <token>"
```

## Docker

O Compose sobe dois servicos: `db` (PostgreSQL 16) e `api`. A API espera o
healthcheck do Postgres ficar saudavel antes de iniciar e conecta via
`DATABASE_URL`. Os dados do banco ficam no volume nomeado `postgres_data`.

```bash
docker compose up --build -d
docker compose ps
docker logs be-chsrc-construct --tail 50
curl -i http://localhost:3000/health
docker compose stop
docker compose down
```

## CI

O workflow `.github/workflows/ci.yml` roda em push e pull request para `main` e `dev`:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test:coverage`
- `docker build`
- upload de `coverage/` e `dist/`

## Evidencias da entrega

Use os arquivos em `docs/` para organizar a apresentacao:

- `docs/evidence-checklist.md`
- `docs/postmortem.md`
- `docs/presentation-notes.md`

Fluxo recomendado de demonstracao: subir com Docker, mostrar `/health`, `/version`, logs, `/metrics`, ativar incidente, provar `/health` em `503`, resetar incidente, rodar coverage e mostrar CI verde.
