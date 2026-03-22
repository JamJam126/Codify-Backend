import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import type { TagRepository } from "../domain/tag.repository";
import { TagDto } from "../presentation/dto/tag.dto";
import { Tag } from "../domain/tag.entity";


@Injectable()
export class TagService{

  constructor(
    @Inject('TagRepository')
    private readonly repo: TagRepository,

  ) {}

  async create(userId:number,dto:TagDto){

    if(await this.repo.isExist(dto.name)){
      throw new ConflictException("Conflict name");
    }

    let tag: Tag;
    try {
      tag = Tag.create({
        name: dto.name
      })
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    
    return this.repo.create(tag,userId);
  }

  getAll(userId:number){
    return this.repo.getAllTag(userId);

  }

  async getById(userId:number,tagId:number){

    return this.repo.findById(userId,tagId);

  }

  update(userId:number,tagId:number,dto:TagDto){
    return this.repo.update(tagId,userId,dto)
  }

  delete(userId:number,tagId:number){
    return this.repo.delete(tagId,userId)
  }

}