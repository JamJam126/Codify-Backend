import { Injectable, OnModuleInit } from "@nestjs/common";
import { Worker } from 'bullmq';
import Docker from 'dockerode';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CodeRunnerProcessor implements OnModuleInit{
    private worker: Worker;
    private docker: Docker;

    constructor(){
        this.docker = new Docker();
    }

    onModuleInit() {
        this.worker = new Worker(
            "codifyQueue",
            async (job) => this.processJob(job),
            {
                connection: {
                    host: "127.0.0.1" , port: 6379
                },
                concurrency: 10,
            }
        );
    }


    private async processJob(job: any){
        const { language , code } = job.data;
        const jobId    = uuidv4();
        const filename = `temp_${jobId}.${language === "python" ? "py" : "c"}`;
        
        fs.writeFileSync(filename , code);
        
        const container = await this.docker.createContainer({
            Image: language == "python" ? "code-runner-python" : "code-runner-c",
            Cmd:   language == "python" ? [
                "python3" , `/code/${filename}`
            ] : [
                "bash" , "-c" , `gcc /code/${filename} -o /code/out && /code/out`,
            ],
            HostConfig: {
                AutoRemove: false,
                Binds: [`${process.cwd()}:/code:rw`],
                NetworkMode: 'none',
                Memory: 256 * 1024 * 1024,
                CpuShares: 512,
            }
        });

        await container.start();
        const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
        })

        let output = '';
        stream.on('data' , (chunk: any) => {
            return output = output + chunk.toString()
        });

        await new Promise((resolve) => stream.on("end" , resolve));

        setTimeout(async () => {
            await container.remove();
        }, 1000);

        fs.unlinkSync(filename);

        return {
            stdout: output.trim(),
            status: "success",
        }
    }

}