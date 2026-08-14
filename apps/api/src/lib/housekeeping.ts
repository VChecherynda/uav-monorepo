import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const TELEMETRY_RETENTION_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 min

const log = logger.child({ module: "housekeeping" });

export async function cleanupOldTelemetry() {
  const cutoff = new Date(Date.now() - TELEMETRY_RETENTION_MS);

  const result = await prisma.telemetry.deleteMany({
    where: {
      recordedAt: { lt: cutoff },
    },
  });

  if (result.count > 0) {
    log.info({ count: result.count, cutoff }, "Deleted old telemetry rows");
  }
}

export function startHousekeeping() {
  cleanupOldTelemetry().catch((err) => {
    log.error({ err, phase: "startup" }, "Cleanup tick failed");
  });

  return setInterval(() => {
    cleanupOldTelemetry().catch((err) => {
      log.error({ err, phase: "interval" }, "Cleanup tick failed");
    });
  }, CLEANUP_INTERVAL_MS);
}
