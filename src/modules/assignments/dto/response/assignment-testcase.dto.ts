import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'AssignmentTestCase' })
export class AssignmentTestCaseDto {
  @ApiProperty({ example: 1 })
  id: number;

  // @ApiProperty({ example: '2025-02-01T10:00:00.000Z' })
  // createdAt: Date;

  // @ApiProperty({ example: '2025-02-01T12:00:00.000Z' })
  // updatedAt: Date;

  @ApiProperty({ example: '1 2 3' })
  input: string;

  @ApiProperty({ example: '6' })
  expectedOutput: string;

  @ApiProperty({ example: 10 })
  score: number;

  @ApiProperty({ example: false })
  isHidden: boolean;

  @ApiProperty({ example: 1 })
  assignmentChallengeId: number;

  @ApiProperty({ example: 1 })
  originalChallengeId?: number;
}