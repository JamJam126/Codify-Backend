import { ApiProperty } from "@nestjs/swagger";

export class CodeRunnerDto {
    @ApiProperty({
        description: "Specifies the programming language in which the submitted code is written. This will determine which compiler or interpreter the code runner uses.",
        example: "c"
    })
    language: string;

    @ApiProperty({
        description: `Contains the actual source code that will be executed by the code runner. 
The code should be valid in the language specified above.`,
        example:
            `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define MAX_STUDENTS 100
#define NAMES_COUNT 5

const char* names[NAMES_COUNT] = {"Alice","Bob","Charlie","Diana","Eve"};

typedef struct {
    int id;
    const char* name;
    float gpa;
} Student;

int main() {
    Student students[MAX_STUDENTS];
    int count = 0;
    srand(time(NULL));

    time_t start_time = time(NULL);
    while(difftime(time(NULL), start_time) < 5.0) {
        if(count >= MAX_STUDENTS) break;
        students[count].id = count + 1;
        students[count].name = names[rand() % NAMES_COUNT];
        students[count].gpa = ((float)(rand() % 41) / 10) + 2.0; // 2.0 - 6.0 GPA
        printf("Student %d: Name=%s, GPA=%.2f\\n", students[count].id, students[count].name, students[count].gpa);
        count++;
        struct timespec ts = {0, 500000000}; // 0.5 second
        nanosleep(&ts, NULL);
    }

    printf("\\nTotal students generated: %d\\n", count);
    return 0;
}`
    })
    code: string;
}
