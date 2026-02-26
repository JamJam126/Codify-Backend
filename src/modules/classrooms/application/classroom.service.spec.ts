import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClassroomService } from '../application/classroom.service';
import { FakeClassroomRepository } from '../infrastructure/classroom.fake.repository';
import { FakeClassroomMemberRepository } from '../infrastructure/classroom-member.fake.repository';
import { Role } from '../domain/role.enum';

describe('ClassroomService', () => {
  let service: ClassroomService;
  let ownerId: number;
  let teacherId: number;
  let studentId: number;

  beforeEach(async () => {
    ownerId = 1;
    teacherId = 2;
    studentId = 3;

    const memberRepo = new FakeClassroomMemberRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        {
          provide: 'ClassroomMemberRepository',
          useValue: memberRepo,
        },
        {
          provide: 'ClassroomRepository',
          useFactory: () => new FakeClassroomRepository(memberRepo),
        },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  /* ===================== CREATE ===================== */
  it('TC-CS-01: Create classroom', async () => {
    const classroom = await service.create(
      { name: 'Math', description: 'Basic math' },
      ownerId,
    );

    expect(classroom.id).toBeDefined();
    expect(classroom.name).toBe('Math');
  });

  /* ===================== FIND ===================== */
  it('TC-CS-02: Find existing classroom', async () => {
    const created = await service.create({ name: 'Physics' }, ownerId);

    const found = await service.findOne(created.id!, ownerId);
    expect(found.id).toBe(created.id);
  });

  it('TC-CS-03: Find non-existing classroom should throw', async () => {
    await expect(service.findOne(999, ownerId)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== UPDATE ===================== */
  it('TC-CS-04: Update existing classroom', async () => {
    const created = await service.create({ name: 'Old Name' }, ownerId);

    const updated = await service.update(created.id!, { name: 'New Name' }, ownerId);
    expect(updated.name).toBe('New Name');
  });

  it('TC-CS-05: Update non-existing classroom should throw', async () => {
    await expect(service.update(999, { name: 'X' }, ownerId)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== DELETE ===================== */
  it('TC-CS-06: Delete existing classroom', async () => {
    const created = await service.create({ name: 'To Delete' }, ownerId);
    await expect(service.delete(created.id!, ownerId)).resolves.toBeUndefined();
  });

  it('TC-CS-07: Delete non-existing classroom should throw', async () => {
    await expect(service.delete(999, ownerId)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Add Member ===================== */
  it('TC-S-AM-01: Owner adds student successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    const added = await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    expect(added.userId).toBe(studentId);
    expect(added.role).toBe(Role.STUDENT);
  });

  it('TC-S-AM-02: Classroom does not exist', async () => {
    await expect(service.addMember(999, ownerId, { userId: studentId, role: Role.STUDENT }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-AM-03: Non-admin requester cannot add', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await expect(service.addMember(classroom.id!, studentId, { userId: teacherId, role: Role.TEACHER }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('TC-S-AM-04: Member already exists', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    await expect(service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  /* ===================== Remove Member ===================== */
  it('TC-S-RM-01: Owner removes member successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    await expect(service.removeMember(classroom.id!, ownerId, studentId)).resolves.toBeUndefined();
  });

  it('TC-S-RM-02: Classroom not found', async () => {
    await expect(service.removeMember(999, ownerId, studentId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-RM-03: Non-admin requester cannot remove', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    await expect(service.removeMember(classroom.id!, studentId, studentId)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('TC-S-RM-04: Owner cannot remove self', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await expect(service.removeMember(classroom.id!, ownerId, ownerId)).rejects.toBeInstanceOf(ConflictException);
  });

  it('TC-S-RM-05: Member does not exist', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await expect(service.removeMember(classroom.id!, ownerId, 999)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Change Member Role ===================== */
  it('TC-S-CMR-01: Owner changes role successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: teacherId, role: Role.TEACHER });

    const updated = await service.changeMemberRole(classroom.id!, ownerId, teacherId, Role.STUDENT);
    expect(updated.role).toBe(Role.STUDENT);
  });

  it('TC-S-CMR-02: Classroom not found', async () => {
    await expect(service.changeMemberRole(999, ownerId, teacherId, Role.TEACHER))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-CMR-03: Non-owner cannot change roles', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: teacherId, role: Role.TEACHER });

    await expect(service.changeMemberRole(classroom.id!, teacherId, studentId, Role.TEACHER))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('TC-S-CMR-04: Member not found', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await expect(service.changeMemberRole(classroom.id!, ownerId, 999, Role.TEACHER))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-CMR-05: Role already same', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    await expect(service.changeMemberRole(classroom.id!, ownerId, studentId, Role.STUDENT))
      .rejects.toBeInstanceOf(ConflictException);
  });

  /* ===================== List Members ===================== */
  it('TC-S-LM-01: List members successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    const members = await service.listMembers(classroom.id!, ownerId);
    expect(members.length).toBe(2); // owner + student
  });

  it('TC-S-LM-02: Classroom not found', async () => {
    await expect(service.listMembers(999, ownerId)).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Get Single Member ===================== */
  it('TC-S-GM-01: Get member successfully', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await service.addMember(classroom.id!, ownerId, { userId: studentId, role: Role.STUDENT });

    const member = await service.getMember(classroom.id!, studentId, ownerId);
    expect(member.userId).toBe(studentId);
  });

  it('TC-S-GM-02: Classroom not found', async () => {
    await expect(service.getMember(999, studentId, ownerId)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC-S-GM-03: Member not found', async () => {
    const classroom = await service.create({ name: 'Math' }, ownerId);
    await expect(service.getMember(classroom.id!, 999, ownerId)).rejects.toBeInstanceOf(NotFoundException);
  });
});
