import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import pinoHttp from 'pino-http';
import { logger } from '../logger';

function getHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    const requestId = getHeaderValue(req.headers['x-request-id']) ?? randomUUID();
    res.setHeader('x-request-id', requestId);
    return requestId;
  },
  customProps: (req) => ({
    requestId: (req as IncomingMessage & { id?: string }).id,
  }),
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },
});
