
export class Classroom {
  public id: number;
  public classCode: string;
  public name: string;
  public description?: string;
  public teacherId: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: number,
    classCode: string,
    name: string,
    teacherId: number,
    description?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.classCode = classCode;
    this.name = name;
    this.teacherId = teacherId;
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

  changeDescription(description?: string) {
    this.description = description;
    this.updatedAt = new Date();
  }

  assignTeacher(teacherId: number) {
    this.teacherId = teacherId;
    this.updatedAt = new Date();
  }
}