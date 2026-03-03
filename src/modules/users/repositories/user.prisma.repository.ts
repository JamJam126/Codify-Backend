import { PrismaService } from "prisma/prisma.service";
import { User } from "../user.entity";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        email: email
      }
    });

    if (!result) {
      return null;
    }

    return User.rehydrate({
      id: result.id,
      name: result.name,
      email: result.email,
      hashed_password: result.hashed_password
    });
  }

  async searchByEmail(email: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive'
        }
      }
    });

    return users.map(user => {
      return User.rehydrate({
        id: user.id,
        name: user.name,
        email: user.email
      });
    });
  }
}