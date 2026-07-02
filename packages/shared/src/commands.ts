import type { Drone } from "./drone.js";
import type { CommandRejectionReason } from "./reasons.js";

export type CommandResult =
  | { status: "success"; drone: Drone }
  | { status: "rejected"; reason: CommandRejectionReason };
