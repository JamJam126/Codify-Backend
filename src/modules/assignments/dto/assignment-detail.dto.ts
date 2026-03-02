import { CodingChallenge } from "src/modules/coding-challenges/coding-challenge.entity";

export class AssignmentDetailDto {
  id: number | null;
  classroomId: number;
  sectionId: number;
  title: string;
  description: string;
  dueAt: Date;
  position: number;
  isPublished: boolean;
  codingChallenges: CodingChallenge[];
}