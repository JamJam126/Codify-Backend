/*
  Warnings:

  - Added the required column `difficulty` to the `AssignmentChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- DropForeignKey
ALTER TABLE "CodingChallenge" DROP CONSTRAINT "CodingChallenge_tag_id_fkey";

-- AlterTable
ALTER TABLE "AssignmentChallenge" ADD COLUMN     "difficulty" "ChallengeDifficulty" NOT NULL;

-- AlterTable
ALTER TABLE "CodingChallenge" ADD COLUMN     "difficulty" "ChallengeDifficulty" NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "tag_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingChallenge" ADD CONSTRAINT "CodingChallenge_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
