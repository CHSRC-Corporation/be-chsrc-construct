import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import {
  authenticate,
  type AuthenticatedRequest,
} from '../middlewares/authenticate';

const usersRouter = Router();

// All user endpoints require a valid JWT (Bearer token in the Authorization
// header). Registration/login live in the public /auth routes.
usersRouter.get('/users', authenticate, async (_req, res) => {
  const usersRepository = AppDataSource.getRepository(User);
  const users = await usersRepository.find({
    order: { createdAt: 'DESC' },
  });

  return res.status(200).json(users);
});

usersRouter.get('/users/me', authenticate, async (req, res) => {
  const { user: tokenUser } = req as AuthenticatedRequest;

  const usersRepository = AppDataSource.getRepository(User);
  const user = await usersRepository.findOne({ where: { id: tokenUser?.sub } });

  if (!user) {
    return res.status(404).json({ message: 'user not found' });
  }

  return res.status(200).json(user);
});

export { usersRouter };
