import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../app';
import {
  clearTestState,
  setupTestDatabase,
  teardownTestDatabase,
} from './test-utils';

const request = supertest(app);

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearTestState();
  delete process.env.APP_VERSION;
  delete process.env.GIT_SHA;
  delete process.env.CORS_ORIGIN;
  process.env.NODE_ENV = 'test';
  delete process.env.ENABLE_DEMO_INCIDENTS;
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('operational endpoints', () => {
  it('returns a complete healthy payload from GET /health', async () => {
    const res = await request.get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('be-chsrc-construct');
    expect(res.body.database.status).toBe('up');
    expect(res.body.database.latencyMs).toEqual(expect.any(Number));
    expect(res.body.incident.active).toBe(false);
    expect(res.body.uptimeSec).toEqual(expect.any(Number));
    expect(res.body.memoryRssBytes).toEqual(expect.any(Number));
  });

  it('returns version metadata from GET /version', async () => {
    process.env.APP_VERSION = 'test-version';
    process.env.GIT_SHA = 'abcdef123456';

    const res = await request.get('/version');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      service: 'be-chsrc-construct',
      version: 'test-version',
      gitSha: 'abcdef1',
      environment: 'test',
    });
    expect(res.body.nodeVersion).toEqual(expect.any(String));
  });

  it('returns Prometheus metrics from GET /metrics', async () => {
    const res = await request.get('/metrics');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('# HELP');
    expect(res.text).toContain('be_chsrc_construct_');
  });

  it('activates and resets a degraded incident', async () => {
    const incidentRes = await request
      .post('/incident')
      .send({ mode: 'degraded' });

    expect(incidentRes.status).toBe(201);
    expect(incidentRes.body).toMatchObject({
      active: true,
      mode: 'degraded',
    });

    const degradedHealth = await request.get('/health');
    expect(degradedHealth.status).toBe(503);
    expect(degradedHealth.body.status).toBe('degraded');

    const resetRes = await request.delete('/incident');
    expect(resetRes.status).toBe(200);
    expect(resetRes.body).toMatchObject({
      active: false,
      mode: null,
    });

    const restoredHealth = await request.get('/health');
    expect(restoredHealth.status).toBe(200);
  });

  it('returns 500 from the probe during an error incident', async () => {
    await request.post('/incident').send({ mode: 'error' });

    const res = await request.get('/incident/probe');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('internal server error');
    expect(res.body.requestId).toEqual(expect.any(String));
  });

  it('validates the incident body', async () => {
    const res = await request.post('/incident').send({ mode: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('validation error');
    expect(res.body.issues[0].path).toBe('mode');
  });

  it('hides incident routes in production unless explicitly enabled', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_DEMO_INCIDENTS;

    const res = await request.get('/incident');

    expect(res.status).toBe(404);
  });
});

describe('security middleware', () => {
  it('adds Helmet security headers and hides x-powered-by', async () => {
    const res = await request.get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('allows configured CORS origins', async () => {
    process.env.CORS_ORIGIN = 'https://allowed.example';

    const res = await request
      .get('/health')
      .set('Origin', 'https://allowed.example');

    expect(res.headers['access-control-allow-origin']).toBe(
      'https://allowed.example',
    );
  });

  it('does not allow unconfigured CORS origins', async () => {
    process.env.CORS_ORIGIN = 'https://allowed.example';

    const res = await request
      .get('/health')
      .set('Origin', 'https://blocked.example');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
