import { ApiProperty } from "@nestjs/swagger";
import { JobResultDataDto } from "./job-result-data.dto";

export class JobSuccessDto{
    @ApiProperty({
        description: "Unique identifier of the job assigned when it was added to the queue. IDs are sequential and increase with each new job.",
        example: "9"
    })
    jobId: string;

    @ApiProperty({
        description: "Current state of the job",
        example: "completed",
    })
    state: "completed";

    @ApiProperty({
        description: "Result of the job execution",
        type: JobResultDataDto
    })
    result: JobResultDataDto;
}