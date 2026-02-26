import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomService } from '../application/classroom.service';
import { FakeClassroomRepository } from '../infrastructure/classroom.fake.repository';
import { FakeClassroomMemberRepository } from '../infrastructure/classroom-member.fake.repository';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Role } from '../domain/role.enum';

describe('Classroom Controller', () => {
  let app: INestApplication;
  let fakeMemberRepo: FakeClassroomMemberRepository;
  let currentUserId = 1; // DEFAULT USER ID

  beforeAll(async () => {
    fakeMemberRepo = new FakeClassroomMemberRepository();

    const moduleRef = await Test.createTestingModule({
      controllers: [ClassroomsController],
      providers: [
        ClassroomService,
        {
          provide: 'ClassroomRepository',
          useFactory: () => new FakeClassroomRepository(fakeMemberRepo),
        },
        { provide: 'ClassroomMemberRepository', useValue: fakeMemberRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: currentUserId };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /* ===================== CREATE CLASSROOM ===================== */
  it('TC-CC-01: Valid classroom creation', async () => {
    currentUserId = 1;
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
      .send({ name: 'Physics' })
      .expect(201);
    expect(res.body.name).toBe('Physics');
  });

  it('TC-CC-03: Missing name', async () => {
    await request(app.getHttpServer())
      .post('/classrooms')
      .send({ description: 'No name' })
      .expect(400);
  });

  it('TC-CC-04: Empty body', async () => {
    await request(app.getHttpServer()).post('/classrooms').send({}).expect(400);
  });

  it('TC-CC-05: Invalid data type', async () => {
    await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 123 })
      .expect(400);
  });

  /* ===================== GET CLASSROOM BY CLASSCODE ===================== */
  it('TC-GC-01: Fetch classroom with valid classCode', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Chemistry' })
      .expect(201);

    const classCode = created.body.classCode;

    await request(app.getHttpServer())
      .get(`/classrooms/by-code/${classCode}`)
      .expect(200);
  });

  it('TC-GC-02: Non-existing classCode', async () => {
    await request(app.getHttpServer())
      .get('/classrooms/by-code/INVALID')
      .expect(404);
  });

  /* ===================== GET CLASSROOM BY ID ===================== */
  it('TC-GI-01: Fetch classroom with valid ID', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'History' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/classrooms/${created.body.id}`)
      .expect(200);

    expect(res.body.name).toBe('History');
  });

  it('TC-GI-02: Invalid classroom ID format', async () => {
    await request(app.getHttpServer()).get('/classrooms/abc').expect(400);
  });

  it('TC-GI-03: Non-existing classroom ID', async () => {
    await request(app.getHttpServer()).get('/classrooms/999').expect(404);
  });

  /* ===================== AUTHORIZATION TESTS ===================== */
  it('TC-GI-AUTH-01: User cannot access classroom they are not a member of', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Private Class' })
      .expect(201);

    currentUserId = 2;
    await request(app.getHttpServer())
      .get(`/classrooms/${created.body.id}`)
      .expect(403);
  });

  it('TC-GI-AUTH-02: User can access classroom they are a member of', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Shared Class' })
      .expect(201);

    await fakeMemberRepo.addMember(created.body.id, { userId: 2, role: Role.STUDENT });

    currentUserId = 2;
    await request(app.getHttpServer())
      .get(`/classrooms/${created.body.id}`)
      .expect(200);
  });

  /* ===================== UPDATE CLASSROOM ===================== */
  it('TC-UI-01: Update classroom with valid ID and data', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Math' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/classrooms/${created.body.id}`)
      .send({ name: 'Advanced Math' })
      .expect(200);

    expect(updated.body.name).toBe('Advanced Math');
  });

  /* ===================== DELETE CLASSROOM ===================== */
  it('TC-DI-01: Delete classroom with valid ID', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'To Delete' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/classrooms/${created.body.id}`)
      .expect(204);
  });

  /* ===================== MEMBER ENDPOINTS ===================== */
  it('TC-S-AM-01: Teacher adds member', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'Team Class' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/classrooms/${created.body.id}/members`)
      .send({ userId: 2, role: Role.STUDENT })
      .expect(201);
  });

  it('TC-S-AM-AUTH: Non-admin cannot add member', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'test Test' })
      .expect(201);

    currentUserId = 2; 
    await request(app.getHttpServer())
      .post(`/classrooms/${created.body.id}/members`)
      .send({ userId: 3, role: Role.STUDENT })
      .expect(403);
  });

  it('TC-S-RM-01: Teacher removes member', async () => {
    currentUserId = 1;
    const created = await request(app.getHttpServer())
      .post('/classrooms')
      .send({ name: 'History Class' })
      .expect(201);

    await fakeMemberRepo.addMember(created.body.id, { userId: 2, role: Role.STUDENT });

    await request(app.getHttpServer())
      .delete(`/classrooms/${created.body.id}/members/2`)
      .expect(204);
  });
});
