import { z } from 'zod';
import { DroneCommandConflictReasonSchema, DroneSchema } from './drone.js';
import { MissionSchema } from './mission.js';
import { MissionRejectionReasonSchema } from './reasons.js';

export const RejectedResultSchema = z.object({
  status: z.literal('rejected'),
  reason: MissionRejectionReasonSchema,
});

export const AssignResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    drone: DroneSchema,
  }),
  RejectedResultSchema,
]);

export type AssignResult = z.infer<typeof AssignResultSchema>;

export const UnassignResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), drone: DroneSchema }),
  RejectedResultSchema,
]);

export type UnassignResult = z.infer<typeof UnassignResultSchema>;

export const ReplaceWaypointsResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    mission: MissionSchema,
  }),
  RejectedResultSchema,
]);

export type ReplaceWaypointsResult = z.infer<
  typeof ReplaceWaypointsResultSchema
>;

const RejectedDroneSchema = z.object({
  droneId: z.string(),
  reason: DroneCommandConflictReasonSchema,
});

export type RejectedDrone = z.infer<typeof RejectedDroneSchema>;

export const StartMissionServiceResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    mission: MissionSchema,
    rejected: z.array(RejectedDroneSchema),
  }),
  RejectedResultSchema,
]);

export type StartMissionServiceResult = z.infer<
  typeof StartMissionServiceResultSchema
>;

export const AbortMissionServiceResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    mission: MissionSchema,
    rejected: z.array(RejectedDroneSchema),
  }),
  RejectedResultSchema,
]);

export type AbortMissionServiceResult = z.infer<
  typeof AbortMissionServiceResultSchema
>;

export const RestoreMissionServiceResultSchema = z.discriminatedUnion(
  'status',
  [
    z.object({
      status: z.literal('success'),
      mission: MissionSchema,
    }),
    RejectedResultSchema,
  ],
);

export type RestoreMissionServiceResult = z.infer<
  typeof RestoreMissionServiceResultSchema
>;

export const CompleteMissionServiceResultSchema = z.discriminatedUnion(
  'status',
  [
    z.object({
      status: z.literal('success'),
      mission: MissionSchema,
    }),
    RejectedResultSchema,
  ],
);

export type CompleteMissionServiceResult = z.infer<
  typeof CompleteMissionServiceResultSchema
>;

export const TerminateMissionServiceResultSchema = z.discriminatedUnion(
  'status',
  [
    z.object({
      status: z.literal('success'),
      mission: MissionSchema,
    }),
    RejectedResultSchema,
  ],
);

export type TerminateMissionServiceResult = z.infer<
  typeof TerminateMissionServiceResultSchema
>;
