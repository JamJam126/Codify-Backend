export class AutoEvalSkill {
  skill: string;
  rank: number;
  weight: number;
  status: 'PASS' | 'FAIL';
  line_start: number | null;
  line_end: number | null;
  student_snippet: string;
  recommended_fix: string | null;
  feedback: string;
  verified: boolean;
}

export class AutoEvalJsonReport {
  student_id: string;
  assignment_id: string;
  skills: AutoEvalSkill[];
}

export interface AutoEvalResponse {
  status: string;
  student_id: string;
  assignment_id: string;
  json_report: AutoEvalJsonReport;
  markdown_report: string;
  files_saved: {
    json: string;
    markdown: string;
  };
}

export interface AutoEvalSkillsResponse {
  status: string;
  assignment_id: string;
  skills_count: number;
  skills: Array<{ text: string; rank: number; weight: number }>;
  next_step: string;
}