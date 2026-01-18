import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queue: Queue;

  async onModuleInit() {
    this.queue = new Queue("codifyQueue" , {
        connection: {
            host: "127.0.0.1",
            port: 6379
        }
    });
  }
  
  
  async addJob(name: string , data: any){
    return await this.queue.add(name , data);
  }

  async getJob(jobId: string){
    return await this.queue.getJob(jobId);
  }

  async onModuleDestroy() {
    await this.queue.close();
  }

}