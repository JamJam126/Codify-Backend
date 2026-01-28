import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { FakeAssignmentRepository } from './repositories/assignment.fake.repository';

describe('AssignmentService', () => {
  let service: AssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        {
          provide: 'ASSIGNMENT_REPOSITORY',
          useClass: FakeAssignmentRepository,
        },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
  });

  /* ===================== Create Assignment ===================== */
  it('TC-CA-01: Valid creation', async () => {
    const dto = {
      sectionId: 1,
      title: 'Assignment 1',
      description: 'Desc',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      position: 1,
    };

    const assignment = await service.create(dto as any);

    expect(assignment.id).toBeDefined();
    expect(assignment.title).toBe(dto.title);
    expect(assignment.description).toBe(dto.description);
    expect(assignment.isPublished).toBe(false);
  });

  /* ===================== Get Assignment ===================== */
  it('TC-GA-01: Get existing assignment', async () => {
    const created = await service.create({
      sectionId: 1,
      title: 'Test Assignment',
      description: 'Desc',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      position: 1,
    } as any);

    const found = await service.findOne(created.id!);
    expect(found.id).toBe(created.id);
  });

  it('TC-GA-02: Get non-existing assignment should throw', async () => {
    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /* ===================== Update Assignment ===================== */
  it('TC-UA-01: Update existing assignment', async () => {
    const created = await service.create({
      sectionId: 1,
      title: 'Old Title',
      description: 'Desc',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      position: 1,
    } as any);

    const updated = await service.update(created.id!, {
      title: 'New Title',
    } as any);
    expect(updated.title).toBe('New Title');
  });

  it('TC-UA-02: Update non-existing assignment should throw', async () => {
    await expect(
      service.update(999, { title: 'X' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  /* ===================== Publish Assignment ===================== */
  it('TC-PA-01: Publish existing assignment', async () => {
    const created = await service.create({
      sectionId: 1,
      title: 'Draft Assignment',
      description: 'Desc',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      position: 1,
    } as any);

    const published = await service.publish(created.id!);
    expect(published.isPublished).toBe(true);
  });

  it('TC-PA-02: Publish non-existing assignment should throw', async () => {
    await expect(service.publish(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  /* ===================== Delete Assignment ===================== */
  it('TC-DA-01: Delete existing assignment', async () => {
    const created = await service.create({
      sectionId: 1,
      title: 'To Delete',
      description: 'Desc',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      position: 1,
    } as any);

    await expect(service.delete(created.id!)).resolves.toBeUndefined();
  });

  it('TC-DA-02: Delete non-existing assignment should throw', async () => {
    await expect(service.delete(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
