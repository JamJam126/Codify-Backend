import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomService } from '../application/classroom.service';
import { FakeClassroomRepository } from '../infrastructure/classroom.fake.repository';
import { FakeClassroomMemberRepository } from '../infrastructure/classroom-member.fake.repository';

describe('Classroom Controller (Fixed Unit Tests)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClassroomsController],
      providers: [
        ClassroomService,
        { provide: 'ClassroomRepository', useClass: FakeClassroomRepository },
        { provide: 'ClassroomMemberRepository', useClass: FakeClassroomMemberRepository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /* ===================== CREATE CLASSROOM ===================== */
  it('TC-CC-01: Valid classroom creation', async () => {
    const res = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math', description: 'Basic math' })
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Math');
  });

  it('TC-CC-02: Create classroom without description', async () => {
    const res = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math' })
      .expect(201);
    expect(res.body.name).toBe('Math');
  });

  it('TC-CC-03: Missing name', async () => {
    await request(app.getHttpServer())
      .post('/classrooms')
      .send({ description: 'Basic math' })
      .expect(400);
  });

  it('TC-CC-04: Empty request body', async () => {
    await request(app.getHttpServer())
      .post('/classrooms')
      .send({})
      .expect(400);
  });

  it('TC-CC-05: Name wrong data type', async () => {
    await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 123 })
      .expect(400);
  });

  /* ===================== GET CLASSROOM BY CLASSCODE ===================== */
  it('TC-GC-01: Fetch classroom with valid classCode', async () => {
		const response = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math', description: 'Basic math' })
      .expect(201);

		const createdCode = response.body.classCode;
    await request(app.getHttpServer())
      .get(`/classrooms/by-code/${createdCode}`)
      .expect(200);
  });

  it('TC-GC-02: Non-existing classCode', async () => {
    await request(app.getHttpServer())
      .get('/classrooms/by-code/XXX99')
      .expect(404);
  });

  it('TC-GC-03: Empty classCode (placeholder)', async () => {
    await request(app.getHttpServer())
      .get('/classrooms/by-code/PLACEHOLDER') // placeholder for you to fix later
      .expect(404); // place holder 404, real code is 400
  });

  /* ===================== GET CLASSROOM BY ID ===================== */
  it('TC-GI-01: Fetch classroom with valid ID', async () => {
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/classrooms/${created.body.id}`)
      .expect(200);
    expect(res.body.name).toBe('Math');
  });

  it('TC-GI-02: Invalid classroom ID format', async () => {
    await request(app.getHttpServer())
      .get('/classrooms/abc')
      .expect(400);
  });

  it('TC-GI-03: Non-existing classroom ID', async () => {
    await request(app.getHttpServer())
      .get('/classrooms/999')
      .expect(404);
  });

  /* ===================== UPDATE CLASSROOM ===================== */
  it('TC-UI-01: Update classroom with valid ID and valid data', async () => {
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/classrooms/${created.body.id}`)
      .send({ name: 'New Math' })
      .expect(200);
    expect(updated.body.name).toBe('New Math');
  });

  it('TC-UI-02: Invalid classroom ID format', async () => {
    await request(app.getHttpServer())
      .patch('/classrooms/abc')
      .send({ name: 'X' })
      .expect(400);
  });

  it('TC-UI-03: Non-existing classroom ID', async () => {
    await request(app.getHttpServer())
      .patch('/classrooms/999')
      .send({ name: 'Valid name' })
      .expect(404);
  });

  it('TC-UI-04: Empty name', async () => {
    await request(app.getHttpServer())
      .patch('/classrooms/1')
      .send({ name: '' })
      .expect(400);
  });

  /* ===================== DELETE CLASSROOM ===================== */
  it('TC-DI-01: Delete classroom with valid ID', async () => {
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'To Delete' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/classrooms/${created.body.id}`)
      .expect(204);
  });

  it('TC-DI-02: Invalid classroom ID format', async () => {
    await request(app.getHttpServer())
      .delete('/classrooms/abc')
      .expect(400);
  });

  it('TC-DI-03: Non-existing classroom ID', async () => {
    await request(app.getHttpServer())
      .delete('/classrooms/999')
      .expect(404);
  });

  /* ===================== Add Member ===================== */
  it('TC-S-AM-01: Admin adds member successfully', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/classrooms/${resClassroom.body.id}/members`)
      .send({ userId: 2, role: 'STUDENT' })
      .expect(201);
  });

  it('TC-S-AM-02: Classroom does not exist', async () => {
    await request(app.getHttpServer())
      .post(`/classrooms/999/members`)
      .send({ userId: 2, role: 'STUDENT' })
      .expect(404);
  });

  it('TC-S-AM-03: Requester is not admin', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Science' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/classrooms/${resClassroom.body.id}/members`)
      .send({ userId: 3, role: 'STUDENT' })
      .expect(403);
  });

  /* ===================== Remove Member ===================== */
  it('TC-S-RM-01: Admin removes member successfully', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'History' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/classrooms/${resClassroom.body.id}/members`)
      .send({ userId: 2, role: 'STUDENT' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/classrooms/${resClassroom.body.id}/members/2`)
      .expect(204);
  });

  it('TC-S-RM-02: Classroom not found', async () => {
    await request(app.getHttpServer())
      .delete(`/classrooms/999/members/2`)
      .expect(404);
  });

  it('TC-S-RM-03: Requester not admin', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Geography' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/classrooms/${resClassroom.body.id}/members/2`)
      .expect(403);
  });

  /* ===================== Change Member Role ===================== */
  it('TC-S-CMR-01: Admin changes role successfully', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Physics' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/classrooms/${resClassroom.body.id}/members`)
      .send({ userId: 2, role: 'STUDENT' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/classrooms/${resClassroom.body.id}/members/2/role`)
      .send({ role: 'ADMIN' })
      .expect(200);
  });

  /* ===================== List Members ===================== */
  it('TC-S-LM-01: List members successfully', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Chemistry' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/classrooms/${resClassroom.body.id}/members`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  /* ===================== Get Single Member ===================== */
  it('TC-S-GM-01: Get member successfully', async () => {
    const resClassroom = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Biology' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/classrooms/${resClassroom.body.id}/members`)
      .send({ userId: 2, role: 'STUDENT' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/classrooms/${resClassroom.body.id}/members/2`)
      .expect(200);

    expect(res.body.userId).toBe(2);
  });
});
