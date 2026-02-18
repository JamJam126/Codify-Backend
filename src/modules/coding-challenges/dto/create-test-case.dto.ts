import { IsInt, IsString, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateTestCaseDto {
  @IsInt()
  challenge_id: number;

  @IsString()
  input: string;

  @IsString()
  expected_output: string;

  @IsInt()
  @Min(0)
  score: number;

  @IsBoolean()
  @IsOptional()
  is_hidden?: boolean;
}
