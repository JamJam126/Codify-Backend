export class Classroom {
  constructor(
    public readonly id: number | null,
    public readonly classCode: string,
    public name: string,
    public description?: string,
    public readonly createdAt?: Date,
    public updatedAt?: Date
  ) {}

  static create(props: { 
    name: string; 
    description?: string; 
    classCode: string 
  }): Classroom {
    if (props.name.trim().length < 2) 
      throw new Error('Name too short');

    return new Classroom(
      null, 
      props.classCode, 
      props.name, 
      props.description, 
      new Date(), 
      new Date()
    );
  }

  static rehydrate(props: {
    id: number;
    classCode: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Classroom {
    return new Classroom(
      props.id,
      props.classCode,
      props.name,
      props.description,
      props.createdAt,
      props.updatedAt
    );
  }

  rename(newName: string) {
    if (newName.trim().length < 2) throw new Error('Name too short');
    this.name = newName;
    this.updatedAt = new Date();
  }

  updateDescription(desc?: string) {
    this.description = desc;
    this.updatedAt = new Date();
  }
}
