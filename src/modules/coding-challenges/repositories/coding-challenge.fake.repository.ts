import { ConflictException, NotFoundException } from "@nestjs/common";
import { CodingChallenge } from "../domain/coding-challenge.entity";
import { UpdateCodingChallengeDto } from "../presentation/dto/update-coding-challenge.dto";
import { CodingChallengeRepository } from "../domain/coding-challenge.repository";

export class FakeCodingChallengeRepository implements CodingChallengeRepository {
  getAllChallengeByAssignment(assignmentId: number): Promise<CodingChallenge[]> {
    throw new Error("Method not implemented.");
  }
  private items: CodingChallenge[] = [];
  private idSeq = 1;

  async create(challenge: CodingChallenge): Promise<CodingChallenge> {
    const created = CodingChallenge.rehydrate({
      id: this.idSeq++,
      userId: challenge.userId,
      tagId: 1,
      tag:"Array",
      title: challenge.title,
      description: challenge.description,
      starterCode: challenge.starterCode,
      language: challenge.language,
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty:challenge.difficulty
    });

    this.items.push(created);
    return created;
  }

  async findById(id: number): Promise<CodingChallenge> {
    const found = this.items.find(c => c.id === id);

    if (!found) {
      throw new NotFoundException(`CodingChallenge with id ${id} not found`);
    }

    return CodingChallenge.rehydrate({
      id: found.id!,
      userId: found.userId,
      tagId: 1,
      tag:"Array",
      title: found.title,
      description: found.description,
      starterCode: found.starterCode,
      language: found.language,
      createdAt: found.createdAt!,
      updatedAt: found.updatedAt!,
      difficulty:found.difficulty
    });
  }

  async findByTitle(title: string): Promise<CodingChallenge | undefined> {
    const found = this.items.find(c => c.title === title);
    return found ? CodingChallenge.rehydrate({
      id: found.id!,
      userId: found.userId,
      tagId: 1,
      tag:"Array",
      title: found.title,
      description: found.description,
      starterCode: found.starterCode,
      language: found.language,
      createdAt: found.createdAt!,
      updatedAt: found.updatedAt!,
      difficulty:found.difficulty
    }) : undefined;
  }

  async getAllChallenge(userId: number): Promise<CodingChallenge[]> {
    return this.items
      .filter(c => c.userId === userId)
      .map(c =>
        CodingChallenge.rehydrate({
          id: c.id!,
          userId: c.userId,
          tagId: 1,
          tag:"Array",
          title: c.title,
          description: c.description,
          starterCode: c.starterCode,
          language: c.language,
          createdAt: c.createdAt!,
          updatedAt: c.updatedAt!,
          difficulty:c.difficulty
        }),
      );
  }

  async update(
    id: number,
    dto: UpdateCodingChallengeDto,
  ): Promise<CodingChallenge> {
    const index = this.items.findIndex(c => c.id === id);

    if (index === -1) {
      throw new NotFoundException(`Challenge ${id} not found`);
    }

    if (dto.title && this.items.some(c => c.title === dto.title && c.id !== id)) {
      throw new ConflictException(`Challenge title '${dto.title}' already exists`);
    }

    const existing = this.items[index];

    const updated = CodingChallenge.rehydrate({
      id: existing.id!,
      userId: existing.userId,
      tagId: 1,
      tag:"Array",
      title: dto.title ?? existing.title,
      description: dto.description ?? existing.description,
      starterCode: dto.starterCode ?? existing.starterCode,
      language: dto.language ?? existing.language,
      createdAt: existing.createdAt!,
      updatedAt: new Date(),
      difficulty:"MEDIUM"
    });

    this.items[index] = updated;

    return updated;
  }

  async delete(id: number): Promise<void> {
    const exists = this.items.some(c => c.id === id);

    if (!exists) {
      throw new NotFoundException(`Challenge ${id} not found`);
    }

    this.items = this.items.filter(c => c.id !== id);
  }
}