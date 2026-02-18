import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CodingChallengeService } from "./codingChellenge.service";
import { CreateCodingChallengeDto } from "./dto/create_codingChallenge.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CurrentUserDto } from "../auth/dto/current-user.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UpdateCodingChallengeDto } from "./dto/update_codingChallenge.dto";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller('codingchallenge')
@ApiTags('codingchallenge')
export class CodigChallengeController{

  constructor(private readonly service:CodingChallengeService){}

  @Post()
  @ApiOperation({ summary: 'Create a new coding challenge' })
  @ApiBody({
    type: CreateCodingChallengeDto,
    examples: {
      example1: {
        summary: 'FizzBuzz challenge example',
        value: {
          title: 'FizzBuzz Challenge',
          description: 'Implement FizzBuzz in JS',
          starterCode: 'function fizzBuzz() {}',
          language: 'javascript'
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Challenge created successfully' })
  CreateChallenge(
    @Body() dto:CreateCodingChallengeDto,
    @CurrentUser() user:CurrentUserDto
  ){
    return this.service.create(dto,user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all challenges for current user' })
  @ApiOkResponse({ description: 'List of challenges returned successfully' })
  getCodingChallenge(
    @CurrentUser() user:CurrentUserDto
  ){
    return this.service.getAllChallenge(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: 'Get a challenge by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Challenge returned successfully' })
  @ApiNotFoundResponse({ description: 'Challenge not found' })
  GetChallengeById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user:CurrentUserDto
  ){
    return this.service.getChallengeById(id,user.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Update a challenge' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({
    type: UpdateCodingChallengeDto,
    examples: {
      example1: {
        summary: 'FizzBuzz challenge example',
        value: {
          title: 'FizzBuzz Challenge',
          description: 'Implement FizzBuzz in JS',
          starterCode: 'function fizzBuzz() {}',
          language: 'javascript'
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Challenge updated successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden to update' })
  @ApiNotFoundResponse({ description: 'Challenge not found' })
  updateChallenge(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user:CurrentUserDto,
    @Body() dto:UpdateCodingChallengeDto,
  ){
    return this.service.updateChallenge(id, dto, user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Delete a challenge' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Challenge deleted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden to delete' })
  @ApiNotFoundResponse({ description: 'Challenge not found' })
  deleteChallenge(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserDto
  ){
    return this.service.deleteChallenge(id, user.id);
  }

}