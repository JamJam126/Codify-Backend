import { PrismaService } from "prisma/prisma.service";
import { Tag } from "../domain/tag.entity";
import { TagRepository } from "../domain/tag.repository";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class TagPrismaRepository implements TagRepository{

  constructor(private readonly prisma: PrismaService) {}
  async create(tag: Tag, userId: number): Promise<Tag> {
    const result=await this.prisma.tag.create({
      data:{
        user_id:userId,
        name:tag.name
      }
    })
    return Tag.rehydrate({
      id: result.id,
      name: result.name,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    })
  }

  async isExist(name:string): Promise<boolean> {
    const result=await this.prisma.tag.findFirst({
      where:{
        name:name
      }
    })
    
    if(result){
      return true;
    }

    return false
  }

  async findById(id: number, userId: number): Promise<Tag | null> {
    const result=await this.prisma.tag.findFirst({
      where:{
        user_id:userId,
        id:id,
      }
    })

    if(!result){
      throw new NotFoundException("Tag not found")
    }

    return Tag.rehydrate({
      id: result?.id,
      name: result?.name,
      createdAt: result?.created_at,
      updatedAt: result?.updated_at
    })

  }

  async getAllTag(userId: number): Promise<Tag[]> {
    const result=await this.prisma.tag.findMany({
      where:{
        user_id:userId
      }
    })

    return result.map((result)=>{
      return Tag.rehydrate({
        id: result.id,
        name: result.name,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      })
    })
  }

  async update(id: number, userId: number, tag: Partial<Tag>): Promise<Tag> {
    const existing = await this.prisma.tag.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Tag ${id} not found`);
    }

    if(userId!=existing.user_id){
      throw new ForbiddenException('You not allow to do this')
    }

    const updated = await this.prisma.tag.update({
      where: { id},
      data: {
        name:tag.name
      }
    });

    return Tag.rehydrate({
      id: updated.id,
      name: updated.name,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    });
  }
  async delete(id: number, userId: number): Promise<void> {
    const existing = await this.prisma.tag.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Tag ${id} not found`);
    }

    if(userId!=existing.user_id){
      throw new ForbiddenException('You not allow to do this')
    }

    await this.prisma.tag.delete({ where: { id } });
  }

}