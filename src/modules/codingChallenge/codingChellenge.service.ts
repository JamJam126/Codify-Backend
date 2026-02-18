import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import { CreateCodingChallengeDto } from "./dto/create_codingChallenge.dto";
import { CodingChallengeRepository } from "./repositories/codingChallenge.repository";
import { CodingChallenge } from "./codingChallenge.entity";
import { CurrentUserDto } from "../auth/dto/current-user.dto";
import { UpdateCodingChallengeDto } from "./dto/update_codingChallenge.dto";

@Injectable()
export class CodingChallengeService{

  constructor(
    @Inject("CodingChallenge_Repository")
    private readonly repo:CodingChallengeRepository
  ){}

  create(
    dto:CreateCodingChallengeDto,
    user:CurrentUserDto
  ){
    let challenge:CodingChallenge;
    try {
      challenge=CodingChallenge.create({
        userId: user.id,
        tagId:1,
        title:dto.title,
        description:dto.description,
        starterCode:dto.starterCode,
        language:dto.language
      })
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return this.repo.create(challenge);
  }

  async getChallengeById(id:number,userId:number){
    const challenge = await this.repo.findById(id);

    if (challenge.userId !== userId)
      throw new ForbiddenException("You cannot access this challenge");

    return challenge;
  }

  async getAllChallenge(userId :number){
    return this.repo.getAllChallenge(userId);
  }

  async updateChallenge(id: number, dto: UpdateCodingChallengeDto, userId: number) {
    const challenge = await this.repo.findById(id);

    if (!challenge) throw new NotFoundException("Challenge not found");

    if (challenge.userId !== userId) throw new ForbiddenException("You cannot update this challenge");

    return this.repo.update(id, dto);
  }

  async deleteChallenge(id: number, userId: number) {
    const challenge = await this.repo.findById(id);

    if (!challenge) throw new NotFoundException("Challenge not found");

    if (challenge.userId !== userId) throw new ForbiddenException("You cannot delete this challenge");

    await this.repo.delete(id);

    return {
      message: "Challenge deleted successfully",
    }
  }
}