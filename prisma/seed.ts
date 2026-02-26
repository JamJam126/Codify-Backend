import { ClassroomRole, ClassroomLogoType } from "@prisma/client";

import { prisma } from './prisma.client';

async function main() {
  // USERS
  const [owner, teacher, student] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Owner",
        email: "alice@school.com",
        hashed_password: "hashed_owner_pw",
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Teacher",
        email: "bob@school.com",
        hashed_password: "hashed_teacher_pw",
      },
    }),
    prisma.user.create({
      data: {
        name: "Charlie Student",
        email: "charlie@school.com",
        hashed_password: "hashed_student_pw",
      },
    }),
  ]);

  // CLASSROOMS
  const classrooms = await Promise.all([
    prisma.classroom.create({
      data: {
        class_code: "CS101",
        name: "Intro to Programming",
        description: "Programming basics for beginners.",
        logo: {
          create: {
            type: ClassroomLogoType.GENERATED,
            color: "#4F46E5",
          },
        },
      },
    }),
    prisma.classroom.create({
      data: {
        class_code: "JS201",
        name: "JavaScript Fundamentals",
        description: "Core JavaScript concepts and practice.",
        logo: {
          create: {
            type: ClassroomLogoType.GENERATED,
            color: "#10B981",
          },
        },
      },
    }),
    prisma.classroom.create({
      data: {
        class_code: "ALGO301",
        name: "Algorithms & Data Structures",
        description: "Problem solving with algorithms.",
        logo: {
          create: {
            type: ClassroomLogoType.GENERATED,
            color: "#F59E0B",
          },
        },
      },
    }),
  ]);

  // CLASSROOM USERS (roles vary per classroom)
  await prisma.classroomUser.createMany({
    data: [
      // CS101
      { user_id: owner.id, classroom_id: classrooms[0].id, role: ClassroomRole.OWNER },
      { user_id: teacher.id, classroom_id: classrooms[0].id, role: ClassroomRole.TEACHER },
      { user_id: student.id, classroom_id: classrooms[0].id, role: ClassroomRole.STUDENT },

      // JS201
      { user_id: teacher.id, classroom_id: classrooms[1].id, role: ClassroomRole.OWNER },
      { user_id: student.id, classroom_id: classrooms[1].id, role: ClassroomRole.STUDENT },

      // ALGO301
      { user_id: owner.id, classroom_id: classrooms[2].id, role: ClassroomRole.OWNER },
      { user_id: student.id, classroom_id: classrooms[2].id, role: ClassroomRole.STUDENT },
    ],
  });

  // SECTIONS + ASSIGNMENTS + CHALLENGES
  for (const classroom of classrooms) {
    const section = await prisma.section.create({
      data: {
        classroom_id: classroom.id,
        title: "Week 1",
        position: 1,
      },
    });

    await prisma.assignment.create({
      data: {
        classroom_id: classroom.id,
        section_id: section.id,
        title: "Basic Challenge",
        description: "Introductory coding assignment.",
        due_at: new Date('2030-01-20T23:59:59Z'), 
        is_published: false,
        position: 1,         
      } ,
    });

    const tag=await prisma.tag.create({
      data:{
        name: "Term1"
      }
    })

    const challenge = await prisma.codingChallenge.create({
      data: {
        user_id: teacher.id,
        title: "Return a Value",
        language: "javascript",
        description:"hello ",
        tag_id:tag.id,
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
          is_hidden: false,
          score: 10
        },
        {
          challenge_id: challenge.id,
          input: "",
          expected_output: "42",
          is_hidden: true,
          score: 10
        },
      ],
    });
  }

  console.log("🌱 Seeded 3 classrooms with shared users successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
