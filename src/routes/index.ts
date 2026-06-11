import { Router } from 'express';
import { systemRouter } from './system';
import { usersRouter } from './users';

const router = Router();

router.use(systemRouter);
router.use(usersRouter);

export { router };
