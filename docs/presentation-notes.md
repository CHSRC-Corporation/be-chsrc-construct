# Presentation notes

- O backend agora expoe endpoints operacionais alem das rotas de dominio.
- `/health` valida API e SQLite, retornando `503` quando o servico esta degradado.
- `/version` facilita rastrear versao, ambiente e SHA do deploy.
- Logs estruturados em JSON mostram metodo, rota, status, tempo de resposta e request id.
- `/metrics` expoe metricas padrao do Node para Prometheus.
- O incidente controlado permite demonstrar impacto, diagnostico, correcao e restauracao sem matar o processo.
- Docker empacota a API com Node 22 e persiste o SQLite em volume.
- O CI compila, roda coverage, constroi imagem Docker e publica artifacts.
- O postmortem mostra melhoria continua, que e parte central de DevOps.
