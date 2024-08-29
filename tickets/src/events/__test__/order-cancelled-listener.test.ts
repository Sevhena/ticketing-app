import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
  Subjects
} from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../models/ticket';
import { OrderCancelledListener } from '../listeners';
import { natsWrapper } from '../nats-wrapper';
import mongoose from 'mongoose';
import { TicketEvent } from '../../models/ticket-event';
import { eventsEmitter } from '../events-emitter';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'jkfld'
  });

  ticket.set({ orderId });

  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    userId: 'lndsjbsd',
    orderStatus: OrderStatus.Cancelled,
    expiresAt: 'bfkjdf',
    ticket: {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket as undefined', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('creates a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticketEvent = await TicketEvent.findOne({
    subject: Subjects.TicketUpdated,
    'data.id': ticket.id,
    'data.version': ticket.version
  });

  expect(ticketEvent).toBeDefined();
});

it('emits a newTicket event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(eventsEmitter.emitTicketEvent).toHaveBeenCalled();
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
