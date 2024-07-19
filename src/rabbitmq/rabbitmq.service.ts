import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URI') || 'amqp://localhost'],
        queue: 'main_queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async publishUserCreated(user: any) {
    return await this.client.emit('user_created', user).toPromise();
  }
}
