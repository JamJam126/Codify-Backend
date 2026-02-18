import { IsInt, IsString, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateTestCase' })
export class UpdateTestCaseDto {
  @ApiPropertyOptional({
    example: '5\n10\n15',
    description: 'Updated input string for the test case',
  })
  @IsString()
  @IsOptional()
  input?: string;

  @ApiPropertyOptional({
    example: 'Fizz\nBuzz\nFizzBuzz',
    description: 'Updated expected output for the test case',
  })
  @IsString()
  @IsOptional()
  expected_output?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Updated score for the test case',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Updated visibility of the test case',
  })
  @IsBoolean()
  @IsOptional()
  is_hidden?: boolean;
}
