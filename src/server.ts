import "./load-env";
import { app } from "./app";
import {
  AppDataSource,
  destroyDataSource,
  initializeDataSource,
} from "./config/data-source";
import { logger } from "./logger";

const PORT = Number(process.env.PORT ?? 3000);
const SHUTDOWN_TIMEOUT_MS = 10_000;

initializeDataSource()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info({ port: PORT }, `Server running on port ${PORT}`);
    });

    let isShuttingDown = false;

    const shutdown = (signal: NodeJS.Signals) => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;
      logger.info({ signal }, 'shutdown started');

      const timeout = setTimeout(() => {
        logger.error(
          { signal, timeoutMs: SHUTDOWN_TIMEOUT_MS },
          'shutdown timed out',
        );
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);

      server.close(async (serverError) => {
        try {
          if (serverError) {
            logger.error({ err: serverError }, 'http server close failed');
          }

          if (AppDataSource.isInitialized) {
            await destroyDataSource();
          }

          clearTimeout(timeout);
          logger.info({ signal }, 'shutdown completed');
          process.exit(serverError ? 1 : 0);
        } catch (error) {
          clearTimeout(timeout);
          logger.error({ err: error }, 'shutdown failed');
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((error) => {
    logger.fatal({ err: error }, "Database connection error");
    process.exit(1);
  });
