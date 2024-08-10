import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
  TicketDeletedEvent,
  TicketUpdatedEvent
} from '@svraven/tks-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated;
}

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: TicketUpdatedEvent['subject'] = Subjects.TicketUpdated;
}

export class TicketDeletedPublisher extends Publisher<TicketDeletedEvent> {
  subject: TicketDeletedEvent['subject'] = Subjects.TicketDeleted;
}
