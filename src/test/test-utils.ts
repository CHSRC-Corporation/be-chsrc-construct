import { AppDataSource, destroyDataSource, initializeDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { resetIncident } from '../state/incident-state';

export async function setupTestDatabase() {
  await initializeDataSource();
}

export async function clearTestState() {
  resetIncident();

  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository(User).clear();
  }
}

export async function teardownTestDatabase() {
  resetIncident();
  await destroyDataSource();
}
