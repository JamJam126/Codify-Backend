import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Queue, QueueEvents } from "bullmq";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
    private queue: Queue;
    private queueEvents: QueueEvents;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const connection = {
            host: this.configService.get("REDIS_HOST") || "127.0.0.1",
            port: this.configService.get("REDIS_PORT") || 6379
        };

        this.queue = new Queue("codifyQueue", { connection });

        this.queueEvents = new QueueEvents("codifyQueue", { connection });

        await this.queueEvents.waitUntilReady();
    }

    async addJob(name: string, data: any) {
        return await this.queue.add(name, data);
    }

    async getJob(jobId: string) {
        return await this.queue.getJob(jobId);
    }

    async onModuleDestroy() {
        await this.queue.close();
        await this.queueEvents.close();
    }

    getQueueEvent() {
        return  this.queueEvents
    }
}
