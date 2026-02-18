import { IsInt, IsString, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateTestCaseDto {
  @IsString()
  @IsOptional()
  input?: string;

  @IsString()
  @IsOptional()
  expected_output?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  score?: number;

  @IsBoolean()
  @IsOptional()
  is_hidden?: boolean;
}
