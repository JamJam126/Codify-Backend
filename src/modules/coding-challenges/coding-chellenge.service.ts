import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from "@nestjs/common";
import { CreateCodingChallengeDto } from "./dto/create-coding-challenge.dto";
import type { CodingChallengeRepository } from "./repositories/coding-challenge.repository";
import { CodingChallenge } from "./coding-challenge.entity";
import { CurrentUserDto } from "../auth/dto/current-user.dto";
import { UpdateCodingChallengeDto } from "./dto/update-coding-challenge.dto";

@Injectable()
export class CodingChallengeService{

  constructor(
    @Inject("CodingChallengeRepository")
    private readonly repo: CodingChallengeRepository
  ){}

  async create(
    dto: CreateCodingChallengeDto,
    userId: number
  ) {
    const exist = await this.repo.findByTitle(dto.title);
    if (exist) throw new ConflictException('Challenge title already exists');

    let challenge: CodingChallenge;
    try {
      challenge = CodingChallenge.create({
        userId: userId,
        tagId: 1,
        title: dto.title,
        description: dto.description!,
        starterCode: dto.starterCode!,
        language: dto.language
      })
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    return this.repo.create(challenge);
  }

  async getChallengeById(id: number, userId: number) {
    if (id <= 0) throw new BadRequestException('ID must be positive');

    const challenge = await this.repo.findById(id);

    if (challenge.userId !== userId)
      throw new ForbiddenException("You cannot access this challenge");

    return challenge;
  }

  async getAllChallenge(userId :number){
    return this.repo.getAllChallenge(userId);
  }

  async updateChallenge(id: number, dto: UpdateCodingChallengeDto, userId: number) {
    if (Object.keys(dto).length === 0) throw new BadRequestException('Update body cannot be empty');
    
    const challenge = await this.repo.findById(id);

    if (!challenge) throw new NotFoundException("Challenge not found");

    if (challenge.userId !== userId) throw new ForbiddenException("You cannot update this challenge");
    return await this.repo.update(id, dto);
  }

  async deleteChallenge(id: number, userId: number) {
    const challenge = await this.repo.findById(id);

    if (!challenge) throw new NotFoundException("Challenge not found");

    if (challenge.userId !== userId) throw new ForbiddenException("You cannot delete this challenge");

    // await this.repo.delete(id);

    return await this.repo.delete(id);
  }
}