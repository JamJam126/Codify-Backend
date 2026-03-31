import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class FeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  text: string;

  score?: number;

}