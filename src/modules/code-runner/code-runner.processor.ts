import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import Docker from "dockerode";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CodeRunnerProcessor implements OnModuleInit {

    private worker: Worker;
    private docker: Docker;

    constructor(private configService: ConfigService) {
        if (configService.get("REDIS_HOST: redis") == null){
            this.docker = new Docker();
        } else {
            this.docker = new Docker({ socketPath: "/var/run/docker.sock" });
        }
    }

    onModuleInit() {
        this.worker = new Worker(
            "codifyQueue0",
            async (job) => this.processJob(job),
            {
                connection: {
                    host: this.configService.get("REDIS_HOST") || "127.0.0.1",
                    port: this.configService.get("REDIS_PORT") || 6379
                },
                concurrency: 10,
            }
        );

        this.worker.on("failed", (job, err) => {
            console.error(`Job ${job?.id} failed:`, err.message);
        });

        this.worker.on("completed", (job) => {
            console.log(`Job ${job?.id} completed`);
        });
    }

    private async processJob(job: any) {
        const { language, code } = job.data;
        const jobId = uuidv4();

        const isDocker = fs.existsSync("/.dockerenv");

        const codeDir = isDocker ? "/code-temp" : process.cwd();
        const binds = isDocker
            ? [`eduai-github-assistant-backend_code-temp:/code-temp:rw`]
            : [`${process.cwd()}:/code-temp:rw`];

        const ext = language === "python" ? "py" : "c";
        const baseFilename = `temp_${jobId}.${ext}`;
        const filename = path.join(codeDir, baseFilename);
        const outBinary = `out_${jobId}`;

        fs.writeFileSync(filename, code);

        const image = language === "python" ? "code-runner-python" : "code-runner-c";
        const cmd = language === "python"
            ? ["python3", `/code-temp/${baseFilename}`]
            : ["bash", "-c", `gcc /code-temp/${baseFilename} -o /code-temp/${outBinary} && /code-temp/${outBinary}`];

        let container: Docker.Container | null = null;
        let timedOut = false;

        try {
            container = await this.docker.createContainer({
                Image: image,
                Cmd: cmd,
                HostConfig: {
                    AutoRemove: false,
                    Binds: binds,
                    Memory: 256 * 1024 * 1024,
                    CpuShares: 512,
                    NetworkMode: "none",
                },
            });

            await container.start();

            const timeout = setTimeout(async () => {
                timedOut = true;
                try { await container?.kill(); } catch { }
            }, 10_000);

            await container.wait();
            clearTimeout(timeout);

            const logBuffer = await container.logs({
                stdout: true,
                stderr: true,
                follow: false,
            }) as unknown as Buffer;

            const output = this.stripDockerLogs(logBuffer);

            if (timedOut) {
                return { stdout: "Time limit exceeded (10s)", status: "timeout" };
            }

            return { stdout: output.trim(), status: "success" };

        } catch (err) {
            console.error(`Job ${jobId} error:`, err.message);
            return { stdout: err.message, status: "error" };

        } finally {
            if (container) {
                try { await container.remove({ force: true }); } catch { }
            }
            try { fs.unlinkSync(filename); } catch { }
            try { fs.unlinkSync(path.join(codeDir, outBinary)); } catch { }
        }
    }

    private stripDockerLogs(buffer: Buffer): string {
        let result = "";
        let offset = 0;
        while (offset < buffer.length) {
            if (offset + 8 > buffer.length) break;
            const size = buffer.readUInt32BE(offset + 4);
            if (size === 0) { offset += 8; continue; }
            if (offset + 8 + size > buffer.length) break;
            result += buffer.slice(offset + 8, offset + 8 + size).toString("utf8");
            offset += 8 + size;
        }
        return result;
    }
}