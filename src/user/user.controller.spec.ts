import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let rabbitMQService: RabbitMQService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getUser: jest.fn(),
            getUserAvatar: jest.fn(),
            deleteUserAvatar: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            publishUserCreated: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('createUser', () => {
    it('should create a user and emit a RabbitMQ event', async () => {
      const createUserDto = { name: 'John Doe', email: 'john.doe@mail.com', job: 'Software Engineer' };
      const createdUser = { id: '1', ...createUserDto };

      jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser as any);
      jest.spyOn(rabbitMQService, 'publishUserCreated').mockResolvedValue(undefined);

      const result = await controller.createUser(createUserDto);
      expect(result).toEqual(createdUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(rabbitMQService.publishUserCreated).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('getUser', () => {
    it('should return user data', async () => {
      const userId = '1';
      const user = { id: userId, name: 'John Doe' };

      jest.spyOn(userService, 'getUser').mockResolvedValue(user);

      const result = await controller.getUser(userId);
      expect(result).toEqual(user);
      expect(userService.getUser).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '2';
      jest.spyOn(userService, 'getUser').mockRejectedValue(new NotFoundException());

      await expect(controller.getUser(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserAvatar', () => {
    it('should return base64-encoded avatar image', async () => {
      const userId = '1';
      const base64Image = 'base64encodedimage';

      jest.spyOn(userService, 'getUserAvatar').mockResolvedValue(base64Image);

      const result = await controller.getUserAvatar(userId);
      expect(result).toBe(base64Image);
      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete user avatar', async () => {
      const userId = '1';

      jest.spyOn(userService, 'deleteUserAvatar').mockResolvedValue(undefined);

      await controller.deleteUserAvatar(userId);
      expect(userService.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if avatar is not found', async () => {
      const userId = '2';
      jest.spyOn(userService, 'deleteUserAvatar').mockRejectedValue(new NotFoundException());

      await expect(controller.deleteUserAvatar(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
