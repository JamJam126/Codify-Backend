export type UserProfile = {
  type: "IMAGE" | "GENERATED";
  imageKey?: string | null;
  color?: string | null;
};

export class User {
  constructor(
    public readonly id: number | null,
    public name: string,
    public email: string,
    public hashed_password?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date,
    public profile?: UserProfile | null
  ) {}

  static create(props: {
    name: string;
    email: string;
  }): User {
    const now = new Date();

    return new User(
      null,
      props.name,
      props.email,
      null,
      now,
      now,
      null
    );
  }

  static rehydrate(props: {
    id: number;
    name: string;
    email: string;
    hashed_password?: string;
    createdAt?: Date;
    updatedAt?: Date;
    profile?: UserProfile | null;
  }): User {
    return new User(
      props.id,
      props.name,
      props.email,
      props.hashed_password,
      props.createdAt,
      props.updatedAt,
      props.profile
    );
  }
}