import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'AssignmentChallenge' })
export class AssignmentChallengeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  originalChallengeId?: number;

  @ApiProperty({ example: 'FizzBuzz Challenge' })
  originalTitle: string;

  @ApiProperty({ example: 'FizzBuzz Challenge' })
  title: string;

  @ApiProperty({ example: 'Write a function that prints numbers 1-100 with FizzBuzz rules' })
  description: string;

  @ApiProperty({ example: 'function fizzBuzz() { /* your code here */ }' })
  startCode: string;

  @ApiProperty({ example: 'typescript' })
  language: string;

  @ApiProperty({ example: 'MEDIUM' })
  difficulty: string;

  @ApiProperty({ example: 'Array' })
  tagName?: string
}