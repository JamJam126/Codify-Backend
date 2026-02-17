/*
  Warnings:

  - You are about to drop the column `assignment_id` on the `CodingChallenge` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[classroom_id,position]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `CodingChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag_id` to the `CodingChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `CodingChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Made the column `hashed_password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CodingChallenge" DROP CONSTRAINT "CodingChallenge_assignment_id_fkey";

-- DropIndex
DROP INDEX "Assignment_classroom_id_position_key";

-- AlterTable
ALTER TABLE "CodingChallenge" DROP COLUMN "assignment_id",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "tag_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "score" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hashed_password" SET NOT NULL;

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentCodingChallenge" (
    "id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "codingChallenge_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentCodingChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_classroom_id_position_key" ON "Section"("classroom_id", "position");

-- AddForeignKey
ALTER TABLE "CodingChallenge" ADD CONSTRAINT "CodingChallenge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingChallenge" ADD CONSTRAINT "CodingChallenge_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentCodingChallenge" ADD CONSTRAINT "AssignmentCodingChallenge_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentCodingChallenge" ADD CONSTRAINT "AssignmentCodingChallenge_codingChallenge_id_fkey" FOREIGN KEY ("codingChallenge_id") REFERENCES "CodingChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
