import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { app } from '../app';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

const request = supertest(app);

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterEach(async () => {
  await AppDataSource.getRepository(User).clear();
});

describe('POST /users - Registro de usuário', () => {
  it('deve registrar um usuário com dados válidos', async () => {
    const res = await request
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('John Doe');
    expect(res.body.email).toBe('john@example.com');
    expect(res.body.createdAt).toBeDefined();
  });

  it('deve retornar 400 quando o nome estiver ausente', async () => {
    const res = await request
      .post('/users')
      .send({ email: 'john@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('name and email are required');
  });

  it('deve retornar 400 quando o email estiver ausente', async () => {
    const res = await request.post('/users').send({ name: 'John Doe' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('name and email are required');
  });

  it('deve retornar 400 quando o corpo estiver vazio', async () => {
    const res = await request.post('/users').send({});

    expect(res.status).toBe(400);
  });

  it('deve retornar 409 quando o email já estiver cadastrado', async () => {
    await request
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com' });

    const res = await request
      .post('/users')
      .send({ name: 'Jane Doe', email: 'john@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('email already exists');
  });

  it('deve retornar 400 quando o formato do email for inválido', async () => {
    const res = await request
      .post('/users')
      .send({ name: 'John Doe', email: 'isso-nao-e-um-email' });

    expect(res.status).toBe(400);
  });
});
