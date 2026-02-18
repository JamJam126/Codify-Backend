import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CodingChallengeService } from "./codingChellenge.service";
import { CreateCodingChallengeDto } from "./dto/create_codingChallenge.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CurrentUserDto } from "../auth/dto/current-user.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UpdateCodingChallengeDto } from "./dto/update_codingChallenge.dto";

@UseGuards(JwtAuthGuard)
@Controller('codingchallenge')
export class CodigChallengeController{

  constructor(private readonly service:CodingChallengeService){}

  @Post()
  CreateChallenge(
    @Body() dto:CreateCodingChallengeDto,
    @CurrentUser() user:CurrentUserDto
  ){
    return this.service.create(dto,user);
  }

  @Get()
  getCodingChallenge(
    @CurrentUser() user:CurrentUserDto
  ){
    return this.service.getAllChallenge(user.id);
  }

  @Get(":id")
  GetChallengeById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user:CurrentUserDto
  ){
    return this.service.getChallengeById(id,user.id);
  }

  @Patch(":id")
  updateChallenge(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user:CurrentUserDto,
    @Body() dto:UpdateCodingChallengeDto,
  ){
    return this.service.updateChallenge(id, dto, user.id);
  }

  @Delete(":id")
  deleteChallenge(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserDto
  ){
    return this.service.deleteChallenge(id, user.id);
  }

}