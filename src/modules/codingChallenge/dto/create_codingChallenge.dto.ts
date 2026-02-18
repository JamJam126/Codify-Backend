import { 
  IsString,
  IsNotEmpty
} from "class-validator";

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

}