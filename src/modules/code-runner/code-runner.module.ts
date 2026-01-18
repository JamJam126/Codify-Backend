import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { CodeRunnerService } from './code-runner.service';
import { CodeRunnerController } from './code-runner.controller';
import { CodeRunnerProcessor } from './code-runner.processor';

@Module({
  imports: [QueueModule], 
  providers: [CodeRunnerService, CodeRunnerProcessor],
  controllers: [CodeRunnerController],
})
export class CodeRunnerModule {}