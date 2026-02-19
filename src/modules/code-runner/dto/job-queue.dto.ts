import { ApiProperty } from "@nestjs/swagger";

export class JobQueueDto{
    @ApiProperty({
        description: "Unique identifier of the job assigned when it was added to the queue. IDs are sequential and increase with each new job.",
        example: "5"
    })
    jobId: string;

    @ApiProperty({
        description: "Current status of the job. 'queue' indicates that the job has been submitted and is waiting in the queue to be processed.",
        example: "queue",
    })
    status: "queue";
}