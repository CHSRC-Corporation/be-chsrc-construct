import { Router } from 'express';
import { authRouter } from './auth';
import { systemRouter } from './system';
import { usersRouter } from './users';

const router = Router();

router.use(systemRouter);
router.use(authRouter);
router.use(usersRouter);

export { router };
