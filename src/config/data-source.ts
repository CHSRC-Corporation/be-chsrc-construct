import 'reflect-metadata';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { User } from '../entities/User';

// SSL is opt-in via DB_SSL=true. Render's *internal* connection string does not
// use SSL, so we leave it off by default; set DB_SSL=true when connecting to a
// managed Postgres over the public internet (e.g. Render's external URL).
function getPostgresSsl(): false | { rejectUnauthorized: boolean } {
  return process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;
}

function buildOptions(): DataSourceOptions {
  // Tests run against an in-memory SQLite database: fast and dependency-free,
  // so CI does not need a Postgres service just to run the suite.
  if (process.env.NODE_ENV === 'test') {
    return {
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [User],
    };
  }

  // Everywhere else (development via docker-compose, production on Render) uses
  // PostgreSQL. `synchronize: true` keeps the MVP schema in sync without
  // migrations; revisit before handling real production data.
  const common = {
    type: 'postgres' as const,
    synchronize: true,
    logging: false,
    entities: [User],
    ssl: getPostgresSsl(),
  };

  // A single DATABASE_URL is the standard on Render (and convenient locally).
  if (process.env.DATABASE_URL) {
    return { ...common, url: process.env.DATABASE_URL };
  }

  // Fall back to discrete variables (handy for docker-compose / local setups).
  return {
    ...common,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'chsrc',
  };
}

export const AppDataSource = new DataSource(buildOptions());

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
