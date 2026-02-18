import { Controller , Post , Body, HttpException , HttpStatus, Param , Get, UseGuards} from "@nestjs/common";
import { CodeRunnerService } from "./code-runner.service";
import { CodeRunnerDto } from "./dto/run-code.dto";
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiParam, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { JobSuccessDto } from "./dto/job-success.dto";
import { JobFailureDto } from "./dto/job-failure.dto";
import { JobQueueDto } from "./dto/job-queue.dto";

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('code runner')
@Controller("code-runner")
export class CodeRunnerController{

  constructor(private codeRunnerService: CodeRunnerService) {}

    @Post("/run")
    @ApiOperation({
        summary: "Execute code in the specified programming language",
        description: `Submits source code to be executed in the chosen language.
            The request must include the language (e.g., 'c', 'python') 
            and the code string to run. `
    })
    @ApiBody({
        description: "The code execution request containing the programming language and the source code",
        type: CodeRunnerDto,
        examples: {
            c_example: {
                summary: "C code example",
                value: {
                    language: "c",
                    code: "#include <stdio.h>\nint main() { printf(\"Hello World\\n\"); return 0; }"
                }
            },
        }
    })
    @ApiResponse({
        type: JobQueueDto,
        description: `Indicates that the code has been successfully submitted to the execution queue
                 The response includes the unique jobId assigned to this job and the current state which will be queue until the job starts executing.`,
        status: 201
    })
  async runCode(@Body() body: CodeRunnerDto ){

    if(!body.language || !body.code){
        throw new HttpException("Missing language or Code",  HttpStatus.BAD_REQUEST);
    }

    const result = await this.codeRunnerService.runCode(
        body.language,
        body.code,
    );

    return result; 
    }
    @Get("/status/:id")
    @ApiOperation({
        summary: "Get the status of a job by ID",
        description: "Returns the current state of the job. Possible states are 'queue', 'completed', or 'failed' , 'waiting ... '"
    })
    @ApiParam({
        name: "id",
        description: "Unique identifier of the job to check its status",
        required: true,
        example: "9"
    })
    @ApiExtraModels(JobSuccessDto , JobFailureDto , JobQueueDto)
    @ApiResponse({
        status: 200,
        description: "Returns the job status. Can be a successful result or a failure.",
        schema: {
            oneOf: [
                { $ref: getSchemaPath(JobSuccessDto), },
                { $ref: getSchemaPath(JobFailureDto), },
                { $ref: getSchemaPath(JobQueueDto), },
            ]
        }
    })
  async getStatus(@Param("id") id: string){
    try{
        return await this.codeRunnerService.getJobStatus(id);
    }catch(error){
        throw new HttpException("Job Not Found" , HttpStatus.NOT_FOUND);
    }
  }
}