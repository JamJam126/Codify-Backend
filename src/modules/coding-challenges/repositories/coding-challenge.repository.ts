import { CodingChallenge } from "../coding-challenge.entity";
import { UpdateCodingChallengeDto } from "../dto/update-coding-challenge.dto";

export interface CodingChallengeRepository{
  create(challenge: CodingChallenge): Promise<CodingChallenge>;
  findById(id: number): Promise<CodingChallenge>;
  getAllChallenge(userId: number): Promise<CodingChallenge[]>;
  update(id: number, dto: UpdateCodingChallengeDto): Promise<CodingChallenge>;
  delete(id: number): Promise<void>;
}