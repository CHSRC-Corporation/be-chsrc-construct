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
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('POST /users - user registration', () => {
  it('registers a user with valid data', async () => {
    const res = await request
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('John Doe');
    expect(res.body.email).toBe('john@example.com');
    expect(res.body.createdAt).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request
      .post('/users')
      .send({ email: 'john@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('name and email are required');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request.post('/users').send({ name: 'John Doe' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('name and email are required');
  });

  it('returns 400 when body is empty', async () => {
    const res = await request.post('/users').send({});

    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    await request
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com' });

    const res = await request
      .post('/users')
      .send({ name: 'Jane Doe', email: 'john@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('email already exists');
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request
      .post('/users')
      .send({ name: 'John Doe', email: 'isso-nao-e-um-email' });

    expect(res.status).toBe(400);
  });
});
