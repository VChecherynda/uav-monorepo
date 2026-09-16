-- CreateEnum
CREATE TYPE "Disposition" AS ENUM ('ACTIVE', 'EXPENDED');

-- AlterTable
ALTER TABLE "Drone" ADD COLUMN     "disposition" "Disposition" NOT NULL DEFAULT 'ACTIVE';
