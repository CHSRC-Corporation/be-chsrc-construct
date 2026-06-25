import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../app';
import {
  clearTestState,
  setupTestDatabase,
  teardownTestDatabase,
} from './test-utils';

const request = supertest(app);

const validUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'supersecret',
  confirmPassword: 'supersecret',
};

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearTestState();
});

afterAll(async () => {
  await teardownTestDatabase();
});

describe('POST /auth/register - user registration', () => {
  it('registers a user and returns a JWT', async () => {
    const res = await request.post('/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.name).toBe('John Doe');
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.body.user.createdAt).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    // The password (or its hash) must never be exposed by the API.
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 400 when name is missing', async () => {
    const { name, ...rest } = validUser;
    const res = await request.post('/auth/register').send(rest);

    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const { email, ...rest } = validUser;
    const res = await request.post('/auth/register').send(rest);

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request.post('/auth/register').send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 when passwords do not match', async () => {
    const res = await request
      .post('/auth/register')
      .send({ ...validUser, confirmPassword: 'different' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request
      .post('/auth/register')
      .send({ ...validUser, password: 'short', confirmPassword: 'short' });

    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    await request.post('/auth/register').send(validUser);

    const res = await request
      .post('/auth/register')
      .send({ ...validUser, name: 'Jane Doe' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('email already exists');
  });

  it('returns 400 when email format is invalid', async () => {
    const res = await request
      .post('/auth/register')
      .send({ ...validUser, email: 'isso-nao-e-um-email' });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login - authentication', () => {
  it('logs in with valid credentials and returns a JWT', async () => {
    await request.post('/auth/register').send(validUser);

    const res = await request
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('returns 401 with a wrong password', async () => {
    await request.post('/auth/register').send(validUser);

    const res = await request
      .post('/auth/login')
      .send({ email: validUser.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for an unknown email', async () => {
    const res = await request
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'supersecret' });

    expect(res.status).toBe(401);
  });
});

describe('GET /users - protected endpoint', () => {
  it('returns 401 without a token', async () => {
    const res = await request.get('/users');

    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request
      .get('/users')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  it('returns the user list with a valid token', async () => {
    const register = await request.post('/auth/register').send(validUser);
    const { token } = register.body;

    const res = await request
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});
