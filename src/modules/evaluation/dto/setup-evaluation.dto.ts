import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class ExtractSkillsDto {
  @ApiProperty({
    description: 'Unique assignment identifier',
    example: 'lab_01',
  })
  @IsString()
  assignmentId: string;

  @ApiPropertyOptional({
    description: 'Set true to overwrite existing skills',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  forceRegenerate?: boolean;
}

export class EvaluateStudentDto {
  @ApiProperty({
    description: 'Must match the assignment used in upload',
    example: 'lab_01',
  })
  @IsString()
  assignmentId: string;

  @ApiProperty({
    description: 'Must match the student uploaded via POST /evaluation/upload-student',
    example: 'student_01',
  })
  @IsString()
  studentId: string;
}