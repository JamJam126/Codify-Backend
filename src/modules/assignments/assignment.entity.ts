export class Assignment {
  constructor(
    public readonly id: number | null,
    public classroomId: number,
    public sectionId: number,
    public title: string,
    public description: string,
    public dueAt: Date,
    public position: number,
    public isPublished: boolean,
  ) {}

  static create(props: {
    classroomId: number;
    sectionId: number;
    title: string;
    description: string;
    dueAt: Date;
    position: number;
  }): Assignment {
    return new Assignment(
      null,
      props.classroomId,
      props.sectionId,
      props.title,
      props.description,
      props.dueAt,
      props.position,
      false,
    );
  };
    
  static rehydrate(props: {
    id: number;
    classroomId: number;
    sectionId: number;
    title: string;
    description: string;
    dueAt: Date;
    position: number;
    isPublished: boolean;
  }): Assignment {
    return new Assignment(
      props.id,
      props.classroomId,
      props.sectionId,
      props.title,
      props.description,
      props.dueAt,
      props.position,
      props.isPublished,
    );
  }

  publish(): void {
    if (this.isPublished) 
      throw new Error('The assignment is already published');

    if (this.dueAt <= new Date()) 
      throw new Error('Cannot publish an assignment past its due date');

    this.isPublished = true;
  }

  update(props: {
    title?: string;
    description?: string,
    dueAt?: Date;
  }): void {
    if (props.title !== undefined) {
      if (props.title.trim().length < 2) 
        throw new Error('Assignment title must be at least 2 characters long');

      this.title = props.title;
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }

    if (props.dueAt !== undefined) {
      if (props.dueAt <= new Date())
        throw new Error('Cannot move due date to the past');

      this.dueAt = props.dueAt;
    }
  }
}
