import { ClassroomMember } from '../domain/classroom-member.entity';
import { Classroom } from '../domain/classroom.entity';
import { ClassroomRepository } from '../domain/classroom.repository';
import { Role } from '../domain/role.enum';
import { FakeClassroomMemberRepository } from './classroom-member.fake.repository';

export class FakeClassroomRepository implements ClassroomRepository {
  constructor(
    private readonly memberRepo?: FakeClassroomMemberRepository
  ) {}

  private items: Classroom[] = [];
  private idSeq = 1;

  async create(classroom: Classroom, creatorId: number): Promise<Classroom> {
    const created = Classroom.rehydrate({
      id: this.idSeq++,
      classCode: classroom.classCode,
      name: classroom.name,
      description: classroom.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.items.push(created);

    if (this.memberRepo) {
      await this.memberRepo.addMember(
        created.id!,
        new ClassroomMember(creatorId, Role.OWNER),
      );
    }
    
    return created;
  }

  async findById(id: number): Promise<Classroom | null> {
    const found = this.items.find(c => c.id === id);
		return found ? Classroom.rehydrate({
			id: found.id!,
			classCode: found.classCode,
			name: found.name,
			description: found.description,
			createdAt: found.createdAt!,
			updatedAt: found.updatedAt!
		}) : null;
  }

  async findByClassCode(code: string): Promise<Classroom | null> {
    const found = this.items.find(c => c.classCode === code);
		return found ? Classroom.rehydrate({
			id: found.id!,
			classCode: found.classCode,
			name: found.name,
			description: found.description,
			createdAt: found.createdAt!,
			updatedAt: found.updatedAt!
		}) : null;
	}

  async findAllByUser(userId: number): Promise<Classroom[]> {
    if (!this.memberRepo) return [];
    const results = await Promise.all(
      this.items.map(async c => {
        const member = await this.memberRepo!.findMember(c.id!, userId);
        return member ? c : null;
      })
    );

    return results.filter(c => c !== null) as Classroom[];
  }

  async update(classroom: Classroom): Promise<Classroom> {
    const index = this.items.findIndex(c => c.id === classroom.id);
		if (index === -1) throw new Error('Classroom Not Found');
		const updated = Classroom.rehydrate({
      id: classroom.id!,
      classCode: classroom.classCode,
      name: classroom.name,
      description: classroom.description,
      createdAt: classroom.createdAt!,
      updatedAt: new Date(),
    });

		this.items[index] = updated;
		return updated;
  }

  async deleteById(id: number): Promise<void> {
    const exists = this.items.some(c => c.id === id);
    if (!exists) throw new Error('Classroom Not Found');

    this.items = this.items.filter(c => c.id !== id);
  }
}
