import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CodingChallengeService } from "./coding-chellenge.service";
import { CreateCodingChallengeDto } from "./dto/create-coding-challenge.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CurrentUserDto } from "../auth/dto/current-user.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { UpdateCodingChallengeDto } from "./dto/update-coding-challenge.dto";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiBearerAuth } from "@nestjs/swagger";
import { CreateTestCaseDto } from "./dto/create-test-case.dto";
import { UpdateTestCaseDto } from "./dto/update-test-case.dto";
import { TestCaseService } from "./test-case.service";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('codingchallenge')
@ApiTags('codingchallenge')
export class CodigChallengeController{

  constructor(
    private readonly challengeService: CodingChallengeService,
    private readonly testCaseService: TestCaseService,
  ) { }

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
    @Body() dto: CreateCodingChallengeDto,
    @CurrentUser() user: CurrentUserDto
  ){
    return this.challengeService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all challenges for current user' })
  @ApiOkResponse({ description: 'List of challenges returned successfully' })
  getCodingChallenge(
    @CurrentUser() user: CurrentUserDto
  ){
    return this.challengeService.getAllChallenge(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: 'Get a challenge by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Challenge returned successfully' })
  @ApiNotFoundResponse({ description: 'Challenge not found' })
  GetChallengeById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserDto
  ){
    return this.challengeService.getChallengeById(id, user.id);
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
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: UpdateCodingChallengeDto,
  ){
    return this.challengeService.updateChallenge(id, dto, user.id);
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
    return this.challengeService.deleteChallenge(id, user.id);
  }


  @Post(":challengeId/testcase")
  @ApiOperation({ summary: 'Create a new test case for a challenge' })
  @ApiParam({ name: 'challengeId', example: 1 })
  @ApiBody({ type: CreateTestCaseDto })
  @ApiCreatedResponse({ description: 'Test case created successfully' })
  createTestCase(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: CreateTestCaseDto
  ) {
    return this.testCaseService.createTestCase(challengeId, user.id, dto);
  }

  @Get(":challengeId/testcase")
  @ApiOperation({ summary: 'Get all test cases for a challenge' })
  @ApiParam({ name: 'challengeId', example: 1 })
  @ApiOkResponse({ description: 'List of test cases returned successfully' })
  getAllTestCases(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @CurrentUser() user: CurrentUserDto
  ) {
    return this.testCaseService.getAllTestCasesForChallenge(challengeId, user.id);
  }

  @Get("testcase/:id")
  @ApiOperation({ summary: 'Get a test case by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Test case returned successfully' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  getTestCaseById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserDto
  ) {
    return this.testCaseService.getTestCaseById(id, user.id);
  }

  @Patch("testcase/:id")
  @ApiOperation({ summary: 'Update a test case' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateTestCaseDto })
  @ApiOkResponse({ description: 'Test case updated successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden to update' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  updateTestCase(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: UpdateTestCaseDto
  ) {
    return this.testCaseService.updateTestCase(id, dto, user.id);
  }

  @Delete("testcase/:id")
  @ApiOperation({ summary: 'Delete a test case' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Test case deleted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden to delete' })
  @ApiNotFoundResponse({ description: 'Test case not found' })
  deleteTestCase(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserDto
  ) {
    return this.testCaseService.deleteTestCase(id, user.id);
  }
}
