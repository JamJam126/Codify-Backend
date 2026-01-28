import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClassroomService } from '../application/classroom.service';
import { FakeClassroomRepository } from '../infrastructure/classroom.fake.repository';
import { FakeClassroomMemberRepository } from '../infrastructure/classroom-member.fake.repository';
import { Role } from '../domain/role.enum';


describe('ClassroomService', () => {
  let service: ClassroomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        {
          provide: 'ClassroomRepository',
          useClass: FakeClassroomRepository,
        },
        {
          provide: 'ClassroomMemberRepository',
          useClass: FakeClassroomMemberRepository,
        },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  /* ===================== CREATE ===================== */
  it('TC-CS-01: Create classroom', async () => {
    const classroom = await service.create(
      { name: 'Math', description: 'Basic math' },
      1,
    );

    expect(classroom.id).toBeDefined();
    expect(classroom.name).toBe('Math');
  });

  /* ===================== FIND ===================== */
  it('TC-CS-02: Find existing classroom', async () => {
    const created = await service.create({ name: 'Physics' }, 1);

    const found = await service.findOne(created.id!);
    expect(found.id).toBe(created.id);
  });

  it('TC-CS-03: Find non-existing classroom should throw', async () => {
    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /* ===================== UPDATE ===================== */
  it('TC-CS-04: Update existing classroom', async () => {
    const created = await service.create({ name: 'Old Name' }, 1);

    const updated = await service.update(created.id!, {
      name: 'New Name',
    });

    expect(updated.name).toBe('New Name');
  });

  it('TC-CS-05: Update non-existing classroom should throw', async () => {
    await expect(service.update(999, { name: 'X' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /* ===================== DELETE ===================== */
  it('TC-CS-06: Delete existing classroom', async () => {
    const created = await service.create({ name: 'To Delete' }, 1);

    await expect(service.delete(created.id!)).resolves.toBeUndefined();
  });

  it('TC-CS-07: Delete non-existing classroom should throw', async () => {
    await expect(service.delete(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Add Member ===================== */
  it('TC-S-AM-01: Admin adds member successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, 1); // userId 1 is admin
    const added = await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    expect(added.userId).toBe(2);
    expect(added.role).toBe(Role.STUDENT);
  });

  it('TC-S-AM-02: Classroom does not exist', async () => {
    await expect(service.addMember(999, 1, { userId: 2, role: Role.STUDENT }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-AM-03: Requester is not admin', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await expect(service.addMember(classroom.id!, 2, { userId: 3, role: Role.STUDENT }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('TC-S-AM-04: Member already exists', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    await expect(service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  /* ===================== Remove Member ===================== */
  it('TC-S-RM-01: Admin removes member successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    await expect(service.removeMember(classroom.id!, 1, 2)).resolves.toBeUndefined();
  });

  it('TC-S-RM-02: Classroom not found', async () => {
    await expect(service.removeMember(999, 1, 2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-RM-03: Requester not admin', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    await expect(service.removeMember(classroom.id!, 2, 2)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('TC-S-RM-04: Admin tries to remove self', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await expect(service.removeMember(classroom.id!, 1, 1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('TC-S-RM-05: Member does not exist', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await expect(service.removeMember(classroom.id!, 1, 999)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Change Member Role ===================== */
  it('TC-S-CMR-01: Admin changes role successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    const updated = await service.changeMemberRole(classroom.id!, 1, 2, Role.ADMIN);
    expect(updated.role).toBe(Role.ADMIN);
  });

  it('TC-S-CMR-02: Classroom not found', async () => {
    await expect(service.changeMemberRole(999, 1, 2, Role.ADMIN))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-CMR-03: Requester not admin', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    await expect(service.changeMemberRole(classroom.id!, 2, 1, Role.ADMIN))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('TC-S-CMR-04: Member not found', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await expect(service.changeMemberRole(classroom.id!, 1, 999, Role.ADMIN))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-CMR-05: Role already same', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    await expect(service.changeMemberRole(classroom.id!, 1, 2, Role.STUDENT))
      .rejects.toBeInstanceOf(ConflictException);
  });

  /* ===================== List Members ===================== */
  it('TC-S-LM-01: List members successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    const members = await service.listMembers(classroom.id!);
    expect(members.length).toBe(2);
  });

  it('TC-S-LM-02: Classroom not found', async () => {
    await expect(service.listMembers(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Get Single Member ===================== */
  it('TC-S-GM-01: Get member successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await service.addMember(classroom.id!, 1, { userId: 2, role: Role.STUDENT });
    const member = await service.getMember(classroom.id!, 2);
    expect(member.userId).toBe(2);
  });

  it('TC-S-GM-02: Classroom not found', async () => {
    await expect(service.getMember(999, 2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-GM-03: Member not found', async () => {
    const classroom = await service.create({ name: 'Math' }, 1);
    await expect(service.getMember(classroom.id!, 999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
