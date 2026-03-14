import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  ParseIntPipe
} from '@nestjs/common';

import { SubmissionService } from './submission.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';
import { UpdateSubmissionDto } from './dto/updatesubmission.dto';

@Controller('classrooms/:classroomId/assignments/:assignmentId/submissions')
export class SubmissionController {
  constructor(private readonly service: SubmissionService) {}

  // ================= CREATE DRAFT =================
  @Post()
  createDraft(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.createDraft(classroomId, assignmentId, user.id);
  }

  // ================= UPDATE DRAFT =================
  @Patch(':submissionId')
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
  turnIn(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.turnIn(classroomId, assignmentId, submissionId, user.id);
  }

  // ================= GET MY SUBMISSION =================
  // @Get('me')
  // getMySubmission(
  //   @Param('classroomId', ParseIntPipe) classroomId: number,
  //   @Param('assignmentId', ParseIntPipe) assignmentId: number,
  //   @CurrentUser() user: CurrentUserDto,
  // ) {
  //   return this.service.getMySubmission(classroomId, assignmentId, user.id);
  // }

  // ================= GET ALL SUBMISSIONS (TEACHER) =================
  @Get()
  getAssignmentSubmissions(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.getAssignmentSubmissions(classroomId, assignmentId, user.id);
  }

  // ================= GET ONE SUBMISSION =================
  @Get(':submissionId')
  getSubmission(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return this.service.getSubmission(classroomId, assignmentId, submissionId, user.id);
  }

  // ================= TEACHER EVALUATE =================
  // @Patch(':submissionId/evaluate')
  // evaluate(
  //   @Param('classroomId', ParseIntPipe) classroomId: number,
  //   @Param('assignmentId', ParseIntPipe) assignmentId: number,
  //   @Param('submissionId', ParseIntPipe) submissionId: number,
  //   @Body() dto: EvaluateSubmissionDto,
  // ) {
  //   return this.service.evaluate(
  //     classroomId,
  //     assignmentId,
  //     submissionId,
  //     dto,
  //   );
  // }
}