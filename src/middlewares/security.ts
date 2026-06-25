import type { CorsOptions } from 'cors';

// CORS_ORIGIN holds the allowed origins as a comma-separated list, e.g.
// CORS_ORIGIN="https://app.exemplo.com,http://localhost:5173".
// Use "*" to allow any origin (handy for demos).
function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // const allowedOrigins = getAllowedOrigins();
    const allowedOrigins = '*';

    // Requests without an Origin header (curl, server-to-server, health checks)
    // are not subject to browser CORS, so let them through.
    if (!origin) {
      callback(null, true);
      return;
    }

    // Wildcard: allow any origin. We reflect the requested origin (instead of
    // a literal "*") so it keeps working alongside the Authorization header.
    if (allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Outside production, allow everything when nothing is configured so local
    // development just works.
    if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    // Not allowed: respond without CORS headers so the browser blocks it,
    // without turning the request into a 500.
    callback(null, false);
  },
};
