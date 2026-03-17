import { IsString,IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'Create Tag' })
export class TagDto{

  @ApiProperty({
    example: 'Array',
    description: 'Input name for tag',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

}
