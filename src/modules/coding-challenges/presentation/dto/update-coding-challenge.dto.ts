import { 
  IsString,
  IsOptional,
  MaxLength
} from "class-validator";
import { Difficulty } from "./create-coding-challenge.dto";

export class UpdateCodingChallengeDto {

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  starterCode?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsOptional()
  difficulty?: Difficulty;

  @IsOptional()
  tagId?:number;
}