import { ClassroomRole, AvatarType } from "@prisma/client";
import { prisma } from "./prisma.client";
import bcrypt from 'bcryptjs';

async function main() {
  const hashedOwner = await bcrypt.hash("owner123", 10);
  const hashedTeacher = await bcrypt.hash("teacher123", 10);
  const hashedStudent = await bcrypt.hash("student123", 10);

  /*
  USERS
  */
  const owner = await prisma.user.create({
    data: {
      name: "Alice Owner",
      email: "alice@school.com",
      hashed_password: hashedOwner,
      avatar: {
        create: {
          type: AvatarType.GENERATED,
          color: "#6366F1",
        },
      },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Bob Teacher",
      email: "bob@school.com",
      hashed_password: hashedTeacher,
      avatar: {
        create: {
          type: AvatarType.GENERATED,
          color: "#10B981",
        },
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Charlie Student",
      email: "charlie@school.com",
      hashed_password: hashedStudent,
      avatar: {
        create: {
          type: AvatarType.GENERATED,
          color: "#F59E0B",
        },
      },
    },
  });

  /*
  TAG
  */
  const tag = await prisma.tag.upsert({
    where: { name: "Basics" },
    update: {},
    create: {
      name: "Basics",
      user_id:1
    },
  });

  /*
  CLASSROOMS
  */
  const cs101 = await prisma.classroom.create({
    data: {
      class_code: "CS101",
      name: "Intro to Programming",
      description: "Programming basics for beginners.",
      logo: {
        create: {
          type: AvatarType.GENERATED,
          color: "#4F46E5",
        },
      },
    },
  });

  const js201 = await prisma.classroom.create({
    data: {
      class_code: "JS201",
      name: "JavaScript Fundamentals",
      description: "Core JavaScript concepts.",
      logo: {
        create: {
          type: AvatarType.GENERATED,
          color: "#10B981",
        },
      },
    },
  });

  /*
  CLASSROOM USERS
  */
  await prisma.classroomUser.createMany({
    data: [
      { user_id: owner.id, classroom_id: cs101.id, role: ClassroomRole.OWNER },
      { user_id: teacher.id, classroom_id: cs101.id, role: ClassroomRole.TEACHER },
      { user_id: student.id, classroom_id: cs101.id, role: ClassroomRole.STUDENT },

      { user_id: teacher.id, classroom_id: js201.id, role: ClassroomRole.OWNER },
      { user_id: student.id, classroom_id: js201.id, role: ClassroomRole.STUDENT },
    ],
  });

  /*
  CODING CHALLENGE TEMPLATE
  */
  const challenge = await prisma.codingChallenge.create({
    data: {
      user_id: teacher.id,
      tag_id: tag.id,
      title: "Return 42",
      language: "javascript",
      description: "Return the number 42",
      starter_code: `function solve() {
  // return the number 42
}`,
    },
  });

  await prisma.testCase.createMany({
    data: [
      {
        challenge_id: challenge.id,
        input: "",
        expected_output: "42",
        score: 10,
        is_hidden: false,
      },
      {
        challenge_id: challenge.id,
        input: "",
        expected_output: "42",
        score: 10,
        is_hidden: true,
      },
    ],
  });

  /*
  SECTIONS
  */
  // const week1 = await prisma.section.create({
  //   data: {
  //     classroom_id: cs101.id,
  //     title: "Week 1",
  //     position: 1,
  //   },
  // });

  // const week2 = await prisma.section.create({
  //   data: {
  //     classroom_id: cs101.id,
  //     title: "Week 2",
  //     position: 2,
  //   },
  // });

  /*
  ASSIGNMENT
  */
  const assignment = await prisma.assignment.create({
    data: {
      classroom_id: cs101.id,
      title: "First Coding Assignment",
      description: "Solve your first coding challenge.",
      due_at: new Date("2030-01-20T23:59:59Z"),
      is_published: true,
    },
  });

  /*
  ASSIGNMENT CHALLENGE (copy from template)
  */
  const assignmentChallenge = await prisma.assignmentChallenge.create({
    data: {
      assignment_id: assignment.id,
      original_challenge_id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      starter_code: challenge.starter_code,
      language: challenge.language,
      difficulty: challenge.difficulty
    },
  });

  /*
  COPY TEST CASES
  */
  const originalCases = await prisma.testCase.findMany({
    where: { challenge_id: challenge.id },
  });

  await prisma.assignmentTestCase.createMany({
    data: originalCases.map((c) => ({
      assignment_challenge_id: assignmentChallenge.id,
      input: c.input,
      expected_output: c.expected_output,
      score: c.score,
      is_hidden: c.is_hidden,
    })),
  });

  console.log("🌱 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });