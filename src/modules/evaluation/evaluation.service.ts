import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from 'prisma/prisma.service';
import { AutoEvalResponse, AutoEvalSkillsResponse } from './interfaces/autoeval.interface';
import FormData from 'form-data';   // <-- changed to default import

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);
  private readonly autoevalBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
  ) {
    this.autoevalBaseUrl = this.configService.get<string>('AUTOEVAL_BASE_URL') || 'http://codify_evaluation:8000';
  }

  async setupAssignment(
    assignmentId: string,
    instructions: Express.Multer.File,
    starterCode: Express.Multer.File,
    teacherCode: Express.Multer.File,
  ): Promise<{ assignment_id: string }> {
    const formData = new FormData();
    formData.append('assignment_id', assignmentId);
    formData.append('instructions', instructions.buffer, { filename: 'instructions.md' });
    formData.append('starter_code', starterCode.buffer, { filename: 'starter_code.c' });
    formData.append('teacher_code', teacherCode.buffer, { filename: 'teacher_correction_code.c' });

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.autoevalBaseUrl}/upload`, formData, {
          headers: formData.getHeaders(),
        }),
      );
      this.logger.log(`Assignment ${assignmentId} uploaded to AutoEval-C`);
      return { assignment_id: response.data.assignment_id };
    } catch (error) {
      this.logger.error(`Failed to upload assignment: ${error.message}`);
      throw new Error('AutoEval-C upload failed');
    }
  }

  async extractSkills(assignmentId: string, forceRegenerate = false): Promise<AutoEvalSkillsResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.autoevalBaseUrl}/extract-skills`, {
          assignment_id: assignmentId,
          force_regenerate: forceRegenerate,
        }),
      );
      this.logger.log(`Skills extracted for assignment ${assignmentId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Skill extraction failed: ${error.message}`);
      throw new Error('AutoEval-C skill extraction failed');
    }
  }

  async enqueueEvaluation(
    assignmentId: string,
    studentId: string,
    studentCode: Express.Multer.File,
  ): Promise<{ jobId: string; status: string }> {
    const job = await this.queueService.addJob('evaluate', {
      assignmentId,
      studentId,
      studentCode: studentCode.buffer.toString('utf-8'),
    });
    this.logger.log(`Enqueued evaluation job ${job.id} for student ${studentId}`);
    return { jobId: String(job.id), status: 'queued' };   // <-- convert to string
  }

  async performEvaluation(assignmentId: string, studentId: string, studentCode: string): Promise<AutoEvalResponse> {
    const uploadFormData = new FormData();
    uploadFormData.append('assignment_id', assignmentId);
    uploadFormData.append('student_id', studentId);
    uploadFormData.append('student_code', Buffer.from(studentCode), { filename: `${studentId}.c` });

    await firstValueFrom(
      this.httpService.post(`${this.autoevalBaseUrl}/upload-student`, uploadFormData, {
        headers: uploadFormData.getHeaders(),
      }),
    );

    const evalResponse = await firstValueFrom(
      this.httpService.post(`${this.autoevalBaseUrl}/evaluate`, {
        assignment_id: assignmentId,
        student_id: studentId,
      }),
    );

    const evaluation = evalResponse.data as AutoEvalResponse;

    await this.prisma.evaluationResult.create({
      data: {
        studentId,
        assignmentId,
        jsonReport: evaluation.json_report as any,
        markdownReport: evaluation.markdown_report,
        evaluatedAt: new Date(),
      },
    });

    return evaluation;
  }

  async getEvaluationResult(studentId: string, assignmentId?: string): Promise<AutoEvalResponse | null> {
    const where: any = { studentId };
    if (assignmentId) where.assignmentId = assignmentId;

    const result = await this.prisma.evaluationResult.findFirst({
      where,
      orderBy: { evaluatedAt: 'desc' },
    });
    if (!result) return null;

    return {
      status: 'success',
      student_id: result.studentId,
      assignment_id: result.assignmentId,
      json_report: result.jsonReport as any,
      markdown_report: result.markdownReport,
      files_saved: { json: '', markdown: '' },
    };
  }

  async deleteStudentResults(studentId: string, assignmentId?: string): Promise<void> {
    let url = `${this.autoevalBaseUrl}/results/${studentId}`;
    if (assignmentId) url += `?assignment_id=${assignmentId}`;
    await firstValueFrom(this.httpService.delete(url));
    this.logger.log(`Deleted results for student ${studentId}`);
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    await firstValueFrom(this.httpService.delete(`${this.autoevalBaseUrl}/assignment/${assignmentId}`));
    this.logger.log(`Deleted all data for assignment ${assignmentId}`);
  }

  async getSkills(assignmentId: string): Promise<AutoEvalSkillsResponse> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.autoevalBaseUrl}/skills/${assignmentId}`),
    );
    return response.data;
  }
}