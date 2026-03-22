/*
  Warnings:

  - You are about to drop the column `position` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `section_id` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_section_id_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_classroom_id_fkey";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "position",
DROP COLUMN "section_id";

-- DropTable
DROP TABLE "Section";

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
