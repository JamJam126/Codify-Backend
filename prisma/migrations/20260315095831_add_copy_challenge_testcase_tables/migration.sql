/*
  Warnings:

  - You are about to drop the `AssignmentCodingChallenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignmentCodingChallenge" DROP CONSTRAINT "AssignmentCodingChallenge_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "AssignmentCodingChallenge" DROP CONSTRAINT "AssignmentCodingChallenge_codingChallenge_id_fkey";

-- DropTable
DROP TABLE "AssignmentCodingChallenge";

-- CreateTable
CREATE TABLE "AssignmentChallenge" (
    "id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "original_challenge_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starter_code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentTestCase" (
    "id" SERIAL NOT NULL,
    "assignment_challenge_id" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentChallenge_assignment_id_original_challenge_id_key" ON "AssignmentChallenge"("assignment_id", "original_challenge_id");

-- AddForeignKey
ALTER TABLE "AssignmentChallenge" ADD CONSTRAINT "AssignmentChallenge_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentChallenge" ADD CONSTRAINT "AssignmentChallenge_original_challenge_id_fkey" FOREIGN KEY ("original_challenge_id") REFERENCES "CodingChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentTestCase" ADD CONSTRAINT "AssignmentTestCase_assignment_challenge_id_fkey" FOREIGN KEY ("assignment_challenge_id") REFERENCES "AssignmentChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
