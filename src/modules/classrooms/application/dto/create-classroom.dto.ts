import { IsString, MinLength } from "class-validator";

export class CreateClassroomDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  classCode: string;

  @IsString()
  description?: string;
}