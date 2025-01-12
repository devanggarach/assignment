import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerUserGuard } from '../src/guards/throttler-user.guard';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockAppService = {
      getAll: jest.fn().mockReturnValue('Assignment is Live'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    })
      .overrideGuard(ThrottlerUserGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getAll', () => {
    it('should return "Assignment is Live"', () => {
      const result = appController.getAll();
      expect(result).toBe('Assignment is Live');
    });
  });
});
