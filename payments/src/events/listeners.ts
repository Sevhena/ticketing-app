import {
  ExpirationCompleteEvent,
  Listener,
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
  PaymentStatus,
  Subjects
} from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { stripe } from '../stripe';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    await Order.build({
      id: data.id,
      orderStatus: data.orderStatus,
      expiresAt: new Date(data.expiresAt),
      version: data.version,
      userId: data.userId,
      price: data.ticket.price,
      ticket: data.ticket.title
    }).save();

    msg.ack();
  }
}

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: ExpirationCompleteEvent['subject'] = Subjects.ExpirationComplete;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const payment = await Payment.findOne({
      orderId: data.orderId,
      status: PaymentStatus.Pending
    });

    if (payment) {
      console.log('Expiring checkout session...');
      await stripe.checkout.sessions.expire(payment.stripeSessionId);
    }

    msg.ack();
  }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: OrderCancelledEvent['subject'] = Subjects.OrderCancelled;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findById(data.id);

    if (!order) {
      throw new Error('Order not found');
    }

    const payment = await Payment.findOne({
      orderId: order.id,
      status: PaymentStatus.Pending
    });

    await order.set({ orderStatus: OrderStatus.Cancelled }).save();

    if (payment) {
      await payment.set({ status: PaymentStatus.Cancelled }).save();
    }

    msg.ack();
  }
}
