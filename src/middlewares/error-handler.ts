import type { ErrorRequestHandler, Request, RequestHandler } from 'express';
import type { Logger } from 'pino';

type RequestWithLogger = Request & {
  id?: string;
  log?: Logger;
};

function getRequestId(req: RequestWithLogger): string | undefined {
  const headerValue = req.get('x-request-id');
  return req.id ?? headerValue;
}

export const notFoundHandler: RequestHandler = (req, res) => {
  return res.status(404).json({
    message: 'not found',
    requestId: getRequestId(req as RequestWithLogger),
  });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const request = req as RequestWithLogger;
  const requestId = getRequestId(request);

  request.log?.error({ err: error, requestId }, 'request failed');

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: 'internal server error',
    requestId,
  });
};
