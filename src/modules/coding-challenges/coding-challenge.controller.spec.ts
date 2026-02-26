import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CodingChallengeController } from './coding-challenge.controller';
import { CodingChallengeService } from './coding-chellenge.service';
import { TestCaseService } from './test-case.service';
import { FakeCodingChallengeRepository } from './repositories/coding-challenge.fake.repository';
import { FakeTestCaseRepository } from './repositories/test-case.fake.repository';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('Coding Challenge Controller (E2E)', () => {
    let app: INestApplication;
    let fakeRepo: FakeCodingChallengeRepository;
    let fakeTestCaseRepo: FakeTestCaseRepository;
    let currentUserId = 1;

    beforeAll(async () => {
        fakeRepo = new FakeCodingChallengeRepository();
        fakeTestCaseRepo = new FakeTestCaseRepository();

        const moduleRef = await Test.createTestingModule({
            controllers: [CodingChallengeController],
            providers: [
                CodingChallengeService,
                TestCaseService,

                { provide: 'CodingChallengeRepository', useValue: fakeRepo },
                { provide: 'TestCaseRepository', useValue: fakeTestCaseRepo },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = { id: currentUserId };
                    return true;
                },
            })
            .compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
        );
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Create Challenge', () => {
        it('TC-CH-C-01: Create challenge with valid data', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'Loops', description: 'Solve loops', language: 'ts', starterCode: '' })
                .expect(201);
        });

        it('TC-CH-C-02: Missing title', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ description: 'Problem', language: 'ts', starterCode: '' })
                .expect(400);
        });

        it('TC-CH-C-03: Missing description', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'Loopss', description: '', language: 'ts', starterCode: '' })
                .expect(201);
        });

        it('TC-CH-C-04: Empty body', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({})
                .expect(400);
        });

        it('TC-CH-C-05: Title wrong type', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 123, description: 'desc', language: 'ts', starterCode: '' })
                .expect(400);
        });

        it('TC-CH-C-06: Description wrong type', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'Test', description: 999, language: 'ts', starterCode: '' })
                .expect(400);
        });

        it('TC-CH-C-07: Title too long', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'A'.repeat(300), description: 'desc', language: 'ts', starterCode: '' })
                .expect(400);
        });

        it('TC-CH-C-08: Duplicate challenge title', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'Loops', description: 'desc', language: 'ts', starterCode: '' })
                .expect(409);
        });
    });

    describe('Read Challenge', () => {
        let challengeId: number;

        beforeAll(async () => {
            const res = await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'ReadTest', description: 'desc', language: 'ts', starterCode: '' });
            challengeId = res.body.id;
        });

        it('TC-CH-R-01: Get challenge with valid ID', async () => {
            await request(app.getHttpServer())
                .get(`/challenges/${challengeId}`)
                .expect(200);
        });

        it('TC-CH-R-02: Challenge ID not found', async () => {
            await request(app.getHttpServer())
                .get(`/challenges/999`)
                .expect(404);
        });

        it('TC-CH-R-03: Invalid ID format', async () => {
            await request(app.getHttpServer())
                .get(`/challenges/abc`)
                .expect(400);
        });

        it('TC-CH-R-04: ID is zero', async () => {
            await request(app.getHttpServer())
                .get(`/challenges/0`)
                .expect(400);
        });

        it('TC-CH-R-05: Negative ID', async () => {
            await request(app.getHttpServer())
                .get(`/challenges/-5`)
                .expect(400);
        });

        it('TC-CH-R-06: List all challenges', async () => {
            await request(app.getHttpServer())
                .get('/challenges')
                .expect(200);
        });

        it('TC-CH-R-07: List challenges when none exist', async () => {
            await request(app.getHttpServer())
                .get('/challenges')
                .expect(200);
        });
    });

    describe('Update Challenge', () => {
        let challengeId: number;

        beforeEach(async () => {
            const res = await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'Old', description: 'desc', language: 'ts', starterCode: '' });
            challengeId = res.body.id;
        });

        it('TC-CH-U-01: Update challenge with valid data', async () => {
            await request(app.getHttpServer())
                .patch(`/challenges/${challengeId}`)
                .send({ title: 'Updated Title' })
                .expect(200);
        });

        it('TC-CH-U-02: Update description only', async () => {
            await request(app.getHttpServer())
                .patch(`/challenges/${challengeId}`)
                .send({ description: 'New desc' })
                .expect(200);
        });

        it('TC-CH-U-03: Update non-existing challenge', async () => {
            await request(app.getHttpServer())
                .patch('/challenges/999')
                .send({ title: 'Does not exist' })
                .expect(404);
        });

        it('TC-CH-U-04: Invalid update body type', async () => {
            await request(app.getHttpServer())
                .patch(`/challenges/${challengeId}`)
                .send({ title: 555 })
                .expect(400);
        });

        it('TC-CH-U-05: Empty update body', async () => {
            await request(app.getHttpServer())
                .patch(`/challenges/${challengeId}`)
                .send({})
                .expect(400);
        });

        it('TC-CH-U-06: Update causes duplicate title', async () => {
            await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'Duplicate', description: 'desc', language: 'ts', starterCode: 'a' });
            await request(app.getHttpServer())
                .patch(`/challenges/${challengeId}`)
                .send({ title: 'Duplicate', description: 'desc', language: 'ts', starterCode: 'a' })
                .expect(409);
        });
    });

    describe('Delete Challenge', () => {
        let challengeId: number;

        beforeEach(async () => {
            const res = await request(app.getHttpServer())
                .post('/challenges')
                .send({ title: 'DeleteTest', description: 'desc', language: 'ts', starterCode: '' });
            challengeId = res.body.id;
        });

        it('TC-CH-D-01: Delete existing challenge', async () => {
            await request(app.getHttpServer())
                .delete(`/challenges/${challengeId}`)
                .expect(204);
        });

        it('TC-CH-D-02: Delete non-existing challenge', async () => {
            await request(app.getHttpServer())
                .delete('/challenges/999')
                .expect(404);
        });

        it('TC-CH-D-03: Invalid ID format', async () => {
            await request(app.getHttpServer())
                .delete('/challenges/abc')
                .expect(400);
        });

        it('TC-CH-D-04: Unauthorized delete (no token)', async () => {
            const moduleRef = await Test.createTestingModule({
                controllers: [CodingChallengeController],
                providers: [
                    CodingChallengeService,
                    TestCaseService,
                    { provide: 'CodingChallengeRepository', useValue: fakeRepo },
                    { provide: 'TestCaseRepository', useValue: fakeTestCaseRepo },
                ],
            })
                .overrideGuard(JwtAuthGuard)
                .useValue({
                    canActivate: () => {
                        throw new UnauthorizedException();
                    }
                })
                .compile();

            const unauthorizedApp = moduleRef.createNestApplication();
            unauthorizedApp.useGlobalPipes(
                new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
            );
            await unauthorizedApp.init();

            await request(unauthorizedApp.getHttpServer())
                .delete(`/challenges/${challengeId}`)
                .expect(401);

            await unauthorizedApp.close();
        });

        it('TC-CH-D-05: Forbidden user deletes challenge', async () => {
            currentUserId = 999;
            await request(app.getHttpServer())
                .delete(`/challenges/${challengeId}`)
                .expect(403);
            currentUserId = 1;
        });

        // it('TC-CH-D-06: Delete challenge with existing test cases', async () => {
        //   await request(app.getHttpServer())
        //     .delete(`/challenges/${challengeId}`)
        //     .expect(409); 
        // });
    });
});
