import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import rateLimit from '@fastify/rate-limit';

const EmailSchema = z.string().trim().toLowerCase().pipe(z.email());

const RegisterSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string(),
});

const MAX_REGISTER_ATTEMPTS = 36;
const MAX_LOGIN_ATTEMPTS = 24;

export async function authRoutes(fastify: FastifyInstance) {
  await fastify.register(rateLimit, { global: false });

  fastify.post(
    '/auth/register',
    {
      config: {
        rateLimit: { max: MAX_REGISTER_ATTEMPTS, timeWindow: '1 hour' },
      },
    },
    async (req, reply) => {
      const result = RegisterSchema.safeParse(req.body);

      if (!result.success) {
        return reply.status(400).send({
          error: 'Validation failed',
          details: z.flattenError(result.error),
        });
      }

      const { email, password } = result.data;

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return reply.status(409).send({
          error: 'Email already registered',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      try {
        const user = await prisma.user.create({
          data: { email, passwordHash },
          select: { id: true, email: true, createdAt: true },
        });

        return reply.status(201).send({ user });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // P2002 -specific prisma error «Unique constraint failed»
          if (error.code === 'P2002') {
            return reply.status(409).send({
              error: 'Email already registered',
            });
          }
        }

        throw error;
      }
    },
  );

  fastify.post(
    '/auth/login',
    {
      config: {
        rateLimit: { max: MAX_LOGIN_ATTEMPTS, timeWindow: '1 hour' },
      },
    },
    async (req, reply) => {
      const result = LoginSchema.safeParse(req.body);

      if (!result.success) {
        return reply.status(400).send({
          error: 'Validation failed',
          details: z.flattenError(result.error),
        });
      }

      const { email, password } = result.data;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Avoiding timing attack
      const passwordHash =
        user?.passwordHash ?? '$2b$10$invalidhashfortimingprotection';
      const isValid = await bcrypt.compare(password, passwordHash);

      if (!user || !isValid) {
        return reply.status(401).send({
          error: 'Invalid credentials',
        });
      }

      const secret =
        process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

      return reply.status(200).send({
        user: { id: user.id, email: user.email },
        token,
      });
    },
  );
}
