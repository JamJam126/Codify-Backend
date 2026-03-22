import { Tag } from "./tag.entity";

export interface TagRepository {
  create(tag: Tag,userId:number): Promise<Tag>;
  isExist (name:string) :Promise<boolean>;
  findById(id: number,userId:number): Promise<Tag | null>;
  getAllTag(userId: number): Promise<Tag[]>;
  update(id: number,userId:number, tag: Partial<Tag>): Promise<Tag>;
  delete(id: number,userId:number): Promise<void>;
}
