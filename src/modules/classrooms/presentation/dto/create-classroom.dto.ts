import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';


@ApiSchema({ name: 'CreateClassroom' })
export class CreateClassroomDto {
  @ApiProperty({
    example: 'Flutter 101',
    description: 'Human-readable classroom name',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    example: 'Introductory Flutter class for freshmen',
    description: 'Optional classroom description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
