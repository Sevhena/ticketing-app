import {
  AbstractEventHandler,
  Subjects,
  TicketEvent
} from '@svraven/tks-common';
import {
  TicketCreatedPublisher,
  TicketUpdatedPublisher,
  TicketDeletedPublisher
} from './publishers';
import { natsWrapper } from './nats-wrapper';
import { TicketEventDoc } from '../models/ticket-event';

export class TicketEventHandler extends AbstractEventHandler<
  TicketEvent,
  TicketEventDoc
> {
  selectPublisher(subject: Subjects) {
    switch (subject) {
      case Subjects.TicketCreated:
        return new TicketCreatedPublisher(natsWrapper.client);
      case Subjects.TicketUpdated:
        return new TicketUpdatedPublisher(natsWrapper.client);
      case Subjects.TicketDeleted:
        return new TicketDeletedPublisher(natsWrapper.client);
      default:
        throw new Error('Publisher not defined');
    }
  }
}
