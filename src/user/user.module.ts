import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Avatar.name, schema: AvatarSchema }]),
    HttpModule,
    RabbitMQModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
