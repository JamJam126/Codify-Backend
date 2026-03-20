import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QueueModule } from '../queue/queue.module';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { EvaluationProcessor } from './evaluation.processor';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [HttpModule, QueueModule],
  controllers: [EvaluationController],
  providers: [EvaluationService, EvaluationProcessor, PrismaService],
  exports: [EvaluationService],
})
export class EvaluationModule {}