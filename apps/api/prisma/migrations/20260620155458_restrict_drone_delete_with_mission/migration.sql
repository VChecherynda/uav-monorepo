-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_droneId_fkey";

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
