/*
  Warnings:

  - A unique constraint covering the columns `[assignment_id,codingChallenge_id]` on the table `AssignmentCodingChallenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AssignmentCodingChallenge_assignment_id_codingChallenge_id_key" ON "AssignmentCodingChallenge"("assignment_id", "codingChallenge_id");
