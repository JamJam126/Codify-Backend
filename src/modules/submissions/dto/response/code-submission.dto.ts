import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: 'CodeSubmission' })
export class CodeSubmissionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  challengeId: number;

  @ApiProperty({ example: 'function fizzBuzz() {}' })
  code: string;

  @ApiProperty({ example: 'amazon' })
  feedback?: string;
}