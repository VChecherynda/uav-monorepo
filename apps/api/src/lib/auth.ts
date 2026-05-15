import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({
      error: "Missing or invalid token",
    });
  }

  const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, secret) as { userId: string };
    (req as FastifyRequest & { userId: string }).userId = payload.userId;
  } catch (e) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}
