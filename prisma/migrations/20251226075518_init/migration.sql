-- CreateEnum
CREATE TYPE "ClassroomRole" AS ENUM ('OWNER', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "ClassroomLogoType" AS ENUM ('IMAGE', 'GENERATED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" SERIAL NOT NULL,
    "class_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomUser" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "role" "ClassroomRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomLogo" (
    "id" SERIAL NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "type" "ClassroomLogoType" NOT NULL,
    "image_url" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingChallenge" (
    "id" SERIAL NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "starter_code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodingChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_class_code_key" ON "Classroom"("class_code");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomUser_user_id_classroom_id_key" ON "ClassroomUser"("user_id", "classroom_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomLogo_classroom_id_key" ON "ClassroomLogo"("classroom_id");

-- CreateIndex
-- CREATE UNIQUE INDEX "Section_classroom_id_position_key" ON "Section"("classroom_id", "position");

CREATE UNIQUE INDEX "Assignment_classroom_id_position_key" ON "Assignment"("classroom_id", "position");

-- AddForeignKey
ALTER TABLE "ClassroomUser" ADD CONSTRAINT "ClassroomUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomUser" ADD CONSTRAINT "ClassroomUser_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomLogo" ADD CONSTRAINT "ClassroomLogo_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingChallenge" ADD CONSTRAINT "CodingChallenge_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "CodingChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
