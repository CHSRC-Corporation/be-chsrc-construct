import { Router } from 'express';
import { z } from 'zod';
import {
  comparePassword,
  hashPassword,
  signToken,
} from '../config/auth';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { validateBody } from '../middlewares/validate';

const authRouter = Router();

const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'name must have at least 3 characters').max(120),
    email: z.string().trim().toLowerCase().email('invalid email format').max(120),
    password: z.string().min(8, 'password must have at least 8 characters').max(120),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'passwords do not match',
  });

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('invalid email format'),
  password: z.string().min(1, 'password is required'),
});

function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

authRouter.post(
  '/auth/register',
  validateBody(registerSchema),
  async (req, res) => {
    const { name, email, password } = req.body as z.infer<typeof registerSchema>;

    const usersRepository = AppDataSource.getRepository(User);
    const existingUser = await usersRepository.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'email already exists' });
    }

    const user = usersRepository.create({
      name,
      email,
      password: await hashPassword(password),
    });
    const savedUser = await usersRepository.save(user);

    const token = signToken({ sub: savedUser.id, email: savedUser.email });

    return res.status(201).json({ user: toPublicUser(savedUser), token });
  },
);

authRouter.post('/auth/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const usersRepository = AppDataSource.getRepository(User);
  const user = await usersRepository.findOne({
    where: { email },
    // password is select:false on the entity, so re-select it explicitly.
    select: ['id', 'name', 'email', 'password', 'createdAt'],
  });

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ message: 'invalid email or password' });
  }

  const token = signToken({ sub: user.id, email: user.email });

  return res.status(200).json({ user: toPublicUser(user), token });
});

export { authRouter };
