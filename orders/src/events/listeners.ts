import {
  Listener,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent
} from '@svraven/tks-common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../models/ticket';

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

    ticket.set({ title, price, version });

    await ticket.save();

    msg.ack();
  }
}
