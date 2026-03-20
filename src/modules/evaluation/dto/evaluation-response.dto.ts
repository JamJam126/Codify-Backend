import { ApiProperty } from '@nestjs/swagger';
import { AutoEvalJsonReport } from '../interfaces/autoeval.interface';

export class EvaluationResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  student_id: string;

  @ApiProperty()
  assignment_id: string;

  @ApiProperty({ type: () => AutoEvalJsonReport })
  json_report: AutoEvalJsonReport;

  @ApiProperty()
  markdown_report: string;
}

export class SkillsListResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  assignment_id: string;

  @ApiProperty()
  skills_count: number;

  @ApiProperty({ type: () => [Object] })
  skills: Array<{ text: string; rank: number; weight: number }>;
}