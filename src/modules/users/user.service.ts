import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(dto: { email: string; password: string; name: string }) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        hashed_password: hashedPassword,
      },
    });
  }
}
