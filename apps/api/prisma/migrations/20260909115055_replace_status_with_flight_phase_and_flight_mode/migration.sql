/*
  Warnings:

  - You are about to drop the column `status` on the `Drone` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FlightPhase" AS ENUM ('ON_GROUND', 'TAKEOFF', 'IN_AIR', 'LANDING');

-- CreateEnum
CREATE TYPE "FlightMode" AS ENUM ('AUTO', 'RTL', 'LAND', 'LOITER');

-- AlterTable
ALTER TABLE "Drone" DROP COLUMN "status",
ADD COLUMN     "flightMode" "FlightMode" NOT NULL DEFAULT 'LOITER',
ADD COLUMN     "flightPhase" "FlightPhase" NOT NULL DEFAULT 'ON_GROUND';
