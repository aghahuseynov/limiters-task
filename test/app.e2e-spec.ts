import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('it should return 200 status code (GET) /private', () => {
    return request(app.getHttpServer())
      .get('/private')
      .set('Authorization', 'Agha')
      .expect(200)
      .expect('Hello World!');
  });

  it('should return 403 status code without token (GET) /private', () => {
    return request(app.getHttpServer()).get('/private').expect(403);
  });

  it('should return 200 status code (GET) /public ', () => {
    return request(app.getHttpServer())
      .get('/public')
      .expect(200)
      .expect('Hello World!');
  });
});
