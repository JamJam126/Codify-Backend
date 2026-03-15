import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import bcrypt from 'bcryptjs';
import type { UserRepository } from './repositories/user.repository';
import { User } from './user.entity';
import { S3Service } from 'src/storage/s3.service';
import { UserProfileResponse, UserResponse } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly s3Service: S3Service,

    @Inject("UserRepository")
    private readonly repo: UserRepository,
  ) { }

  async findUser(userId: number): Promise<UserResponse> {
    const user = await this.repo.findUser(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  async updateAvatar(
    userId: number,
    file: Express.Multer.File
  ) {
    const key = await this.s3Service.uploadFile(file, "avatars");
    await this.repo.updateAvatar(userId, key);

    const url = await this.s3Service.getFileUrl(key);
    return url;
  }

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
        avatar: {
          create: {
            type: 'GENERATED',
            color: '#0A0A0A'
          }
        }
      },
      include: {
        avatar: true
      }
    });
  }

  async toUserResponse(user: User): Promise<UserResponse> {
    let profile: UserProfileResponse | null = null;

    if (user.profile) {
      if (user.profile.type === "IMAGE" && user.profile.imageKey) {
        const url = await this.s3Service.getFileUrl(user.profile.imageKey);

        profile = {
          type: "IMAGE",
          url
        };
      } else {
        profile = {
          type: "GENERATED",
          color: user.profile.color ?? null
        };
      }
    }

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile
    };
  }
}
