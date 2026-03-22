import { ApiProperty } from "@nestjs/swagger";
import { TestCodeResultDto } from "./test-code-results.dto";

export class TestCodeResponseDto {
    @ApiProperty({
        type: [TestCodeResultDto]
    })
    results: TestCodeResultDto[];
}