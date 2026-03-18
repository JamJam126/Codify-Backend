import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Difficulty } from 'src/modules/coding-challenges/presentation/dto/create-coding-challenge.dto';

export class UpdateAssignmentChallengeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  starterCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: Difficulty, example: Difficulty.EASY, description: 'Role of the new member' })
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}