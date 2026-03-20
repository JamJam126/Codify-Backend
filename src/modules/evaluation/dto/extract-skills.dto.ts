import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class ExtractSkillsDto {
  @ApiProperty({ example: 'lab_01' })
  @IsString()
  @IsNotEmpty()
  assignment_id: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  force_regenerate?: boolean;
}