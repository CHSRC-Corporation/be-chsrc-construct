# be-chsrc-construct

Backend MVP em Node.js, TypeScript, Express, TypeORM e SQLite. Esta versão adiciona o pacote DevOps/Cloud pedido para a entrega: observabilidade, healthcheck real, incidente controlado, Docker, CI e documentação de evidências.

## Stack

- Node.js 22
- Express 5
- TypeScript
- TypeORM
- SQLite com `better-sqlite3`
- Vitest + Supertest
- Pino, Prometheus metrics, Helmet, CORS e Zod
- Docker e GitHub Actions

## Configuracao

Copie `.env.example` para `.env` quando quiser rodar com variaveis locais.

| Variavel | Descricao | Padrao |
| --- | --- | --- |
| `PORT` | Porta HTTP | `3000` |
| `NODE_ENV` | Ambiente de execucao | `development` |
| `DB_PATH` | Caminho do arquivo SQLite | `database.sqlite` |
| `APP_VERSION` | Versao exibida em `/version` | `package.json` |
| `GIT_SHA` / `GITHUB_SHA` | SHA exibido em `/version` | `local` |
| `LOG_LEVEL` | Nivel do Pino | `info` |
| `CORS_ORIGIN` | Origens permitidas, separadas por virgula | permissivo fora de producao |
| `ENABLE_DEMO_INCIDENTS` | Habilita rotas de incidente em producao | `false` |

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
| `GET` | `/users` | Lista usuarios |
| `POST` | `/users` | Cria usuario |

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
```

## Docker

O container usa `DB_PATH=/data/app.db`; o Compose monta um volume nomeado para persistir o SQLite fora do ciclo de vida do container.

```bash
docker build -t be-chsrc-construct:local .
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
