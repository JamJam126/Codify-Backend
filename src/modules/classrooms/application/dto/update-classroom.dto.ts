import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateClassroom' })
export class UpdateClassroomDto {
  @ApiPropertyOptional({
    example: 'Math 102',
    description: 'Updated human-readable classroom name',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    example: 'Advanced algebra class for sophomores',
    description: 'Updated optional classroom description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
