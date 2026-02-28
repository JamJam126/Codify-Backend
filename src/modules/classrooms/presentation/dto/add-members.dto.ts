import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { AddMemberItemDto } from "./add-member-item.dto";

export class AddMembersDto {
  @ApiProperty({ type: [AddMemberItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AddMemberItemDto)
  members: AddMemberItemDto[];
}