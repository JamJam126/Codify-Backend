import { Injectable } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class CodeRunnerService{

  constructor(private queueService: QueueService){}
  
  async runCode(langauge: string ,code: string){
    const job = await this.queueService.addJob("run-code" , {
        langauge,
        code,
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
}