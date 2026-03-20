import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { SubmissionStatus } from '../submissionStatus.enum';

@ApiSchema({ name: 'Submission' })
export class SubmissionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  classroomId: number;

  @ApiProperty({ example: 1 })
  assignmentId: number;

  @ApiProperty({ example: 42 })
  studentId: number;

  @ApiProperty({
    example: 'This is my draft submission content.',
    required: false,
  })
  content?: string;

  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.DRAFT })
  status: SubmissionStatus;

  @ApiProperty({ example: 95, required: false })
  grade?: number;

  @ApiProperty({ example: '2026-03-14T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-14T12:30:00.000Z' })
  updatedAt: string;
}