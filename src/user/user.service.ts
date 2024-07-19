import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Avatar } from './schemas/avatar.schema';
import { HttpService } from '@nestjs/axios';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { createHash } from 'crypto';
import { lastValueFrom } from 'rxjs';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import { join } from 'path';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
    private httpService: HttpService,
    private rabbitMQService: RabbitMQService,
    private mailerService: MailerService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();

    try {
      await this.mailerService.sendMail({
        to: createdUser.email,
        subject: 'Welcome!',
        text: 'Your account has been created.',
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    await this.rabbitMQService.publishUserCreated(createdUser);

    return createdUser;
  }

  async getUser(userId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`https://reqres.in/api/users/${userId}`)
      );
      return response.data;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserAvatar(userId: string): Promise<string> {
    const existingAvatar = await this.avatarModel.findOne({ userId });
    if (existingAvatar) {
      return existingAvatar.image;
    }

    const user = await this.getUser(userId);
    const avatarUrl = user.data.avatar;
    const imageResponse = await lastValueFrom(
      this.httpService.get(avatarUrl, { responseType: 'arraybuffer' })
    );
    const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
    const imageHash = createHash('sha256').update(imageBase64).digest('hex');

    const filePath = join(__dirname, '../../avatars', `${userId}.txt`);
    fs.writeFileSync(filePath, imageBase64);

    const newAvatar = new this.avatarModel({ userId, hash: imageHash, image: imageBase64 });
    await newAvatar.save();

    return imageBase64;
  }

  async deleteUserAvatar(userId: string): Promise<void> {
    const avatar = await this.avatarModel.findOne({ userId });
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }

    const filePath = join(__dirname, '../../avatars', `${userId}.txt`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.avatarModel.deleteOne({ userId }).exec();
  }
}
