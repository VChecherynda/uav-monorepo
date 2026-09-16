/*
  Warnings:

  - You are about to drop the column `droneId` on the `Mission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_droneId_fkey";

-- AlterTable
ALTER TABLE "Drone" ADD COLUMN     "missionId" TEXT;

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "droneId";

-- AddForeignKey
ALTER TABLE "Drone" ADD CONSTRAINT "Drone_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
