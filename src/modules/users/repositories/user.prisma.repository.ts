import { PrismaService } from "prisma/prisma.service";
import { User } from "../user.entity";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findUser(userId: number): Promise<User | null> {
    const result = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        avatar: true,
      }
    });

    if (!result) {
      return null;
    }

    return User.rehydrate({
      id: result.id,
      name: result.name,
      email: result.email,
      hashed_password: result.hashed_password,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      profile: {
        type: result.avatar?.type ?? 'GENERATED',
        imageKey: result.avatar?.image_key,
        color: result.avatar?.color
      },
    });
  }
  
  async updateAvatar(userId: number, avatarKey: string): Promise<void> {
    await this.prisma.userAvatar.update({
      where: { id: userId },
      data: {
        image_key: avatarKey,
        type: 'IMAGE'
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!result) {
      return null;
    }

    return User.rehydrate({
      id: result.id,
      name: result.name,
      email: result.email,
      hashed_password: result.hashed_password,
    });
  }

  async searchByEmail(email: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive'
        }
      },
      include: { 
        avatar: true,
      }
    });

    return users.map(user => {
      return User.rehydrate({
        id: user.id,
        name: user.name,
        email: user.email,
        profile: {
          type: user.avatar?.type ?? 'GENERATED',
          imageKey: user.avatar?.image_key,
          color: user.avatar?.color
        },
      });
    });
  }
}