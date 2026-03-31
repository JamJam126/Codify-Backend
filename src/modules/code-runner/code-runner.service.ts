import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from 'prisma/prisma.service';
import { TestCase } from '../coding-challenges/domain/test-case.entity';
import { TestCodeResult } from './interfaces/test-code-result.interface';
import { SubmissionStatus } from '../submissions/domain/submissionStatus.enum';

@Injectable()
export class CodeRunnerService{

    constructor(
        private queueService: QueueService,
        private prismaService: PrismaService,
    ) { }
  
  async runCode(langauge: string ,code: string , input?: string){
    const job = await this.queueService.addJob("run-code" , {
        langauge,
        code,
        input: input ?? "",
    }) 
    return {
        jobId: job.id,
        status: "queued"
    }
  }

  async getJobStatus(id: string){
     const job = await this.queueService.getJob(id);
     if(!job){
        throw new Error("Job Not Found");
     }

     const state  = await job.getState();
     const result = job.returnvalue == null ? null : job.returnvalue; 
     if(state == "completed"){
        return {
            jobId: job.id,
            state: state,
            result: result
        }
     }else{
        return {
            jobId: job.id,
            state: state,
            error: job.failedReason,
            stacktrace: job.stacktrace
        }
     }
    }
    
    async runTestCode(challengeId: number, code: string, langauge: string) {
        const testCases = await this.prismaService.testCase.findMany({
            where: {
                challenge_id: challengeId
            }
        })

        if (testCases.length == 0) {
            throw new HttpException(
                "No Test Case Found",
                HttpStatus.NOT_FOUND
            );
        }

        const job = await this.queueService.addJob("test-code", {
            code,
            langauge,
            testCases,
        });
        
        return {
            jobId: job.id,
            status: "queued"
        };
    }

    async runSubmittedCode(submissionId: number) {
			const submissions = await this.prismaService.codeSubmission.findMany({
				where: {
					submission_id: submissionId
				},
				include: {
					assignmentChallenge: {
						include: {
							test_cases: true
						}
					}
				}
			});

			const completedJobs: Promise<void>[] = [];
			let totalTests = 0;
			let passedTests = 0;

			for (const submission of submissions) {
				const testCases = submission.assignmentChallenge.test_cases.map(tc => ({
					id: tc.id,
					input: tc.input,
					expected_output: tc.expected_output,
				}));

				totalTests += testCases.length;
				const code = submission.code;
				const langauge = 'c';

				const job = await this.queueService.addJob("test-code", {
					code,
					langauge,
					testCases,
				});

      const jobCompletion = new Promise<void>((resolve, reject) => {
        const queueEvents = this.queueService.getQueueEvent();

        const completedHandler = async (event: any) => {
          if (event.jobId === job.id) {
            const updatedJob = await this.queueService.getJob(job.id!);
            const results: TestCodeResult[] = updatedJob?.returnvalue?.results ?? [];

            console.log('Results for Job', job.id, results);

            for (const result of results) {
              console.log('TestCase ID:', result.testCasesId);
              console.log('Expected Output:', result.expectedOutput);
              console.log('Actual Output:', result.actualOutput);

              if (result.passed) passedTests += 1;
            }

            // Clean up listener
            queueEvents.removeListener('completed', completedHandler);
            queueEvents.removeListener('failed', failedHandler);

            resolve();
          }
        };

        const failedHandler = async (event: any) => {
          if (event.jobId === job.id) {
            console.error(`Job ${job.id} failed:`, event.failedReason);
            queueEvents.removeListener('completed', completedHandler);
            queueEvents.removeListener('failed', failedHandler);
            resolve(); // Resolve anyway to continue processing other jobs
          }
        };

        queueEvents.on('completed', completedHandler);
        queueEvents.on('failed', failedHandler);
      });

      completedJobs.push(jobCompletion);
    }

    // Wait for all jobs to complete
    await Promise.all(completedJobs);

    const totalScore = totalTests === 0 ? 0 : Math.round((passedTests / totalTests) * 100);
			await this.prismaService.submission.update({
				where: {
					id: submissionId!
				},
				data: {
					total_score: totalScore,
					status: SubmissionStatus.GRADED
				}
			});
			
    return { totalScore };
    }
}