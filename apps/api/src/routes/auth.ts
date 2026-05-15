import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import jwt from "jsonwebtoken";

const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/register", async (req, reply) => {
    const result = RegisterSchema.safeParse(req.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: z.flattenError(result.error),
      });
    }

    const { email, password } = result.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return reply.status(409).send({
        error: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    return reply.status(201).send({ user });
  });

  fastify.post("/auth/login", async (req, reply) => {
    const result = LoginSchema.safeParse(req.body);

    if (!result.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: z.flattenError(result.error),
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Avoiding timing attack
    const passwordHash =
      user?.passwordHash ?? "$2b$10$invalidhashfortimingprotection";
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isValid) {
      return reply.status(401).send({
        error: "Invalid credetials",
      });
    }

    const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

    return reply.status(200).send({
      user: { id: user.id, email: user.email },
      token,
    });
  });
}
