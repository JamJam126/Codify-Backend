import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  MinLength, 
  IsNumber, 
  IsDateString, 
  Validate 
} from 'class-validator';
import { IsFutureDate } from '../../../common/validator/is-future-date.validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsInt()
  sectionId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString({}, { message: 'dueAt must be a valid ISO date string' })
  @Validate(IsFutureDate, { message: 'Due date must be in the future' })
  dueAt: Date;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  position: number;
}
