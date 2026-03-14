import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { SubmissionService } from './submission.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('submissions')
@Controller('classrooms/:classroomId/assignments/:assignmentId/submissions')
export class SubmissionController {
  constructor(private readonly service: SubmissionService) {}

  // ================= CREATE DRAFT =================
  @Post()
  @ApiOperation({ summary: 'Create a new submission draft' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiCreatedResponse({
    description: 'Draft created successfully',
    type: SubmissionResponseDto,
  })
  createDraft(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.createDraft(classroomId, assignmentId, user.id);
  }

  // ================= UPDATE DRAFT =================
  @Patch(':submissionId')
  @ApiOperation({ summary: 'Update an existing submission draft' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiParam({ name: 'submissionId', example: 1 })
  @ApiBody({ type: UpdateSubmissionDto })
  @ApiOkResponse({
    description: 'Draft updated successfully',
    type: SubmissionResponseDto,
  })
  updateDraft(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser() user: CurrentUserDto,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.service.updateDraft(
      classroomId,
      assignmentId,
      submissionId,
      user.id,
      dto,
    );
  }

  // ================= TURN IN =================
  @Post(':submissionId/turn-in')
  @ApiOperation({ summary: 'Turn in a submission' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiParam({ name: 'submissionId', example: 1 })
  @ApiOkResponse({
    description: 'Submission turned in successfully',
    type: SubmissionResponseDto,
  })
  turnIn(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.turnIn(classroomId, assignmentId, submissionId, user.id);
  }

  // ================= GET ALL SUBMISSIONS (TEACHER) =================
  @Get()
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiOkResponse({
    description: 'List of submissions',
    type: [SubmissionResponseDto],
  })
  getAssignmentSubmissions(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.getAssignmentSubmissions(classroomId, assignmentId, user.id);
  }

  // ================= GET ONE SUBMISSION =================
  @Get(':submissionId')
  @ApiOperation({ summary: 'Get a specific submission' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiParam({ name: 'submissionId', example: 1 })
  @ApiOkResponse({
    description: 'Submission found',
    type: SubmissionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  getSubmission(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.getSubmission(classroomId, assignmentId, submissionId, user.id);
  }
}