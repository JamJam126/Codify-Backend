import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from 'prisma/prisma.service';

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
}