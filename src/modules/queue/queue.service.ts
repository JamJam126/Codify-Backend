import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
    private queue: Queue;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        this.queue = new Queue("codifyQueue0", {
            connection: {
                host: this.configService.get("REDIS_HOST") || "127.0.0.1",
                port: this.configService.get("REDIS_PORT") || 6379
            }
        });
    }

    async addJob(name: string, data: any) {
        return await this.queue.add(name, data);
    }

    async getJob(jobId: string) {
        return await this.queue.getJob(jobId);
    }

    async onModuleDestroy() {
        await this.queue.close();
    }
}
