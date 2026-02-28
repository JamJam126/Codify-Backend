import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import bcrypt from 'bcryptjs';
import type { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,

    @Inject("UserRepository")
    private readonly repo: UserRepository,
  ) { }

  async findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async searchByEmail(email: string) {
    return await this.repo.searchByEmail(email);
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
