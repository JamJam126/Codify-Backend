import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRES_IN')) || 3600,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserService],
})
export class AuthModule {}
