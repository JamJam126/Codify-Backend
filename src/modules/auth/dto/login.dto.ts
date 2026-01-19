import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(8)
  password: string;

  @IsEmail()
  email: string;
}
