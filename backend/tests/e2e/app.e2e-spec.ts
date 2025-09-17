import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2ETestHelper } from '../utils/e2e-setup';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await E2ETestHelper.createTestApp();
  });

  afterAll(async () => {
    await E2ETestHelper.closeTestApp(app);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
