import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateClassroom' })
export class UpdateClassroomDto {
  @ApiPropertyOptional({
    example: 'Flutter 101',
    description: 'Updated human-readable classroom name',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    example: 'Introductory Flutter class for freshmen',
    description: 'Updated optional classroom description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
