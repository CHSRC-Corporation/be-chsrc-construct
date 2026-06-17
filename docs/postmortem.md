# Postmortem: incidente controlado

## Descricao

Incidente simulado por `POST /incident` para demonstrar degradacao controlada da API sem derrubar o processo.

## Impacto

O modo `degraded` faz `GET /health` retornar `503`, indicando que o servico nao esta pronto para receber trafego.

## Causa raiz

Estado de incidente em memoria ativado intencionalmente para simular uma condicao operacional ruim.

## Diagnostico

O time identifica a degradacao por:

- `/health` retornando `503`
- logs estruturados registrando a ativacao do incidente
- `/incident` mostrando o estado ativo

## Correcao

Executar `DELETE /incident` para limpar o estado de demonstracao.

## Restauracao

Confirmar `GET /health` retornando `200` e payload com `status: "ok"`.

## Acoes preventivas

- Manter healthcheck com dependencia real do banco.
- Manter logs estruturados por request.
- Cobrir incidente e restauracao em testes automatizados.
- Usar CI para impedir regressao antes do deploy.

## Licoes aprendidas

Incidentes devem ter sinalizacao clara, diagnostico reproduzivel, restauracao simples e evidencia tecnica registrada.
