import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly rabbitMQService: RabbitMQService) {}
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const createdUser = await this.userService.createUser(createUserDto);
    await this.rabbitMQService.publishUserCreated(createdUser);
    return createdUser;
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string): Promise<any> {
    return this.userService.getUser(userId);
  }

  @Get(':userId/avatar')
  async getUserAvatar(@Param('userId') userId: string): Promise<string> {
    return this.userService.getUserAvatar(userId);
  }

  @Delete(':userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: string): Promise<void> {
    return this.userService.deleteUserAvatar(userId);
  }
}
