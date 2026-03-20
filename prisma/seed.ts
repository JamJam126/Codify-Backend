import { ClassroomRole, AvatarType } from "@prisma/client";
import { prisma } from "./prisma.client";
import bcrypt from 'bcryptjs';

async function main() {
  const hashedOwner = await bcrypt.hash("owner123", 10);
  const hashedTeacher = await bcrypt.hash("teacher123", 10);
  const hashedStudent = await bcrypt.hash("student123", 10);

  /*
  USERS – idempotent upsert
  */
  const owner = await prisma.user.upsert({
    where: { email: "alice@school.com" },
    update: {},
    create: {
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

  const teacher = await prisma.user.upsert({
    where: { email: "bob@school.com" },
    update: {},
    create: {
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

  const student = await prisma.user.upsert({
    where: { email: "charlie@school.com" },
    update: {},
    create: {
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
      user_id: owner.id,
    },
  });

  /*
  CLASSROOMS – upsert by class_code
  */
  const cs101 = await prisma.classroom.upsert({
    where: { class_code: "CS101" },
    update: {},
    create: {
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

  const js201 = await prisma.classroom.upsert({
    where: { class_code: "JS201" },
    update: {},
    create: {
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
  CLASSROOM USERS – upsert using the compound unique index
  */
  const classroomUserPairs = [
    { user_id: owner.id, classroom_id: cs101.id, role: ClassroomRole.OWNER },
    { user_id: teacher.id, classroom_id: cs101.id, role: ClassroomRole.TEACHER },
    { user_id: student.id, classroom_id: cs101.id, role: ClassroomRole.STUDENT },
    { user_id: teacher.id, classroom_id: js201.id, role: ClassroomRole.OWNER },
    { user_id: student.id, classroom_id: js201.id, role: ClassroomRole.STUDENT },
  ];

  for (const pair of classroomUserPairs) {
    await prisma.classroomUser.upsert({
      where: {
        user_id_classroom_id: {
          user_id: pair.user_id,
          classroom_id: pair.classroom_id,
        },
      },
      update: { role: pair.role },
      create: pair,
    });
  }

  /*
  CODING CHALLENGE – avoid duplicate by title + user
  */
  let challenge = await prisma.codingChallenge.findFirst({
    where: {
      title: "Return 42",
      user_id: teacher.id,
    },
  });
  if (!challenge) {
    challenge = await prisma.codingChallenge.create({
      data: {
        user_id: teacher.id,
        tag_id: tag.id,
        title: "Return 42",
        language: "javascript",
        description: "Return the number 42",
        starter_code: `function solve() {\n  // return the number 42\n}`,
      },
    });
  }

  // Ensure test cases exist for the challenge (delete old ones to avoid duplicates)
  await prisma.testCase.deleteMany({
    where: { challenge_id: challenge.id },
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
  ASSIGNMENT – find or create
  */
  let assignment = await prisma.assignment.findFirst({
    where: {
      classroom_id: cs101.id,
      title: "First Coding Assignment",
    },
  });
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        classroom_id: cs101.id,
        title: "First Coding Assignment",
        description: "Solve your first coding challenge.",
        due_at: new Date("2030-01-20T23:59:59Z"),
        is_published: true,
      },
    });
  }

  /*
  ASSIGNMENT CHALLENGE – find or create
  */
  let assignmentChallenge = await prisma.assignmentChallenge.findFirst({
    where: {
      assignment_id: assignment.id,
      original_challenge_id: challenge.id,
    },
  });
  if (!assignmentChallenge) {
    assignmentChallenge = await prisma.assignmentChallenge.create({
      data: {
        assignment_id: assignment.id,
        original_challenge_id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        starter_code: challenge.starter_code,
        language: challenge.language,
        difficulty: challenge.difficulty,
      },
    });
  }

  /*
  COPY TEST CASES – delete existing and recreate
  */
  await prisma.assignmentTestCase.deleteMany({
    where: { assignment_challenge_id: assignmentChallenge.id },
  });
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