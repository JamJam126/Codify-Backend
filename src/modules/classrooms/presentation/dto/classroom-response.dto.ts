import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'Classroom' })
export class ClassroomResponseDto {
  // @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Math 101' })
  name: string;

  @ApiProperty({ example: 'MATH-ABC123' })
  classCode: string;

  @ApiProperty({
    example: 'Introductory algebra class for freshmen',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: string;
}
