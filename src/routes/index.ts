import { Router } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

router.get("/users", async (_req, res) => {
  const usersRepository = AppDataSource.getRepository(User);
  const users = await usersRepository.find({
    order: { createdAt: "DESC" },
    select: ["id", "name", "email", "createdAt"]
  });

  return res.status(200).json(users);
});

router.post("/users", async (req, res) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, and password are required" });
  }

  const usersRepository = AppDataSource.getRepository(User);
  const existingUser = await usersRepository.findOne({ where: { email } });
2
  if (existingUser) {
    return res.status(409).json({ message: "email already exists" });
  }

  const user = usersRepository.create({ name, email, password});
  const savedUser = await usersRepository.save(user);

  return res.status(201).json({ id: savedUser.id, name: savedUser.name, email: savedUser.email, createdAt: savedUser.createdAt });
});

router.get("/user", async (req, res) => {
  const { email } = req.query as { email?: string };

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  const usersRepository = AppDataSource.getRepository(User);
  const user = await usersRepository.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  return res.status(200).json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });

});
export { router };
