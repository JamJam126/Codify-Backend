import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'Classroom' })
export class ClassroomResponseDto {
  // @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Flutter 101' })
  name: string;

  @ApiProperty({ example: 'AJ24-KL3P' })
  classCode: string;

  @ApiProperty({
    example: 'Introductory Flutter class for freshmen',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ example: 'OWNER OR TEACHER OR STUDENT' })
  role?: String;

  @ApiProperty({ example: '10' })
  student?: number;

  constructor({
    id,
    name,
    classCode,
    description,
    createdAt,
    updatedAt,
    role,
    student
  }: {
    id: number;
    name: string;
    classCode: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    role: string;
    student?:number
  }) {
    this.id = id;
    this.name = name;
    this.classCode = classCode;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.role = role;
    this.student= student;
  }

  rename(name:string){
    this.name = name;
  }

  updateDescription(description: string) {
    this.description = description;
  }
}
