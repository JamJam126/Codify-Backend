import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { AttachChallengesDto } from './dto/attach-challenge.dto';
import { UpdateAssignmentChallengeDto } from './dto/update-assignment-challenge.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('assignments')
@Controller('classrooms/:classroomId/assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  // =============== CREATE =================
  @Post()
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiCreatedResponse({
    description: 'Assignment created successfully',
    type: AssignmentResponseDto,
  })
  @ApiParam({ name: 'classroomId', example: 3 })
  create(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: CurrentUserDto
  ) {
    return this.service.create(classroomId, user.id, dto);
  }

  @Post(':id/challenges')
  @ApiOperation({ summary: 'Attach coding challenges to assignment' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: AttachChallengesDto })
  @ApiOkResponse({ description: 'Challenges attached successfully' })
  attachChallenges(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('id', ParseIntPipe) assignmentId: number,
    @Body() dto: AttachChallengesDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.attachChallenges(
      classroomId,
      assignmentId,
      user.id,
      dto.challengeIds,
    );
  }

  @Patch(':id/challenges/:assignmentChallengeId')
  @ApiOperation({ summary: 'Update assignment challenge snapshot' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1, description: 'Assignment ID' })
  @ApiParam({
    name: 'assignmentChallengeId',
    example: 5,
    description: 'Assignment challenge snapshot ID',
  })
  updateAssignmentChallenge(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('id', ParseIntPipe) assignmentId: number,
    @Param('assignmentChallengeId', ParseIntPipe) assignmentChallengeId: number,
    @Body() dto: UpdateAssignmentChallengeDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.updateAssignmentChallenge(
      classroomId,
      assignmentId,
      assignmentChallengeId,
      user.id,
      dto,
    );
  }

  @Delete(':id/challenges/:challengeId')
  @ApiOperation({ summary: 'Remove a coding challenge from an assignment' })
  @ApiParam({ name: 'classroomId', example: 3, description: 'Classroom ID' })
  @ApiParam({ name: 'id', example: 1, description: 'Assignment ID' })
  @ApiParam({ name: 'challengeId', example: 5, description: 'Coding challenge ID' })
  @ApiNoContentResponse({ description: 'Challenge removed successfully' })
  @ApiNotFoundResponse({ description: 'Assignment or challenge not found' })
  @ApiBadRequestResponse({ description: 'Cannot modify a published assignment' })
  @HttpCode(204)
  removeChallenge(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('id', ParseIntPipe) assignmentId: number,
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @CurrentUser() user: CurrentUserDto,
  ) { 
    return this.service.removeChallenge(
      classroomId,
      assignmentId,
      challengeId,
      user.id,
    );
  }

  // =============== FIND ONE =================
  @Get(':id')
  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Assignment found',
    type: AssignmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.findAssignmentDetail(id, classroomId, user.id);
  }

  // =============== FIND BY CLASSROOM =================
  @Get()
  @ApiOperation({ summary: 'Get all assignments by classroom ID' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiOkResponse({
    description: 'List of assignments in the classroom',
    type: [AssignmentResponseDto],
  })
  findByClassroom(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @CurrentUser() user: CurrentUserDto
  ) {
    return this.service.findAllByClassroomId(classroomId, user.id);
  }

  // =============== UPDATE =================
  @Patch(':id')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiOkResponse({
    description: 'Assignment updated successfully',
    type: AssignmentResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.service.update(id, classroomId, user.id, dto);
  }

  // =============== PUBLISH =================
  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish an assignment' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Assignment published successfully',
    type: AssignmentResponseDto,
  })
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.publish(id, classroomId, user.id);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish an assignment' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Assignment unpublished successfully',
    type: AssignmentResponseDto,
  })
  unpublish(
    @Param('id', ParseIntPipe) id: number,
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.unPublish(id, classroomId, user.id);
  }

  // =============== DELETE =================
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'classroomId', example: 3 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNoContentResponse({ description: 'Assignment deleted successfully' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.delete(id, classroomId, user.id);
  }
}
