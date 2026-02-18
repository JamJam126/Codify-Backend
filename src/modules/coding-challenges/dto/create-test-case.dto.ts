import { IsInt, IsString, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateTestCase' })
export class CreateTestCaseDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the coding challenge this test case belongs to',
  })
  @IsInt()
  challenge_id: number;

  @ApiProperty({
    example: '5\n10\n15',
    description: 'Input string for the test case',
  })
  @IsString()
  input: string;

  @ApiProperty({
    example: 'Fizz\nBuzz\nFizzBuzz',
    description: 'Expected output for the test case',
  })
  @IsString()
  expected_output: string;

  @ApiProperty({
    example: 1,
    description: 'Score for passing this test case (default 1)',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  score: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this test case is hidden from the user',
  })
  @IsBoolean()
  @IsOptional()
  is_hidden?: boolean;
}
