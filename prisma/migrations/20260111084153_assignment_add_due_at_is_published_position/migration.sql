/*
  Warnings:

  - Added the required column `due_at` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "due_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;
