import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.NODE_ENV === 'test' ? ':memory:' : 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [User],
});
