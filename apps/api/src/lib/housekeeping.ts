import { prisma } from "../lib/prisma.js";

const TELEMETRY_RETENTION_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 min

export async function cleanupOldTelemetry() {
  const cutoff = new Date(Date.now() - TELEMETRY_RETENTION_MS);

  const result = await prisma.telemetry.deleteMany({
    where: {
      recordedAt: { lt: cutoff },
    },
  });

  if (result.count > 0) {
    console.log(
      `[housekeeping] Deleted ${result.count} telemetry rows older than ${cutoff.toISOString()}`,
    );
  }
}

export function startHousekeeping() {
  cleanupOldTelemetry().catch((err) => {
    console.error("[housekeeping] Cleanup tick failed:", err);
  });

  return setInterval(() => {
    cleanupOldTelemetry().catch((err) =>
      console.error("[housekeeping] Cleanup tick failed:", err),
    );
  }, CLEANUP_INTERVAL_MS);
}
