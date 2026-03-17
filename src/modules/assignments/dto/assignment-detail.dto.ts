import { CodingChallenge } from "src/modules/coding-challenges/domain/coding-challenge.entity";

export class AssignmentDetailDto {
  id: number | null;
  classroomId: number;
  title: string;
  description: string;
  dueAt: Date;
  isPublished: boolean;
  codingChallenges: CodingChallenge[];
}