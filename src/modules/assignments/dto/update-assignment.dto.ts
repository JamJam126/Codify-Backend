import { IsString, IsOptional, IsDate } from 'class-validator';
import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';

@ApiSchema({ name: 'UpdateAssignment' })
export class UpdateAssignmentDto {
  @ApiPropertyOptional({
    example: 'Homework 1 (updated)',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-02-05T23:59:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueAt?: Date;
}
