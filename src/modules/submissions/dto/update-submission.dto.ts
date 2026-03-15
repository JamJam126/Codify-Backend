export class UpdateSubmissionDto {
  codes: {
    id?: number;
    challengeId: number;
    code: string;
  }[];
}