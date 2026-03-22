import { ChallengeDifficulty } from "@prisma/client";

export class CodingChallenge {
  constructor(
    public readonly id: number | null,
    public userId: number,
    public title: string,
    public description: string,
    public starterCode: string,
    public language: string,
    public difficulty: ChallengeDifficulty,
    public tagId?: number | null,
    public createdAt?: Date,
    public updatedAt?: Date,
    public tag?: string
  ) {}

  /**
   * Create a new entity (not persisted yet)
   */
  static create(props: {
    userId: number;
    title: string;
    description: string;
    starterCode: string;
    language: string;
    difficulty: ChallengeDifficulty;
    tagId?: number | null;
  }): CodingChallenge {
    return new CodingChallenge(
      null,
      props.userId,
      props.title,
      props.description,
      props.starterCode,
      props.language,
      props.difficulty,
      props.tagId
    );
  }

  /**
   * Rebuild entity from database record
   */
  static rehydrate(props: {
    id: number;
    userId: number;
    title: string;
    description: string;
    starterCode: string;
    language: string;
    difficulty: ChallengeDifficulty;
    tagId: number | null;
    createdAt: Date;
    updatedAt: Date;
    tag?: string | null;
  }): CodingChallenge {
    return new CodingChallenge(
      props.id,
      props.userId,
      props.title,
      props.description,
      props.starterCode,
      props.language,
      props.difficulty,
      props.tagId??undefined,
      props.createdAt,
      props.updatedAt,
      props.tag ?? undefined // safely convert null to undefined for entity
    );
  }
}