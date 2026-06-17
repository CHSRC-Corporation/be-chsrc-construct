import { Router } from 'express';
import { isEmail } from 'validator';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

const usersRouter = Router();

usersRouter.get('/users', async (_req, res) => {
  const usersRepository = AppDataSource.getRepository(User);
  const users = await usersRepository.find({
    order: { createdAt: 'DESC' },
  });

  return res.status(200).json(users);
});

usersRouter.post('/users', async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: 'invalid email format' });
  }

  const usersRepository = AppDataSource.getRepository(User);
  const existingUser = await usersRepository.findOne({ where: { email } });

  if (existingUser) {
    return res.status(409).json({ message: 'email already exists' });
  }

  const user = usersRepository.create({ name, email });
  const savedUser = await usersRepository.save(user);

  return res.status(201).json(savedUser);
});

export { usersRouter };
