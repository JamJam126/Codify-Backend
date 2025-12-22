import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClassroomService } from '../application/classroom.service';
import { CreateClassroomDto } from '../application/dto/create-classroom.dto';
import { Classroom } from '../domain/classroom.entity';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly service: ClassroomService) {}

  @Post()
  create(@Body() dto: CreateClassroomDto): Promise<Classroom> {
    const userId = 1; // HARD-CODED MOCK USER
    return this.service.create(dto, userId);
  }
}
