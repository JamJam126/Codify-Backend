import { Controller , Post , Body, HttpException , HttpStatus, Param , Get} from "@nestjs/common";
import { CodeRunnerService } from "./code-runner.service";
import { CodeRunnerDto } from "./dto/run-code.dto";

@Controller("code-runner")
export class CodeRunnerController{

  constructor(private codeRunnerService: CodeRunnerService) {}

  @Post("/run")
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
  async getStatus(@Param("id") id: string){
    try{
        return await this.codeRunnerService.getJobStatus(id);
    }catch(error){
        throw new HttpException("Job Not Found" , HttpStatus.NOT_FOUND);
    }
  }
}