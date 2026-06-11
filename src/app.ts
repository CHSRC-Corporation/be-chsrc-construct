import cors from 'cors';
import express from "express";
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { httpLogger } from './middlewares/http-logger';
import { corsOptions } from './middlewares/security';
import { router } from "./routes";

const app = express();

app.disable('x-powered-by');
app.use(httpLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
