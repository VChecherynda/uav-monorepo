-- AlterTable
ALTER TABLE "Drone" ALTER COLUMN "homeLat" SET DEFAULT -23.7000,
ALTER COLUMN "homeLng" SET DEFAULT 133.8800;

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "droneId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waypoint" (
    "id" TEXT NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "missionId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "Drone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waypoint" ADD CONSTRAINT "Waypoint_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
