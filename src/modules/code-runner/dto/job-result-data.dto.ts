import { ApiProperty } from "@nestjs/swagger";

export class JobResultDataDto{
    @ApiProperty({
        description: "Raw output from the executed code",
        example: "Student 1: Name=Alice, GPA=3.5\nStudent 2: Name=Bob, GPA=4.2\n.."
    })
    stdout: string;
    @ApiProperty({
        description: "Status of the execution",
        example: "success"
    })
    status: "success";
}