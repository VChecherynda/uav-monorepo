/*
  Warnings:

  - Made the column `authorId` on table `Mission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitId` on table `Mission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Mission" ALTER COLUMN "authorId" SET NOT NULL,
ALTER COLUMN "unitId" SET NOT NULL;
