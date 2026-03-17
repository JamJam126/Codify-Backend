import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import Docker from "dockerode";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from "@nestjs/config";
import type { TestCodeResult } from "./interfaces/test-code-result.interface";

@Injectable()
export class CodeRunnerProcessor implements OnModuleInit {

    private worker!: Worker;
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
            "codifyQueue",
            async (job) => {
                if (job.name === "test-code") {
                    return this.processTestJob(job);
                }
                return this.processJob(job);
            },
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

    private async processTestJob(job: any) {
        const { language, code, testCases } = job.data;
        const jobId = uuidv4();

        const isDocker = fs.existsSync('/.dockerenv');
        const codeDir = isDocker ? "/code-temp" : process.cwd();
        const binds = isDocker
            ? ["eduai-github-assistant-backend_code-temp:/code-temp:rw"]
            : [`${process.cwd()}:/code-temp:rw`];

        const ext = language === "python" ? "py" : "c";
        const baseFilename = `temp_${jobId}.${ext}`;
        const filename = path.join(codeDir, baseFilename);
        const outBinary = `out_${jobId}`;

        fs.writeFileSync(filename, code);

        const image = language === "python" ? "code-runner-python" : "code-runner-c";

            let results : TestCodeResult[] = [];

            for (const tc of testCases) {
                const safeInput = tc.input
                    .replace(/"/g, '\\"')
                    .replace(/`/g, "\\`");

                const runCmd = language === "python"
                    ? ["bash", "-c", `printf "${safeInput}" | python3 /code-temp/${baseFilename}`]
                    : ["bash", "-c", `gcc /code-temp/${baseFilename} -o /tmp/${outBinary} -lm && printf "${safeInput}" | /tmp/${outBinary}`];
                
                let container: Docker.Container | null = null;
                let timedOut = false;
                let actual = "";
                let testStatus = "ACCEPTED";

                try {
                    container = await this.docker.createContainer({
                        Image: image,
                        Cmd: runCmd,
                        HostConfig: {
                            AutoRemove: false,
                            Binds: binds,
                            Memory: 512 * 1024 * 1024,
                            CpuShares: 512,
                            NetworkMode: "none"
                        }
                    });

                    await container.start();

                    const timeout = setTimeout(async () => {
                        timedOut = true;
                        try { await container?.kill(); } catch { }
                    }, 5_000);

                    const runResult = await container.wait();

                    clearTimeout(timeout);

                    if (timedOut) {
                        testStatus = "TIME_LIMIT_EXCEEDED";
                    } else if (runResult.StatusCode !== 0) {
                        testStatus = "RUNTIME_ERROR";
                        console.error(`Runtime error for tc ${tc.id}:`, actual);
                        const errBuffer = await container.logs({
                            stdout: true, stderr: true, follow: false
                        }) as unknown as Buffer;
                        actual = this.stripDockerLogs(errBuffer).trim();
                        console.error(`TC ${tc.id} runtime error:`, actual);
                    } else {
                        const logBuffer = await container.logs({
                            stdout: true, stderr: true, follow: false
                        }) as unknown as Buffer;

                        actual = this.stripDockerLogs(logBuffer).trim();
                    }
                } catch (err: any) {
                    testStatus = "RUNTIME_ERROR";
                    actual = err.message;
                } finally {
                    if (container) {
                        try {
                            await container.remove({
                                force: true
                            })
                        }catch{}
                    }
                }

                let passed = false;
                const expected = tc.expected_output.trim();
                if (testStatus === "ACCEPTED") {
                    if (actual === expected) {
                        passed = true;
                    }
                }

                results.push({
                    testCasesId: tc.id,
                    passed,
                    status: testStatus,
                    actualOutput: actual,
                    expectedOutput: tc.expected_output,
                });
            }

            try { fs.unlinkSync(filename); } catch { }
            try { fs.unlinkSync(path.join(codeDir, outBinary)); } catch { }

            return {
                results,
            }
        
    }

    private async processJob(job: any) {
        const { language, code } = job.data;
        const jobId = uuidv4();

        const isDocker = fs.existsSync("/.dockerenv");

        const codeDir = isDocker ? "/code-temp" : process.cwd();
        const binds = isDocker
            ? ["eduai-github-assistant-backend_code-temp:/code-temp:rw"]
            : [`${process.cwd()}:/code-temp:rw`];

        const ext = language === "python" ? "py" : "c";
        const baseFilename = `temp_${jobId}.${ext}`;
        const filename = path.join(codeDir, baseFilename);
        const outBinary = `out_${jobId}`;

        fs.writeFileSync(filename, code);

        const image = language === "python" ? "code-runner-python" : "code-runner-c";
        const safeInput = (job.data.input ?? "")
            .replace(/"/g, '\\"')
            .replace(/`/g, "\\`");

        const cmd = language === "python"
            ? ["bash", "-c", `cp /code-temp/${baseFilename} /tmp/${baseFilename} && printf "${safeInput}" | python3 /tmp/${baseFilename}`]
            : ["bash", "-c", `cp /code-temp/${baseFilename} /tmp/${baseFilename} && gcc /tmp/${baseFilename} -o /tmp/${outBinary} -lm && printf "${safeInput}" | /tmp/${outBinary}`];
        
        let container: Docker.Container | null = null;
        let timedOut = false;

        try {
            container = await this.docker.createContainer({
                Image: image,
                Cmd: cmd,
                HostConfig: {
                    AutoRemove: false,
                    Binds: binds,
                    Memory: 512 * 1024 * 1024,
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

        } catch (err: any) {
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