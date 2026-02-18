export class CodingChallenge {
  constructor(
    public readonly id: number | null,
    public userId: number,
    public tagId: number,
    public title: string,
    public description: string,
    public starterCode: string,
    public language: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  // create new entity
  static create(props: {
    userId: number;
    tagId: number;
    title: string;
    description: string;
    starterCode: string;
    language: string;
  }): CodingChallenge {
    return new CodingChallenge(
      null,
      props.userId,
      props.tagId,
      props.title,
      props.description,
      props.starterCode,
      props.language,
    );
  }

  // rebuild entity from database
  static rehydrate(props: {
    id: number;
    userId: number;
    tagId: number;
    title: string;
    description: string;
    starterCode: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
  }): CodingChallenge {
    return new CodingChallenge(
      props.id,
      props.userId,
      props.tagId,
      props.title,
      props.description,
      props.starterCode,
      props.language,
      props.createdAt,
      props.updatedAt
    );
  }

}
