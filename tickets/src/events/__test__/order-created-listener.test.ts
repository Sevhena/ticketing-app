import { OrderCreatedEvent, OrderStatus, Subjects } from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../models/ticket';
import { OrderCreatedListener } from '../listeners';
import { natsWrapper } from '../nats-wrapper';
import mongoose from 'mongoose';
import { TicketEvent } from '../../models/ticket-event';
import { eventsEmitter } from '../events-emitter';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'jkfld'
  });

  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'lndsjbsd',
    orderStatus: OrderStatus.Created,
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

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
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
