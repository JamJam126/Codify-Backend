import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SkillResultDto {
  @ApiProperty({ example: 'Be able to shift elements, using arr[i-1] and handle the 1st cell' })
  skill: string;

  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ example: 4 })
  weight: number;

  @ApiProperty({ example: 'PASS', enum: ['PASS', 'FAIL'] })
  status: string;

  @ApiPropertyOptional({ example: 10 })
  line_start?: number;

  @ApiPropertyOptional({ example: 12 })
  line_end?: number;

  @ApiPropertyOptional({ example: 'for(i = 1; i < 5; i++) { arr[i-1] = arr[i]; }' })
  student_snippet?: string;

  @ApiPropertyOptional({ example: 'temp = arr[0];\nfor(int i = 0; i < 4; i++) {...}' })
  recommended_fix?: string;

  @ApiProperty({ example: 'Your shift implementation is correct.' })
  feedback: string;

  @ApiProperty({ example: true })
  verified: boolean;
}

export class JsonReportDto {
  @ApiProperty({ example: 'student_01' })
  student_id: string;

  @ApiProperty({ example: 'lab_01' })
  assignment_id: string;

  @ApiProperty({ type: [SkillResultDto] })
  skills: SkillResultDto[];
}

export class EvaluationResultDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'student_01' })
  student_id: string;

  @ApiProperty({ example: 'lab_01' })
  assignment_id: string;

  @ApiProperty({ type: JsonReportDto })
  json_report: JsonReportDto;

  @ApiProperty({ example: '# Evaluation Report — student_01\n...' })
  markdown_report: string;
}

export class UploadResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'lab_01' })
  assignment_id: string;
}

export class StudentUploadResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'student_01' })
  student_id: string;

  @ApiProperty({ example: 'lab_01' })
  assignment_id: string;
}

export class SkillsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'lab_01' })
  assignment_id: string;

  @ApiProperty({ example: 4 })
  skills_count: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Be able to shift elements...' },
        rank: { type: 'number', example: 1 },
        weight: { type: 'number', example: 4 },
      },
    },
  })
  skills: { text: string; rank: number; weight: number }[];
}

export class HealthResponseDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'AutoEval-C API is running.' })
  message: string;
}