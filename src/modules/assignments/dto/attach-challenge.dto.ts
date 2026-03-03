import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsInt } from 'class-validator';

export class AttachChallengesDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  challengeIds: number[];
}