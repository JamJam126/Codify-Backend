export class Classroom {
  public id: number;
  public classCode: string;
  public name: string;
  public description?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: number,
    classCode: string,
    name: string,
    description?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.classCode = classCode;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  rename(newName: string) {
    if (newName.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    this.name = newName;
    this.updatedAt = new Date();
  }

  updateDescription(newDescription: string) {
    this.description = newDescription;
    this.updatedAt = new Date();
  }
}