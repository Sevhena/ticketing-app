import {
  Listener,
  OrderCancelledEvent,
  OrderCreatedEvent,
  Subjects
} from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../models/ticket';
import { createTicketEvent } from '../utils/create-ticket-event';
import { eventsEmitter } from './events-emitter';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    await ticket.set({ orderId: data.id }).save();

    // Publish an event
    await createTicketEvent(Subjects.TicketUpdated, ticket).save();
    eventsEmitter.emitTicketEvent();

    // ack the message
    msg.ack();
  }
}

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: OrderCancelledEvent['subject'] = Subjects.OrderCancelled;
  queueGroupName = process.env.QUEUE_GROUP_NAME as string;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find the ticket of the cancelled order
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being available
    await ticket.set({ orderId: undefined }).save();

    // Publish an event
    await createTicketEvent(Subjects.TicketUpdated, ticket).save();
    eventsEmitter.emitTicketEvent();

    // ack the message
    msg.ack();
  }
}
