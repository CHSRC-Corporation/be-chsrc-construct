# Evidence checklist

Capture as evidencias abaixo para a apresentacao.

| Evidencia | Comando ou tela |
| --- | --- |
| API saudavel | `curl -i http://localhost:3000/health` |
| Versao da API | `curl -i http://localhost:3000/version` |
| Logs estruturados | `docker logs be-chsrc-construct --tail 50` |
| Metricas | `curl -s http://localhost:3000/metrics \| head` |
| Incidente ativado | `curl -X POST http://localhost:3000/incident -H "Content-Type: application/json" -d '{"mode":"degraded"}'` |
| Impacto do incidente | `curl -i http://localhost:3000/health` retornando `503` |
| Restauracao | `curl -X DELETE http://localhost:3000/incident` e novo `/health` retornando `200` |
| Testes e coverage | `pnpm test:coverage` |
| CI verde | Screenshot da run no GitHub Actions |
| Docker | `docker compose up --build -d` e `docker compose ps` |
| Persistencia SQLite | Mostrar volume `sqlite_data` no Compose |
| Shutdown gracioso | `docker compose stop` e logs de shutdown limpo |
