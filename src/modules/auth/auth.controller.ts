import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signupUser(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  loginUser(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
