import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export class TestHelpers {
  static async makeRequest(
    app: INestApplication,
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    body?: any,
  ) {
    const agent = request(app.getHttpServer());

    switch (method.toLowerCase()) {
      case 'get':
        return agent.get(url);
      case 'post':
        return agent.post(url).send(body);
      case 'put':
        return agent.put(url).send(body);
      case 'delete':
        return agent.delete(url);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  static expectValidUuid(value: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(value).toMatch(uuidRegex);
  }

  static expectValidEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(email).toMatch(emailRegex);
  }

  static expectValidDate(dateString: string): void {
    const date = new Date(dateString);
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).not.toBeNaN();
  }

  static createMockFile(
    filename: string = 'test.pdf',
    content: string = 'test content',
  ): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: content.length,
      buffer: Buffer.from(content),
      destination: '',
      filename: filename,
      path: '',
      stream: null as any,
    };
  }
}
