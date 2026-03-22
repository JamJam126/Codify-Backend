/*
  Warnings:

  - You are about to drop the column `created_at` on the `Submission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,assignment_id]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "created_at";

-- CreateIndex
CREATE UNIQUE INDEX "Submission_user_id_assignment_id_key" ON "Submission"("user_id", "assignment_id");
