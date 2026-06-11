import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';

const databasePath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : process.env.DB_PATH ?? 'database.sqlite';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: databasePath,
  synchronize: true,
  logging: false,
  entities: [User],
  prepareDatabase: (database) => {
    if (databasePath !== ':memory:') {
      database.pragma('journal_mode = WAL');
    }
  },
});

let initializationPromise: Promise<DataSource> | null = null;

export async function initializeDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!initializationPromise) {
    initializationPromise = AppDataSource.initialize().finally(() => {
      initializationPromise = null;
    });
  }

  return initializationPromise;
}

export async function destroyDataSource(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}
