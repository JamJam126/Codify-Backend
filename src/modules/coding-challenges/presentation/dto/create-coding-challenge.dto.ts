import { ApiProperty } from "@nestjs/swagger";
import { 
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional
} from "class-validator";

export enum  Difficulty{
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class CreateCodingChallengeDto{

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsString()
  starterCode: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY, description: 'Role of the new member' })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  tagId:number;

}