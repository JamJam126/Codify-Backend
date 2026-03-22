import { ApiProperty } from "@nestjs/swagger";

export class TestCodeResultDto {
    @ApiProperty({ example: 1 })
    testCasesId: number;

    @ApiProperty({ example: true })
    passed: boolean;

    @ApiProperty({
        example: "ACCEPTED",
        description: "Execution result status (ACCEPTED, WRONG_ANSWER, etc.)"
    })
    status: string;

    @ApiProperty({ example: "3" })
    actualOutput: string;

    @ApiProperty({ example: "3" })
    expectedOutput: string;
}