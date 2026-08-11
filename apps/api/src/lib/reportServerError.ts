import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

export async function reportServerError(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const message =
    error instanceof ZodError
      ? "Row failed schema validation"
      : "Unhandled server error";

  req.log.error({ err: error }, message);

  return reply.status(500).send({
    error: "Internal server error",
  });
}
