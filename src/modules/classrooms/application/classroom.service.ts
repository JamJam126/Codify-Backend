import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(): Promise<Classroom[]> {
    return this.repo.findAll()
  }

  async findOne(id: number): Promise<Classroom | null> {
    const classroom = await this.repo.findById(id);
    if (!classroom) throw new NotFoundException('Classroom Not Found');
    
    return classroom;
  } 

  async findByClassCode(classCode: string): Promise<Classroom | null> {
    const classroom = await this.repo.findByClassCode(classCode);
    if (!classCode) throw new NotFoundException('Classroom Not Found');

    return classroom
  }

  async rename(id: number, newName: string) {
    const classroom = await this.repo.findById(id);
    if (!classroom) throw new NotFoundException('Classroom Not Found');

    classroom.rename(newName);
    return this.repo.save(classroom);
  }

  async updateDescription(id: number, newDescription?: string) {
    const classroom = await this.repo.findById(id);
    if (!classroom) throw new NotFoundException('Classroom Not Found');

    classroom.changeDescription(newDescription);
    return this.repo.save(classroom);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repo.deleteById(id);
  }
}
