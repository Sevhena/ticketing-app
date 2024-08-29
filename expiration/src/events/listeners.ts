import { Listener, OrderCreatedEvent, Subjects } from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - Date.now();
    console.log(`Waiting ${delay}ms to process job`);

    await expirationQueue.add(
      {
        orderId: data.id
      },
      {
        delay
      }
    );

    msg.ack();
  }
}
