import { Module } from '@nestjs/common';
import { ClassroomsController } from './presentation/classrooms.controller';
import { ClassroomService } from './application/classroom.service';
import { ClassroomRepositoryPrisma } from './infrastructure/classroom.repository.prisma';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ClassroomsController],
  providers: [
    PrismaService,
    ClassroomService, 
    {
      provide: 'ClassroomRepository',
      useClass: ClassroomRepositoryPrisma,
    }
  ],
})
export class ClassroomsModule {}
