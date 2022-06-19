import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { requestArr as ipRequestArr } from '../src/limiters/ip.limiter.guard';
import { requestArr as tokenRequestArr } from '../src/limiters/token.limiter.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    ipRequestArr.length = 0;
    tokenRequestArr.length = 0;
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

  it('should return 403 after 100 reques for IPt', (done) => {
    const ipRequests = [];
    for (let i = 0; i < 104; i++) {
      const req = request(app.getHttpServer()).get('/public');
      ipRequests.push(req);
    }
    Promise.all(ipRequests)
      .then((values) => {
        const hasValue = values.some((a) => a.status === 403);

        if (hasValue) {
          done();
        } else {
          done('Error');
        }
      })
      .catch(done);
  });

  it('should NOT return 403 before 99 request for IP', (done) => {
    const ipRequests = [];
    for (let i = 0; i < 99; i++) {
      const req = request(app.getHttpServer()).get('/public');
      ipRequests.push(req);
    }

    Promise.all(ipRequests)
      .then((values) => {
        const hasValue = values.some((a) => a.status === 403);
        if (hasValue) {
          done('Error');
        } else {
          done();
        }
      })
      .catch(done);
  });

  it('should NOT return 403 before 99 request for token', (done) => {
    const tokenRequest = [];
    for (let i = 0; i < 99; i++) {
      const req = request(app.getHttpServer())
        .get('/private')
        .set('Authorization', 'Agha');
      tokenRequest.push(req);
    }

    Promise.all(tokenRequest)
      .then((values) => {
        const hasValue = values.some((a) => a.status === 403);
        if (hasValue) {
          done('Error');
        } else {
          done();
        }
      })
      .catch(done);
  });

  it('should return 403 after 200 request for token', (done) => {
    const tokenRequest = [];

    for (let i = 0; i < 102; i++) {
      const req = request(app.getHttpServer())
        .get('/private')
        .set('Authorization', 'Agha');
      tokenRequest.push(req);
    }

    Promise.all(tokenRequest)
      .then((values) => {
        const hasValue = values.some((a) => a.status === 403);
        if (hasValue) {
          done('Error');
        }
      })
      .catch(done);

    setTimeout(() => {
      tokenRequest.length = 0;
      for (let i = 0; i < 102; i++) {
        const req = request(app.getHttpServer())
          .get('/private')
          .set('Authorization', 'Agha');
        tokenRequest.push(req);
      }
      Promise.all(tokenRequest)
        .then((values) => {
          const hasValue = values.some((a) => a.status === 403);

          if (hasValue) {
            done();
          } else {
            done('Error');
          }
        })
        .catch(done);
    }, 2000);
  });
});
