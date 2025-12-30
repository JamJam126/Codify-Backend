import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';


@ApiSchema({ name: 'CreateClassroom' })
export class CreateClassroomDto {
  @ApiProperty({
    example: 'Math 101',
    description: 'Human-readable classroom name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'MATH-ABC123',
    description: 'Unique classroom join code',
  })
  @IsString()
  classCode: string;

  @ApiPropertyOptional({
    example: 'Introductory algebra class for freshmen',
    description: 'Optional classroom description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
