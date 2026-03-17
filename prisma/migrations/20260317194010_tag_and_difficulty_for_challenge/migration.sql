/*
  Warnings:

  - Added the required column `user_id` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "CodingChallenge" ADD COLUMN     "difficulty" "ChallengeDifficulty" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
