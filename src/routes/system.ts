import { performance } from 'node:perf_hooks';
import { memoryUsage, uptime, versions } from 'node:process';
import { Response, Router } from 'express';
import { z } from 'zod';
import { AppDataSource } from '../config/data-source';
import { SERVICE_NAME, getVersionInfo } from '../config/service-info';
import { logger } from '../logger';
import { validateBody } from '../middlewares/validate';
import { metricsRegister } from '../observability/metrics';
import {
  activateIncident,
  demoIncidentsEnabled,
  getIncidentState,
  INCIDENT_MODES,
  isIncidentModeActive,
  resetIncident,
} from '../state/incident-state';

const systemRouter = Router();

const incidentSchema = z.object({
  mode: z.enum(INCIDENT_MODES),
});

function incidentUnavailableResponse(res: Response) {
  return res.status(404).json({ message: 'not found' });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

systemRouter.get('/health', async (_req, res) => {
  const databaseStart = performance.now();
  let databaseStatus: 'up' | 'down' = 'down';
  let databaseLatencyMs: number | null = null;
  let databaseError: string | undefined;

  try {
    if (!AppDataSource.isInitialized) {
      throw new Error('data-source-not-initialized');
    }

    await AppDataSource.query('SELECT 1');
    databaseLatencyMs = Math.round(performance.now() - databaseStart);
    databaseStatus = 'up';
  } catch (error) {
    databaseError =
      error instanceof Error ? error.message : 'unknown database error';
  }

  const incident = getIncidentState();
  const isDegraded = incident.active && incident.mode === 'degraded';
  const isHealthy = databaseStatus === 'up' && !isDegraded;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    uptimeSec: Math.floor(uptime()),
    nodeVersion: versions.node,
    memoryRssBytes: memoryUsage().rss,
    database: {
      status: databaseStatus,
      latencyMs: databaseLatencyMs,
      error: databaseError,
    },
    incident,
  });
});

systemRouter.get('/version', (_req, res) => {
  return res.status(200).json(getVersionInfo());
});

systemRouter.get('/metrics', async (_req, res, next) => {
  try {
    res.setHeader('Content-Type', metricsRegister.contentType);
    return res.status(200).send(await metricsRegister.metrics());
  } catch (error) {
    return next(error);
  }
});

systemRouter.get('/incident', (_req, res) => {
  if (!demoIncidentsEnabled()) {
    return incidentUnavailableResponse(res);
  }

  return res.status(200).json(getIncidentState());
});

systemRouter.post('/incident', validateBody(incidentSchema), (req, res) => {
  if (!demoIncidentsEnabled()) {
    return incidentUnavailableResponse(res);
  }

  const { mode } = req.body as z.infer<typeof incidentSchema>;
  const incident = activateIncident(mode);
  logger.warn(
    { incident, requestId: req.get('x-request-id') },
    'demo incident activated',
  );

  return res.status(201).json(incident);
});

systemRouter.delete('/incident', (req, res) => {
  if (!demoIncidentsEnabled()) {
    return incidentUnavailableResponse(res);
  }

  const incident = resetIncident();
  logger.info(
    { incident, requestId: req.get('x-request-id') },
    'demo incident reset',
  );

  return res.status(200).json(incident);
});

systemRouter.get('/incident/probe', async (_req, res) => {
  if (!demoIncidentsEnabled()) {
    return incidentUnavailableResponse(res);
  }

  if (isIncidentModeActive('error')) {
    throw new Error('controlled demo incident error');
  }

  if (isIncidentModeActive('slow')) {
    await wait(750);
  }

  return res.status(200).json({
    status: 'ok',
    incident: getIncidentState(),
  });
});

export { systemRouter };
