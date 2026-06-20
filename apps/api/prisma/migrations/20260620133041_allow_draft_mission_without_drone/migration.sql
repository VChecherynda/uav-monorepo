-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_droneId_fkey";

-- AlterTable
ALTER TABLE "Mission" ALTER COLUMN "droneId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
