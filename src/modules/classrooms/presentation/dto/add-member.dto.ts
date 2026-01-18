import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';
import { Role } from '../../domain/role.enum';

@ApiSchema({ name: 'AddMember' })
export class AddMemberDto {
  @ApiProperty({ example: 1, description: 'ID of the user to add' })
  @IsNumber()
  userId: number;

  @ApiProperty({ enum: Role, example: Role.STUDENT, description: 'Role of the new member' })
  @IsEnum(Role)
  role: Role;
}
