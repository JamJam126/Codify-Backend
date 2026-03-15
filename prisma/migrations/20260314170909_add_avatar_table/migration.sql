/*
  Warnings:

  - Changed the type of `type` on the `ClassroomLogo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AvatarType" AS ENUM ('IMAGE', 'GENERATED');

-- AlterTable
ALTER TABLE "ClassroomLogo" DROP COLUMN "type",
ADD COLUMN     "type" "AvatarType" NOT NULL;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "ClassroomLogoType";

-- CreateTable
CREATE TABLE "UserAvatar" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "AvatarType" NOT NULL,
    "image_key" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatar_user_id_key" ON "UserAvatar"("user_id");

-- AddForeignKey
ALTER TABLE "UserAvatar" ADD CONSTRAINT "UserAvatar_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
