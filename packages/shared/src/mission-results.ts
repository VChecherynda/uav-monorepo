import type { Drone } from "./drone.js";
import type { Mission } from "./mission.js";
import type { MissionRejectionReason } from "./reasons.js";

export type AssignResult =
  | {
      status: "success";
      mission: Mission;
    }
  | { status: "rejected"; reason: MissionRejectionReason };

export type StartMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | {
      status: "rejected";
      reason: MissionRejectionReason;
    };

export type AbortMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | {
      status: "rejected";
      reason: MissionRejectionReason;
    };

export type CompleteMissionServiceResult =
  | {
      status: "success";
      mission: Mission;
      drone: Drone;
    }
  | {
      status: "rejected";
      reason: MissionRejectionReason;
    };
