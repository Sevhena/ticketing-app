import { EventStatus, Subjects } from '@svraven/tks-common';
import { TicketEvent } from '../models/internal-ticket-event';
import { TicketDoc } from '../models/ticket';

export const createTicketEvent = (subject: Subjects, ticket: TicketDoc) => {
  return TicketEvent.build({
    subject,
    status: EventStatus.PENDING,
    data: {
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      id: ticket.id,
      version: ticket.version,
      orderId: ticket.orderId
    }
  });
};
