import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'Assignment' })
export class AssignmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Homework 1' })
  title: string;

  @ApiProperty({
    example: 'Solve exercises 1–10',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: '2025-02-01T23:59:00.000Z' })
  dueAt: string;

  @ApiProperty({ example: false })
  published: boolean;

  @ApiProperty({ example: 3 })
  sectionId: number;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z' })
  updatedAt: string;
}
