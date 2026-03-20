import { ApiProperty } from '@nestjs/swagger';

export class JobQueueDto {
  @ApiProperty({ example: '123' })
  jobId: string;

  @ApiProperty({ example: 'queued' })
  status: string;
}