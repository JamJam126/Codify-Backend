import { ApiProperty } from "@nestjs/swagger";

export class TestCodeDto {
    @ApiProperty({
        description: "The unique identifier of the coding challenge to be tested.",
        example: 1
    })
    challengeId: number;

    @ApiProperty({
        description: `Contains the source code submitted by the user. 
The code will be compiled or interpreted based on the selected programming language.`,
        example: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b);
    return 0;
}`
    })
    code: string;

    @ApiProperty({
        description: "Specifies the programming language of the submitted code (e.g., c, cpp, python, javascript).",
        example: "c"
    })
    language: string;
}