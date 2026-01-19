import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'prisma/prisma.service';
import bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email already in use');

    const user = await this.userService.createUser(dto);

    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload) };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.hashed_password!,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload) };
  }
}
