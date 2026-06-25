import { afterEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../app';

const request = supertest(app);

const originalCors = process.env.CORS_ORIGIN;
const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.CORS_ORIGIN = originalCors;
  process.env.NODE_ENV = originalEnv;
});

describe('CORS - CORS_ORIGIN allowlist', () => {
  it('reflects an origin listed in CORS_ORIGIN', async () => {
    process.env.CORS_ORIGIN = 'https://app.exemplo.com,http://localhost:5173';

    const res = await request
      .get('/version')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });

  it('allows any origin when CORS_ORIGIN is "*"', async () => {
    process.env.CORS_ORIGIN = '*';

    const res = await request
      .get('/version')
      .set('Origin', 'https://qualquer-front.com');

    expect(res.headers['access-control-allow-origin']).toBe(
      'https://qualquer-front.com',
    );
  });

  it('allows any origin even in production (wildcard mode)', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'https://app.exemplo.com';

    const res = await request
      .get('/version')
      .set('Origin', 'https://qualquer-outra.com');

    // O middleware esta configurado em modo curinga ("*"), entao reflete
    // qualquer origem mesmo em producao.
    expect(res.headers['access-control-allow-origin']).toBe(
      'https://qualquer-outra.com',
    );
  });

  it('answers the CORS preflight (OPTIONS) for an allowed origin', async () => {
    process.env.CORS_ORIGIN = 'http://localhost:5173';

    const res = await request
      .options('/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type');

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });
});
