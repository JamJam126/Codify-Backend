import { Inject, Injectable } from '@nestjs/common';
import type { ClassroomRepository } from '../domain/classroom.repository';
import { Classroom } from '../domain/classroom.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';

@Injectable()
export class ClassroomService {
  constructor(
    @Inject('ClassroomRepository')
    private readonly repo: ClassroomRepository,
  ) {}

	async create(dto: CreateClassroomDto): Promise<Classroom> {
    const classroom = new Classroom(
      0,
      dto.classCode,
      dto.name,
      dto.teacherId,
      dto.description,
    );

    return this.repo.save(classroom);
	}
}
