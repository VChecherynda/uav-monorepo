import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

export async function reportServerError(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    req.log.error(
      { err: error, paths: error.issues.map((i) => i.path.join(".")) },
      "Row failed schema validation",
    );
  } else {
    req.log.error({ err: error }, "Unhandled server error");
  }

  return reply.status(500).send({
    error: "Internal server error",
  });
}
