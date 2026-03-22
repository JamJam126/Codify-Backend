export class Tag {
  constructor(
    public readonly id: number | null,
    public name: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  // create new entity
  static create(props: {
    name: string;
  }): Tag {
    return new Tag(
      null,
      props.name
    );
  }

  // rebuild entity from database
  static rehydrate(props: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): Tag {
    return new Tag(
      props.id,
      props.name,
      props.createdAt,
      props.updatedAt
    );
  }
}