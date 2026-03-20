// evaluation.processor.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EvaluationService } from './evaluation.service';

@Injectable()
export class EvaluationProcessor implements OnModuleInit {
  private readonly logger = new Logger(EvaluationProcessor.name);
  private worker!: Worker;

  constructor(
    private configService: ConfigService,
    private evaluationService: EvaluationService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'codifyQueue',
      async (job) => {
        if (job.name === 'evaluate') {
          return this.processEvaluation(job);
        }
        // Let other processors handle other job types
        return null;
      },
      {
        connection: {
          host: this.configService.get('REDIS_HOST') || '127.0.0.1',
          port: this.configService.get('REDIS_PORT') || 6379,
        },
        concurrency: 5, // adjust as needed
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Evaluation job ${job?.id} failed: ${err.message}`);
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Evaluation job ${job?.id} completed`);
    });
  }

  private async processEvaluation(job: any) {
    const { assignmentId, studentId, studentCode } = job.data;
    try {
      const result = await this.evaluationService.performEvaluation(
        assignmentId,
        studentId,
        studentCode,
      );
      this.logger.log(`Evaluation successful for student ${studentId}`);
      return result;
    } catch (error) {
      this.logger.error(`Evaluation failed for student ${studentId}: ${error.message}`);
      throw error; // Bull will retry
    }
  }
}