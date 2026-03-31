import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { SubmissionStatus } from "@prisma/client";
import { CodeSubmissionDto } from "./code-submission.dto";

@ApiSchema({ name: 'Submission' })
export class SubmissionItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'John Doe' })
  username: string;

  @ApiProperty({ example: 1 })
  assignmentId: number;

  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.SUBMITTED })
  status: string;

  @ApiProperty({ example: 0 })
  totalScore: number;

  @ApiProperty({ example: '2026-03-23T16:05:01.822Z' })
  submittedAt: Date | undefined;


}