import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsInt()
  sectionId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @Type(() => Date)
  @IsDate()
  dueAt: Date;

  @IsInt()
  @Min(0)
  position: number;
}
