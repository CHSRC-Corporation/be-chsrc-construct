import type { CorsOptions } from 'cors';

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    if (!origin) {
      callback(null, false);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
};
