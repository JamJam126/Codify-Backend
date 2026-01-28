import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { FakeAssignmentRepository } from './repositories/assignment.fake.repository';
import request from 'supertest';

describe('AssignmentController (Unit Tests)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [
        AssignmentService,
        { provide: 'ASSIGNMENT_REPOSITORY', useClass: FakeAssignmentRepository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /* ===================== TC-CA ===================== */
  it('TC-CA-01: Valid creation', async () => {
    const response = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 'Assignment 1',
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.title).toBe('Assignment 1');
    expect(response.body.description).toBe('Desc');
    expect(response.body.isPublished).toBe(false);
  });

  it('TC-CA-02: Missing title', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(400);
  });

  it('TC-CA-03: Missing sectionId', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({
        title: 'Assignment 1',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(400);
  });

  it('TC-CA-04: Empty request body', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({})
      .expect(400);
  });

  it('TC-CA-05: Title wrong data type', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 123,
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(400);
  });

  /* ===================== TC-GA ===================== */
  it('TC-GA-01: Fetch assignment with valid ID', async () => {
    const created = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 'Test Assignment',
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/assignments/${created.body.id}`)
      .expect(200);

    expect(response.body.id).toBe(created.body.id);
    expect(response.body.title).toBe('Test Assignment');
  });

  it('TC-GA-02: Non-existing assignment ID', async () => {
    await request(app.getHttpServer())
      .get('/assignments/999')  
      .expect(404);
  });

  it('TC-GA-03: Invalid assignment ID format', async () => {
    await request(app.getHttpServer())
      .get('/assignments/abc')
      .expect(400);
  });

  /* ===================== TC-GS ===================== */
  it('TC-GS-01: Fetch assignments with valid sectionId', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 'Test Assignment',
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
      })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/assignments/section/1').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('TC-GS-02: Non-existing sectionId', async () => {
    const response = await request(app.getHttpServer())
      .get('/assignments/section/999')
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('TC-GS-03: Invalid sectionId format', async () => {
    await request(app.getHttpServer())
      .get('/assignments/section/abc')
      .expect(400);
  });

  /* ===================== TC-UA ===================== */
  it('TC-UA-01: Update with valid ID and valid data', async () => {
    const created = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 'Test Assignment',
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
      })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/assignments/${created.body.id}`)
      .send({ title: 'Updated Title' })
      .expect(200);

    expect(updated.body.title).toBe('Updated Title');
  });

  it('TC-UA-02: Non-existing assignment', async () => {
    await request(app.getHttpServer())
      .patch('/assignments/999')
      .send({ title: 'X' })
      .expect(404);
  });

  it('TC-UA-03: Invalid assignment ID format', async () => {
    await request(app.getHttpServer())
      .patch('/assignments/abc')
      .send({ title: 'X' })
      .expect(400);
  });

  it('TC-UA-04: Invalid update data', async () => {
    await request(app.getHttpServer())
      .patch('/assignments/1')
      .send({ title: 123 })
      .expect(400);
  });

  /* ===================== TC-PA ===================== */
  it('TC-PA-01: Publish assignment with valid ID', async () => {
    const created = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 'Draft Assignment',
        description: '',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
      })
      .expect(201);

    const published = await request(app.getHttpServer())
      .patch(`/assignments/${created.body.id}/publish`)
      .expect(200);

    expect(published.body.isPublished).toBe(true);
  });

  it('TC-PA-02: Publish non-existing assignment', async () => {
    await request(app.getHttpServer())
      .patch('/assignments/999/publish')
      .expect(404);
  });

  it('TC-PA-03: Invalid assignment ID format', async () => {
    await request(app.getHttpServer())
      .patch('/assignments/abc/publish')
      .expect(400);
  });

  /* ===================== TC-DA ===================== */
  it('TC-DA-01: Delete assignment with valid ID', async () => {
    const created = await request(app.getHttpServer())
      .post('/assignments')
      .send({
        sectionId: 1,
        title: 'To Delete',
        description: 'Desc',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
      })
      .expect(201);

    await request(app.getHttpServer()).delete(`/assignments/${created.body.id}`).expect(204);
  });

  it('TC-DA-02: Non-existing assignment ID', async () => {
    await request(app.getHttpServer())
      .delete('/assignments/999')
      .expect(404);
  });

  it('TC-DA-03: Invalid assignment ID format', async () => {
    await request(app.getHttpServer())
      .delete('/assignments/abc')
      .expect(400);
  });
});