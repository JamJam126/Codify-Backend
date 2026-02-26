import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'prisma/prisma.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategies';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
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
  providers: [AuthService, PrismaService, UserService, JwtStrategy],
})
export class AuthModule {}
