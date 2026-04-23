import { FastifyInstance } from "fastify";
import z from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../server";
import { createTenantDatabase } from "../services/tenant.service";

const registerSchema = z.object({
  accountName: z.string().min(3),
  accountSlug: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(server: FastifyInstance) {
  server.post("/register", async (request, reply) => {
    const { accountName, accountSlug, email, password, name } = registerSchema.parse(request.body);

    const existingAccount = await prisma.account.findUnique({ where: { slug: accountSlug } });
    if (existingAccount) return reply.status(400).send({ error: "Account slug already exists" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return reply.status(400).send({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const dbName = `basileia_tenant_${accountSlug.replace(/-/g, "_")}`;

    const account = await prisma.account.create({
      data: {
        name: accountName,
        slug: accountSlug,
        dbName,
        users: {
          create: {
            email,
            password: passwordHash,
            name,
            role: "admin",
          },
        },
      },
      include: { users: true },
    });

    await createTenantDatabase(dbName);

    const token = server.jwt.sign({ id: account.users[0].id, accountId: account.id, email, role: "admin" });
    const refreshToken = jwt.sign({ id: account.users[0].id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    return reply.send({ token, refreshToken, user: { id: account.users[0].id, email, name, role: "admin" } });
  });

  server.post("/login", async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email }, include: { account: true } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = server.jwt.sign({ id: user.id, accountId: user.accountId, email: user.email, role: user.role });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    return reply.send({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

   server.post("/refresh", async (request, reply) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(request.body);

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { account: true } });
      if (!user) return reply.status(401).send({ error: "Invalid refresh token" });

      const newToken = server.jwt.sign({ id: user.id, accountId: user.accountId, email: user.email, role: user.role });
      return reply.send({ token: newToken });
    } catch {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
  });

  server.post("/forgot-password", async (request, reply) => {
    const { email } = z.object({ email: z.string().email() }).parse(request.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(404).send({ error: "User not found" });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "1h" });
    console.log(`Reset token for ${email}: ${resetToken}`);
    return reply.send({ message: "Password reset link sent" });
  });

  server.post("/reset-password", async (request, reply) => {
    const { token, newPassword } = z.object({ token: z.string(), newPassword: z.string().min(8) }).parse(request.body);
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: decoded.id }, data: { password: passwordHash } });
      return reply.send({ message: "Password updated" });
    } catch {
      return reply.status(400).send({ error: "Invalid or expired token" });
    }
  });
}
