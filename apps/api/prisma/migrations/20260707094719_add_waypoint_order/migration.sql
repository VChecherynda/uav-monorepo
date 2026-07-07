DELETE FROM "Waypoint";

/*
  Warnings:

  - Added the required column `order` to the `Waypoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Waypoint" ADD COLUMN     "order" INTEGER NOT NULL;
