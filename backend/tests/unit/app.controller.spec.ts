import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return hello world', () => {
    const result = controller.getHello();
    expect(result).toBe('Hello World!');
  });

  it('should call service getHello method', () => {
    const serviceSpy = jest.spyOn(service, 'getHello');
    controller.getHello();
    expect(serviceSpy).toHaveBeenCalled();
  });
});
