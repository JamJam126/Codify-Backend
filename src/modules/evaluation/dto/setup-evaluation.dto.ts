import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SetupEvaluationDto {
  @ApiProperty({ example: 'lab_01' })
  @IsString()
  @IsNotEmpty()
  assignment_id: string;
}