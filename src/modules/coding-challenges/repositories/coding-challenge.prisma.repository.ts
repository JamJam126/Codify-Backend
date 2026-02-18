import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CodingChallenge } from "../coding-challenge.entity";
import { UpdateCodingChallengeDto } from "../dto/update-coding-challenge.dto";
import { CodingChallengeRepository } from "./coding-challenge.repository";

@Injectable()
export class CodingChallengePrismaRepository implements CodingChallengeRepository {
  constructor(private readonly prisma:PrismaService){}

  async create(challenge:CodingChallenge):Promise<CodingChallenge>{
    const result=await this.prisma.codingChallenge.create({
      data:{
        user_id:challenge.userId,
        tag_id:challenge.tagId,
        title:challenge.title,
        description:challenge.description,
        starter_code:challenge.starterCode,
        language:challenge.language
      }
    })
    return CodingChallenge.rehydrate({
      id: result.id,
      userId: result.user_id,
      tagId: result.tag_id,
      title: result.title,
      description: result.description,
      starterCode: result.starter_code,
      language: result.language,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    })
  }

  async findById(id: number): Promise<CodingChallenge> {
    const result = await this.prisma.codingChallenge.findUnique({
      where: { id: id }
    });

    if (!result) {
      throw new NotFoundException(`CodingChallenge with id ${id} not found`);
    }

    return CodingChallenge.rehydrate({
      id: result.id,
      userId: result.user_id,
      tagId: result.tag_id,
      title: result.title,
      description: result.description,
      starterCode: result.starter_code,
      language: result.language,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    });
  }

  async getAllChallenge(userId: number): Promise<CodingChallenge[]> {
    const results = await this.prisma.codingChallenge.findMany({
      where: { user_id: userId }
    });

    return results.map(r =>
      CodingChallenge.rehydrate({
        id: r.id,
        userId: r.user_id,
        tagId: r.tag_id,
        title: r.title,
        description: r.description,
        starterCode: r.starter_code,
        language: r.language,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      })
    );
  }

  async update(id: number, dto: UpdateCodingChallengeDto): Promise<CodingChallenge> {
    const existing = await this.prisma.codingChallenge.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Challenge ${id} not found`);
    }

    const updated = await this.prisma.codingChallenge.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        starter_code: dto.starterCode ?? existing.starter_code,
        language: dto.language ?? existing.language
      }
    });

    return CodingChallenge.rehydrate({
      id: updated.id,
      userId: updated.user_id,
      tagId: updated.tag_id,
      title: updated.title,
      description: updated.description,
      starterCode: updated.starter_code,
      language: updated.language,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    });
  }

  async delete(id: number): Promise<void> {
    const existing = await this.prisma.codingChallenge.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Challenge ${id} not found`);
    }

    await this.prisma.codingChallenge.delete({ where: { id } });
  }
}