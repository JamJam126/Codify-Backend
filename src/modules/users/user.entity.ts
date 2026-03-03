export class User {
  constructor(
    public readonly id: number | null,
    public name: string,
    public email: string,
    public hashed_password?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date,
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
      now
    );
  }

  static rehydrate(props: {
    id: number;
    name: string;
    email: string;
    hashed_password?: string;
  }): User {
    return new User(
      props.id,
      props.name,
      props.email,
      props.hashed_password
    );
  }
}
