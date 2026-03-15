import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('AUTOEVAL_BASE_URL') ||
      'http://codify_evaluation:8000';
    this.logger.log(`AutoEval-C base URL: ${this.baseUrl}`);
  }

  // ── HEALTH CHECK ────────────────────────────────────────────
  async healthCheck(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.json();
    } catch (error) {
      this.logger.error(`AutoEval-C health check failed: ${error.message}`);
      throw new HttpException('AutoEval-C service is unreachable', 503);
    }
  }

  // ── UPLOAD ASSIGNMENT FILES ─────────────────────────────────
  async uploadAssignment(
    assignmentId: string,
    instructions: { buffer: Buffer; originalname?: string },
    starterCode: { buffer: Buffer; originalname?: string },
    teacherCode: { buffer: Buffer; originalname?: string },
  ): Promise<any> {
    this.logger.log(`Uploading assignment files for '${assignmentId}'...`);

    const form = new FormData();
    form.append('assignment_id', assignmentId);
    form.append(
      'instructions',
      new Blob([new Uint8Array(instructions.buffer)]),
      'instructions.md',
    );
    form.append(
      'starter_code',
      new Blob([new Uint8Array(starterCode.buffer)]),
      'starter_code.c',
    );
    form.append(
      'teacher_code',
      new Blob([new Uint8Array(teacherCode.buffer)]),
      'teacher_correction_code.c',
    );

    const result = await this.callAutoEval('POST', '/upload', undefined, form);

    this.logger.log(`Files uploaded for '${assignmentId}'.`);
    return result;
  }

  // ── UPLOAD STUDENT FILE ─────────────────────────────────────
  async uploadStudent(
    assignmentId: string,
    studentId: string,
    studentCode: { buffer: Buffer; originalname?: string },
  ): Promise<any> {
    this.logger.log(`Uploading code for student '${studentId}'...`);

    const form = new FormData();
    form.append('assignment_id', assignmentId);
    form.append('student_id', studentId);
    form.append(
      'student_code',
      new Blob([new Uint8Array(studentCode.buffer)]),
      `${studentId}.c`,
    );

    const result = await this.callAutoEval(
      'POST',
      '/upload-student',
      undefined,
      form,
    );

    this.logger.log(`Student file uploaded for '${studentId}'.`);
    return result;
  }

  // ── EXTRACT SKILLS ──────────────────────────────────────────
  async extractSkills(
    assignmentId: string,
    forceRegenerate: boolean = false,
  ): Promise<any> {
    this.logger.log(`Extracting skills for '${assignmentId}'...`);

    const result = await this.callAutoEval('POST', '/extract-skills', {
      assignment_id: assignmentId,
      force_regenerate: forceRegenerate,
    });

    this.logger.log(
      `Skills extracted for '${assignmentId}': ${result.skills_count} skills.`,
    );
    return result;
  }

  // ── EVALUATE STUDENT ────────────────────────────────────────
  async evaluateStudent(
    assignmentId: string,
    studentId: string,
  ): Promise<any> {
    this.logger.log(
      `Evaluating student '${studentId}' on assignment '${assignmentId}'...`,
    );

    const result = await this.callAutoEval('POST', '/evaluate', {
      assignment_id: assignmentId,
      student_id: studentId,
    });

    this.logger.log(`Evaluation complete for student '${studentId}'.`);
    return result;
  }

  // ── GET RESULTS ─────────────────────────────────────────────
  async getResults(studentId: string): Promise<any> {
    return this.callAutoEval('GET', `/results/${studentId}`);
  }

  // ── GET SKILLS ──────────────────────────────────────────────
  async getSkills(assignmentId: string): Promise<any> {
    return this.callAutoEval('GET', `/skills/${assignmentId}`);
  }

  // ── DELETE RESULTS ──────────────────────────────────────────
  async deleteResults(studentId: string): Promise<any> {
    return this.callAutoEval('DELETE', `/results/${studentId}`);
  }

  // ── DELETE STUDENT ──────────────────────────────────────────
  async deleteStudent(studentId: string): Promise<any> {
    return this.callAutoEval('DELETE', `/student/${studentId}`);
  }

  // ── DELETE SKILLS ───────────────────────────────────────────
  async deleteSkills(assignmentId: string): Promise<any> {
    return this.callAutoEval('DELETE', `/skills/${assignmentId}`);
  }

  // ── DELETE ASSIGNMENT ───────────────────────────────────────
  async deleteAssignment(assignmentId: string): Promise<any> {
    return this.callAutoEval('DELETE', `/assignment/${assignmentId}`);
  }

  // ── PRIVATE: UNIFIED HTTP CALLER ────────────────────────────
  private async callAutoEval(
    method: string,
    path: string,
    jsonBody?: any,
    formData?: FormData,
  ): Promise<any> {
    const url = `${this.baseUrl}${path}`;

    try {
      const options: RequestInit = { method };

      if (jsonBody) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(jsonBody);
      } else if (formData) {
        options.body = formData;
      }

      const res = await fetch(url, options);

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.error(
          `AutoEval-C ${method} ${path} failed (${res.status}): ${errorText}`,
        );
        throw new HttpException(
          `AutoEval-C error: ${errorText}`,
          res.status,
        );
      }

      return res.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(
        `AutoEval-C ${method} ${path} unreachable: ${error.message}`,
      );
      throw new HttpException(
        'AutoEval-C service is unreachable. Is the container running?',
        503,
      );
    }
  }
}