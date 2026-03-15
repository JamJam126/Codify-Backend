import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiServiceUnavailableResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { EvaluationService } from './evaluation.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExtractSkillsDto, EvaluateStudentDto } from './dto/setup-evaluation.dto';
import {
  UploadResponseDto,
  StudentUploadResponseDto,
  SkillsResponseDto,
  EvaluationResultDto,
  HealthResponseDto,
} from './dto/evaluation-response.dto';

@ApiTags('AI Evaluation (AutoEval-C)')
@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly service: EvaluationService) {}

  // ═══════════════════════════════════════════════════════════
  //  HEALTH CHECK — No auth required
  // ═══════════════════════════════════════════════════════════

  @Get('health')
  @ApiOperation({
    summary: 'Check AutoEval-C service health',
    description: 'Returns health status of the AI evaluation microservice.',
  })
  @ApiOkResponse({ description: 'AutoEval-C is healthy', type: HealthResponseDto })
  @ApiServiceUnavailableResponse({ description: 'AutoEval-C is unreachable' })
  healthCheck() {
    return this.service.healthCheck();
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 1 — Upload 3 assignment files
  // ═══════════════════════════════════════════════════════════

  @Post('upload')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'instructions', maxCount: 1 },
      { name: 'starter_code', maxCount: 1 },
      { name: 'teacher_code', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Step 1 — Upload 3 assignment files',
    description:
      'Upload instructions.md, starter_code.c, and teacher_correction_code.c. ' +
      'Run ONCE per assignment. Next step: POST /evaluation/extract-skills',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['assignmentId', 'instructions', 'starter_code', 'teacher_code'],
      properties: {
        assignmentId: {
          type: 'string',
          example: 'lab_01',
          description: 'Unique assignment identifier',
        },
        instructions: {
          type: 'string',
          format: 'binary',
          description: 'Assignment instructions (.md)',
        },
        starter_code: {
          type: 'string',
          format: 'binary',
          description: 'Starter code template (.c)',
        },
        teacher_code: {
          type: 'string',
          format: 'binary',
          description: 'Teacher correction code (.c)',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Files uploaded successfully', type: UploadResponseDto })
  @ApiServiceUnavailableResponse({ description: 'AutoEval-C is unreachable' })
  async upload(
    @Body('assignmentId') assignmentId: string,
    @UploadedFiles()
    files: {
      instructions?: { buffer: Buffer; originalname?: string }[];
      starter_code?: { buffer: Buffer; originalname?: string }[];
      teacher_code?: { buffer: Buffer; originalname?: string }[];
    },
  ) {
    if (!assignmentId) {
      throw new BadRequestException('assignmentId is required.');
    }

    const instructions = files.instructions?.[0];
    const starterCode = files.starter_code?.[0];
    const teacherCode = files.teacher_code?.[0];

    if (!instructions || !starterCode || !teacherCode) {
      throw new BadRequestException(
        'All 3 files required: instructions (.md), starter_code (.c), teacher_code (.c)',
      );
    }

    return this.service.uploadAssignment(
      assignmentId,
      instructions,
      starterCode,
      teacherCode,
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 2 — Upload student .c file
  // ═══════════════════════════════════════════════════════════

  @Post('upload-student')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'student_code', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Step 2 — Upload student .c file',
    description:
      'Upload a single student C code submission. ' +
      'Run PER STUDENT. Next step: POST /evaluation/extract-skills',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['assignmentId', 'studentId', 'student_code'],
      properties: {
        assignmentId: {
          type: 'string',
          example: 'lab_01',
          description: 'Must match the assignment from Step 1',
        },
        studentId: {
          type: 'string',
          example: 'student_01',
          description: 'Unique student identifier',
        },
        student_code: {
          type: 'string',
          format: 'binary',
          description: 'Student C code submission (.c)',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Student file uploaded', type: StudentUploadResponseDto })
  @ApiServiceUnavailableResponse({ description: 'AutoEval-C is unreachable' })
  async uploadStudent(
    @Body('assignmentId') assignmentId: string,
    @Body('studentId') studentId: string,
    @UploadedFiles()
    files: {
      student_code?: { buffer: Buffer; originalname?: string }[];
    },
  ) {
    if (!assignmentId) {
      throw new BadRequestException('assignmentId is required.');
    }
    if (!studentId) {
      throw new BadRequestException('studentId is required.');
    }

    const studentCode = files.student_code?.[0];
    if (!studentCode) {
      throw new BadRequestException('student_code file (.c) is required.');
    }

    return this.service.uploadStudent(assignmentId, studentId, studentCode);
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 3 — Extract micro skills
  // ═══════════════════════════════════════════════════════════

  @Post('extract-skills')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Step 3 — Extract micro skills (once per assignment)',
    description:
      'Analyzes assignment files and extracts micro skills. ' +
      'Takes 15-30 seconds (AI processing). ' +
      'Skips if skills already exist. Use forceRegenerate to overwrite. ' +
      'Next step: POST /evaluation/evaluate',
  })
  @ApiBody({ type: ExtractSkillsDto })
  @ApiCreatedResponse({ description: 'Skills extracted', type: SkillsResponseDto })
  @ApiServiceUnavailableResponse({ description: 'AutoEval-C is unreachable' })
  async extractSkills(@Body() dto: ExtractSkillsDto) {
    return this.service.extractSkills(
      dto.assignmentId,
      dto.forceRegenerate ?? false,
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 4 — Evaluate student
  // ═══════════════════════════════════════════════════════════

  @Post('evaluate')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Step 4 — Evaluate student code (per student)',
    description:
      'Evaluates student code against micro skills. ' +
      'Returns PASS/FAIL per skill with feedback. ' +
      'Takes 30-90 seconds (AI processing). ' +
      'Prerequisites: Steps 1-3 completed + student file uploaded.',
  })
  @ApiBody({ type: EvaluateStudentDto })
  @ApiOkResponse({ description: 'Evaluation complete', type: EvaluationResultDto })
  @ApiNotFoundResponse({ description: 'Student file or skills not found' })
  @ApiServiceUnavailableResponse({ description: 'AutoEval-C is unreachable' })
  async evaluate(@Body() dto: EvaluateStudentDto) {
    return this.service.evaluateStudent(dto.assignmentId, dto.studentId);
  }

  // ═══════════════════════════════════════════════════════════
  //  STEP 5 — Get results (instant, no AI calls)
  // ═══════════════════════════════════════════════════════════

  @Get('results/:studentId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Step 5 — Get saved evaluation results',
    description:
      'Returns saved JSON + Markdown feedback. ' +
      'No AI calls — instant response.',
  })
  @ApiParam({ name: 'studentId', example: 'student_01' })
  @ApiOkResponse({ description: 'Results returned', type: EvaluationResultDto })
  @ApiNotFoundResponse({ description: 'No results found — run evaluate first' })
  getResults(@Param('studentId') studentId: string) {
    return this.service.getResults(studentId);
  }

  // ═══════════════════════════════════════════════════════════
  //  VIEW — Stored micro skills (read-only)
  // ═══════════════════════════════════════════════════════════

  @Get('skills/:assignmentId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'View stored micro skills for an assignment',
    description: 'Returns all micro skills. Use to verify extraction completed.',
  })
  @ApiParam({ name: 'assignmentId', example: 'lab_01' })
  @ApiOkResponse({ description: 'Skills returned', type: SkillsResponseDto })
  @ApiNotFoundResponse({ description: 'No skills found — run extract-skills first' })
  getSkills(@Param('assignmentId') assignmentId: string) {
    return this.service.getSkills(assignmentId);
  }

  // ═══════════════════════════════════════════════════════════
  //  DELETE — Cleanup operations
  // ═══════════════════════════════════════════════════════════

  @Delete('results/:studentId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '🗑️ Delete student output files only',
    description: 'Removes JSON + Markdown output. Student .c file kept.',
  })
  @ApiParam({ name: 'studentId', example: 'student_01' })
  @ApiOkResponse({ description: 'Output files deleted' })
  @ApiNotFoundResponse({ description: 'No results found' })
  deleteResults(@Param('studentId') studentId: string) {
    return this.service.deleteResults(studentId);
  }

  @Delete('student/:studentId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '🗑️ Delete student input + all output files',
    description: 'Removes student .c file + all outputs.',
  })
  @ApiParam({ name: 'studentId', example: 'student_01' })
  @ApiOkResponse({ description: 'Student data deleted' })
  @ApiNotFoundResponse({ description: 'No files found' })
  deleteStudent(@Param('studentId') studentId: string) {
    return this.service.deleteStudent(studentId);
  }

  @Delete('skills/:assignmentId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '🗑️ Delete skills + teacher refs from database',
    description: 'Clears ChromaDB. Input files kept.',
  })
  @ApiParam({ name: 'assignmentId', example: 'lab_01' })
  @ApiOkResponse({ description: 'Skills cleared' })
  deleteSkills(@Param('assignmentId') assignmentId: string) {
    return this.service.deleteSkills(assignmentId);
  }

  @Delete('assignment/:assignmentId')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '🗑️ Delete EVERYTHING for an assignment',
    description: 'Removes input files + ChromaDB data. Student files not deleted.',
  })
  @ApiParam({ name: 'assignmentId', example: 'lab_01' })
  @ApiOkResponse({ description: 'Assignment data deleted' })
  deleteAssignment(@Param('assignmentId') assignmentId: string) {
    return this.service.deleteAssignment(assignmentId);
  }
}