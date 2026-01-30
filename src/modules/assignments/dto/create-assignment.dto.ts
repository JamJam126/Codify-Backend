import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  MinLength,
  IsNumber,
  IsDateString,
  Validate,
} from 'class-validator';
import {
  ApiProperty,
  ApiSchema,
} from '@nestjs/swagger';
import { IsFutureDate } from '../../../common/validator/is-future-date.validator';

@ApiSchema({ name: 'CreateAssignment' })
export class CreateAssignmentDto {
    
  @ApiProperty({
    example: 3,
    description: 'Classroom ID the assignment belongs to',
  })
  @IsNotEmpty()
  @IsInt()
  classroomId: number;

  // @ApiProperty({
  //   example: 3,
  //   description: 'Section ID the assignment belongs to',
  // })
  // @IsNotEmpty()
  // @IsInt()
  // sectionId: number;

  @ApiProperty({
    example: 'Homework 1',
    description: 'Assignment title',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  title: string;

  @ApiProperty({
    example: 'Solve exercises 1–10',
    description: 'Assignment description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '2025-02-01T23:59:00.000Z',
    description: 'Assignment due date (must be in the future)',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString({}, { message: 'dueAt must be a valid ISO date string' })
  @Validate(IsFutureDate, { message: 'Due date must be in the future' })
  dueAt: Date;

  @ApiProperty({
    example: 0,
    description: 'Position/order of the assignment in the section',
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  position: number;
}
