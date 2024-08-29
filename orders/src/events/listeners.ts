import {
  AwaitingPaymentEvent,
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
  TicketCreatedEvent,
  TicketDeletedEvent,
  TicketUpdatedEvent
} from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { createOrderEvent } from '../utils/create-order-event';
import { eventsEmitter } from './events-emitter';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price, version } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
      version
    });

    await ticket.save();

    msg.ack();
  }
}

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: TicketUpdatedEvent['subject'] = Subjects.TicketUpdated;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { price, title, version } = data;
    const ticket = await Ticket.findCurrent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    await ticket.set({ title, price, version }).save();

    msg.ack();
  }
}

export class TicketDeleteListener extends Listener<TicketDeletedEvent> {
  subject: TicketDeletedEvent['subject'] = Subjects.TicketDeleted;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: TicketDeletedEvent['data'], msg: Message) {
    const ticket = await Ticket.findCurrent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    await ticket.set({ active: false }).save();

    msg.ack();
  }
}

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: ExpirationCompleteEvent['subject'] = Subjects.ExpirationComplete;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.orderStatus === OrderStatus.Complete) {
      msg.ack();
      return;
    }

    await order.set({ orderStatus: OrderStatus.Cancelled }).save();

    await createOrderEvent(order, Subjects.OrderCancelled).save();
    eventsEmitter.emitOrderEvent();

    msg.ack();
  }
}

export class AwaitingPaymentListener extends Listener<AwaitingPaymentEvent> {
  subject: AwaitingPaymentEvent['subject'] = Subjects.AwaitingPayment;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: AwaitingPaymentEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.orderStatus === OrderStatus.Cancelled) {
      msg.ack();
      return;
    }

    await order.set({ orderStatus: OrderStatus.AwaitingPayment }).save();

    msg.ack();
  }
}

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: PaymentCreatedEvent['subject'] = Subjects.PaymentCreated;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    await order.set({ orderStatus: OrderStatus.Complete }).save();

    msg.ack();
  }
}
