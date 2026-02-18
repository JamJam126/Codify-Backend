import { ApiProperty } from "@nestjs/swagger";

export class JobFailureDto{
    @ApiProperty({
    description: "Unique identifier of the job assigned when it was added to the queue. IDs are sequential and increase with each new job.",
            example: "9"
    })
    jobId: string;

    @ApiProperty({
        description: "Current state of the job",
        example: "failed"
    })
    state: "failed";

    @ApiProperty({
        description: "Reason why the job failed",
    })
    error: string;
    
    @ApiProperty({
        description: "Optional stack trace of the error",
    })
    stacktrace?: string;
}