import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EvaluateStudentDto {
  @ApiProperty({ example: 'lab_01' })
  @IsString()
  @IsNotEmpty()
  assignment_id: string;

  @ApiProperty({ example: 'student_01' })
  @IsString()
  @IsNotEmpty()
  student_id: string;
}