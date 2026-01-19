import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../domain/role.enum';

@ApiSchema({ name: 'UpdateUserRole' })
export class UpdateUserRoleDto {
  @ApiProperty({ enum: Role, example: Role.ADMIN, description: 'New role for the user' })
  @IsEnum(Role)
  role: Role;
}
