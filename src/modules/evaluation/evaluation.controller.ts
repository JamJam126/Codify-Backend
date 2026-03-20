// evaluation.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EvaluationService } from './evaluation.service';
import { SetupEvaluationDto } from './dto/setup-evaluation.dto';
import { ExtractSkillsDto } from './dto/extract-skills.dto';
import { EvaluateStudentDto } from './dto/evaluate-student.dto';
import { JobQueueDto } from './dto/job-queue.dto';
import { EvaluationResponseDto, SkillsListResponseDto } from './dto/evaluation-response.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('evaluation')
@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('setup')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        assignment_id: { type: 'string', example: 'lab_01' },
        instructions: { type: 'string', format: 'binary' },
        starter_code: { type: 'string', format: 'binary' },
        teacher_code: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'instructions', maxCount: 1 },
      { name: 'starter_code', maxCount: 1 },
      { name: 'teacher_code', maxCount: 1 },
    ]),
  )
  async setupAssignment(
    @UploadedFiles() files: {
      instructions?: Express.Multer.File[];
      starter_code?: Express.Multer.File[];
      teacher_code?: Express.Multer.File[];
    },
    @Body() body: SetupEvaluationDto,
  ) {
    if (!files.instructions?.[0] || !files.starter_code?.[0] || !files.teacher_code?.[0]) {
      throw new HttpException('Missing required files', HttpStatus.BAD_REQUEST);
    }
    return this.evaluationService.setupAssignment(
      body.assignment_id,
      files.instructions[0],
      files.starter_code[0],
      files.teacher_code[0],
    );
  }

  @Post('extract-skills')
  @HttpCode(HttpStatus.OK)
  async extractSkills(@Body() dto: ExtractSkillsDto): Promise<SkillsListResponseDto> {
    return this.evaluationService.extractSkills(dto.assignment_id, dto.force_regenerate);
  }

  @Post('submit')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        assignment_id: { type: 'string', example: 'lab_01' },
        student_id: { type: 'string', example: 'student_01' },
        student_code: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('student_code'))
  async submitStudent(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: EvaluateStudentDto,
  ): Promise<JobQueueDto> {
    if (!file) {
      throw new HttpException('Missing student_code file', HttpStatus.BAD_REQUEST);
    }
    return this.evaluationService.enqueueEvaluation(dto.assignment_id, dto.student_id, file);
  }

  @Get('result/:studentId')
  @ApiOperation({ summary: 'Get evaluation result by student ID' })
  @ApiParam({ name: 'studentId', example: 'student_01' })
  @ApiQuery({ name: 'assignmentId', required: false, example: 'lab_01' })
  @ApiResponse({ status: 200, type: EvaluationResponseDto })
  @ApiResponse({ status: 404, description: 'Result not found' })
  async getResult(
    @Param('studentId') studentId: string,
    @Query('assignmentId') assignmentId?: string,
  ): Promise<EvaluationResponseDto> {
    const result = await this.evaluationService.getEvaluationResult(studentId, assignmentId);
    if (!result) {
      throw new HttpException('Result not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Delete('result/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteResult(
    @Param('studentId') studentId: string,
    @Query('assignmentId') assignmentId?: string,
  ) {
    await this.evaluationService.deleteStudentResults(studentId, assignmentId);
  }

  @Delete('assignment/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAssignment(@Param('assignmentId') assignmentId: string) {
    await this.evaluationService.deleteAssignment(assignmentId);
  }

  @Get('skills/:assignmentId')
  async getSkills(@Param('assignmentId') assignmentId: string): Promise<SkillsListResponseDto> {
    return this.evaluationService.getSkills(assignmentId);
  }
}